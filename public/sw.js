importScripts("/scram/scramjet.all.js");

if (navigator.userAgent.includes("Firefox")) {
  Object.defineProperty(globalThis, "crossOriginIsolated", {
    value: true,
    writable: true
  });
}

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();
let configLoaded = false;

(async function () {
  try {
    await scramjet.loadConfig();
    configLoaded = true;
  } catch (e) {
    console.error('scramjet config load failed:', e);
  }
})();

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

async function handleRequest(event) {
  const url = new URL(event.request.url);
  
  if (event.request.url.includes('favicon.ico') || 
      event.request.url.includes('apple-touch-icon') ||
      event.request.destination === 'favicon') {
    try {
      if (scramjet.route && scramjet.route(event)) {
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
      console.error('favicon request error:', e);
    }
    
    return new Response(null, { status: 404 });
  }

  if (url.pathname.startsWith('/scramjet/')) {
    try {
      if (!configLoaded) {
        await new Promise((resolve) => {
          const checkConfig = setInterval(() => {
            if (configLoaded) {
              clearInterval(checkConfig);
              resolve();
            }
          }, 50);
          
          setTimeout(() => {
            clearInterval(checkConfig);
            resolve();
          }, 5000);
        });
      }
      
      if (scramjet && scramjet.fetch) {
        return await scramjet.fetch(event);
      }
      
      if (scramjet && scramjet.route && scramjet.route(event)) {
        return await scramjet.fetch(event);
      }
      
      return new Response('Scramjet proxy not available', { 
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    } catch (e) {
      console.error('scramjet request error:', e);
      return new Response('Proxy error: ' + e.message, { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }

  if (scramjet.route && scramjet.route(event)) {
    try {
      return await scramjet.fetch(event);
    } catch (e) {
      console.error('scramjet fetch error:', e);
    }
  }

  return await fetch(event.request);
}

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});
