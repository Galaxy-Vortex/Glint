import { createServer } from "node:http";
import { join } from "node:path";
import { hostname } from "node:os";
import wisp from "wisp-server-node";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "node:url";
import path from "node:path";

// UV and proxy dependencies
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

// Resolve directory paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

// Environment variables with fallbacks
// Note: Using 0.0.0.0 instead of localhost makes it accessible on LAN
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'production';

// Create Fastify instance with custom server factory
// This is needed to handle both HTTP requests and WebSocket upgrades
const fastify = Fastify({
	serverFactory: (handler) => {
		return createServer()
			.on("request", (req, res) => {
				// These headers enable SharedArrayBuffer and cross-origin isolation
				// Required for some web APIs to work properly through the proxy
				res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
				res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
				handler(req, res);
			})
			.on("upgrade", (req, socket, head) => {
				// Handle WebSocket upgrades for WISP protocol
				// FIXME: Sometimes connections drop after ~30 seconds - investigate
				if (req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
				else socket.end();
			});
	},
	// Only enable logging in development mode to keep production logs clean
	logger: NODE_ENV === 'development'
});

fastify.register(fastifyStatic, {
	root: publicDir,
	prefix: "/",
	decorateReply: true,
	cacheControl: true,
	maxAge: NODE_ENV === 'development' ? 0 : 3600000,
	immutable: false,
	etag: true,
	lastModified: true,
});

// Main route - serves our browser interface
fastify.get("/", (req, reply) => {
	return reply.sendFile("index.html", publicDir);
});

fastify.get("/favicon-proxy", async (req, reply) => {
	try {
		const { url } = req.query;
		
		if (!url) {
			return reply.code(400).send({ error: 'URL parameter is required' });
		}
		
		const validServices = [
			'www.google.com/s2/favicons',
			'icons.duckduckgo.com/ip3',
			'favicons.githubusercontent.com'
		];
		
		const urlObj = new URL(url);
		const isValidService = validServices.some(service => 
			urlObj.hostname + urlObj.pathname.split('/')[1] === service.split('/')[0] ||
			urlObj.href.includes(service)
		);
		
		if (!isValidService) {
			return reply.code(403).send({ error: 'Invalid favicon service' });
		}
		
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Glint-Browser/1.0',
				'Accept': 'image/*,*/*;q=0.8'
			},
			timeout: 5000
		});
		
		if (!response.ok) {
			return reply.code(response.status).send({ error: 'Failed to fetch favicon' });
		}
		
		const contentType = response.headers.get('content-type') || 'image/x-icon';
		const imageBuffer = await response.arrayBuffer();
		
		reply.header('Content-Type', contentType);
		reply.header('Cache-Control', 'public, max-age=86400');
		reply.header('Access-Control-Allow-Origin', '*');
		
		return reply.send(Buffer.from(imageBuffer));
		
	} catch (error) {
		console.error('Favicon proxy error:', error);
		return reply.code(500).send({ error: 'Internal server error' });
	}
});


// Epoxy transport (encrypted proxy data)
fastify.register(fastifyStatic, {
	root: epoxyPath,
	prefix: "/epoxy/",
	decorateReply: false,
});

// Baremux client scripts
fastify.register(fastifyStatic, {
	root: baremuxPath,
	prefix: "/baremux/",
	decorateReply: false,
});

// Custom error handler to prevent leaking stack traces in production
fastify.setErrorHandler((error, request, reply) => {
	fastify.log.error(error);
	reply.status(500).send({ error: 'Internal Server Error' });
});

// Graceful shutdown handler
// This ensures we close all connections properly when terminating
async function shutdown() {
	try {
		await fastify.close();
		process.exit(0);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

fastify.listen({ port: PORT, host: HOST }, (err) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}

	const address = fastify.server.address();
	console.log(`Server running in ${NODE_ENV} mode`);
	console.log(`Listening on:`);
	console.log(`\thttp://localhost:${address.port}`);
	console.log(`\thttp://${hostname()}:${address.port}`);
	if (address.family === 'IPv6') {
		console.log(`\thttp://[${address.address}]:${address.port}`);
	} else {
		console.log(`\thttp://${address.address}:${address.port}`);
	}
});
