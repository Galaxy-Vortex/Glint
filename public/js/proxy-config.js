function solveSimpleChallenge(challenge) {
  try {
    if (typeof challenge === 'string') return challenge;
    if (typeof challenge === 'function') return challenge();
    if (typeof challenge === 'object') return JSON.stringify(challenge);
    return String(challenge);
  } catch (err) {
    console.error('challenge solve error:', err);
    return '';
  }
}

async function initUVServiceWorker() {
  try {
    if (!navigator.serviceWorker) {
      throw new Error('Service workers not supported');
    }

    if (!navigator.serviceWorker.controller) {
      await navigator.serviceWorker.ready;
    }
    return true;
  } catch (err) {
    console.error('sw ready check failed:', err);
    return false;
  }
}

async function initBaremuxConnection() {
  try {
    if (!window.BareMux) {
      throw new Error('BareMux not available');
    }

    const connection = new BareMux.BareMuxConnection('/baremux/worker.js');
    const wispUrl = (location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host + '/wisp/';

    if (await connection.getTransport() !== '/epoxy/index.mjs') {
      await connection.setTransport('/epoxy/index.mjs', [{ wisp: wispUrl }]);
    }

    return connection;
  } catch (err) {
    console.error('baremux connection failed:', err);
    return null;
  }
}

function encodeURL(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.') && !url.includes(' ')) {
      url = 'https://' + url;
    } else {
      url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
    }
  }
  return scramjet.encodeUrl(url);
}

window.addEventListener('load', async () => {
  try {
    const swRegistered = await initUVServiceWorker();
    if (!swRegistered) {
      console.warn('sw registration failed');
    }

    const baremuxConnection = await initBaremuxConnection();
    if (!baremuxConnection) {
      console.warn('baremux connection failed');
    }

    window.proxyUtils = {
      encodeURL,
      baremuxConnection,
      solveSimpleChallenge
    };
  } catch (err) {
    console.error('proxy init error:', err);
  }
});
