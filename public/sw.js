importScripts("/scram/scramjet.all.js");


if (navigator.userAgent.includes("Firefox")) {
	Object.defineProperty(globalThis, "crossOriginIsolated", {
		value: true,
		writable: true,
	})
}

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();
(async function () {
	await scramjet.loadConfig();
})();

self.addEventListener("install", () => {
	self.skipWaiting()
})


async function handleRequest(event) {
	if (event.request.url.includes('favicon.ico') || 
	    event.request.url.includes('apple-touch-icon') ||
	    event.request.destination === 'favicon') {
		try {
			if (scramjet.route(event)) {
				const response = await scramjet.fetch(event);
				if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
					return response;
				}
			}
			
			const directResponse = await fetch(event.request);
			if (directResponse.ok && directResponse.headers.get('content-type')?.startsWith('image/')) {
				return directResponse;
			}
		} catch (e) {
		}
		
		return new Response(null, { status: 404 });
	}

	if (scramjet.route(event)) 
		return scramjet.fetch(event)

	return await fetch(event.request)
}

self.addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event))
})
