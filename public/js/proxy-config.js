function solveSimpleChallenge(challenge) {
  try {
    if (typeof challenge === 'string') {
      return challenge;
    }
    if (typeof challenge === 'function') {
      return challenge();
    }
    if (typeof challenge === 'object') {
      return JSON.stringify(challenge);
    }
    return String(challenge);
  } catch (err) {
    console.error('Error solving challenge:', err);
    return '';
  }
}

async function initUVServiceWorker() {
  try {
    if (!navigator.serviceWorker) {
      throw new Error('Service workers are not supported in this browser.');
    }

    await navigator.serviceWorker.register('/sw.js', {});

    console.log('UV service worker registered successfully');
    return true;
  } catch (err) {
    console.error('Failed to register UV service worker:', err);
    return false;
  }
}

async function initBaremuxConnection() {
  try {
    if (!window.BareMux) {
      throw new Error('BareMux is not available');
    }

    const connection = new BareMux.BareMuxConnection('/baremux/worker.js');

    const wispUrl = (location.protocol === 'https:' ? 'wss' : 'ws') +
      '://' + location.host + '/wisp/';

    if (await connection.getTransport() !== '/epoxy/index.mjs') {
      await connection.setTransport('/epoxy/index.mjs', [{ wisp: wispUrl }]);
      console.log('Epoxy transport configured successfully');
    }

    return connection;
  } catch (err) {
    console.error('Failed to initialize Baremux connection:', err);
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
      console.warn('Service worker registration failed, proxy functionality may be limited');
    }

    const baremuxConnection = await initBaremuxConnection();

    if (!baremuxConnection) {
      console.warn('Baremux connection failed, proxy functionality may be limited');
    }

    window.proxyUtils = {
      encodeURL,
      baremuxConnection,
      solveSimpleChallenge
    };

    console.log('Proxy configuration completed successfully');
  } catch (err) {
    console.error('Error during proxy initialization:', err);
  }
}); 
