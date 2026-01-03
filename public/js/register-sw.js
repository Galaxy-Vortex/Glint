if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none'
      });
      
      setInterval(() => {
        registration.update();
      }, 30 * 60 * 1000);
    } catch (err) {
      console.error('sw registration failed:', err);
    }
  });
}
