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
	if (scramjet.route(event)) 
		return scramjet.fetch(event)

	return await fetch(event.request)
}

self.addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event))
})
