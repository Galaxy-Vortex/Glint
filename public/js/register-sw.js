if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js', {});
    } catch (err) {
      console.error('sw registration failed:', err);
    }
  });
}
