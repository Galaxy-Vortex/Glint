if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/uv/sw.js', {
        scope: '/uv/'
      });
      console.log('ServiceWorker registration successful with scope:', registration.scope);
    } catch (err) {
      console.error('ServiceWorker registration failed:', err);
    }
  });
} 