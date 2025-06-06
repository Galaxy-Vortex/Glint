document.addEventListener('DOMContentLoaded', () => {
  const mainSearchInput = document.querySelector('.main-search-input');
  
  mainSearchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const searchTerm = mainSearchInput.value.trim();
      if (searchTerm) {
        window.dispatchEvent(new CustomEvent('glint:search', {
          detail: { searchTerm }
        }));
      }
    }
  });

  mainSearchInput.addEventListener('focus', () => {
    mainSearchInput.classList.add('focused');
  });

  mainSearchInput.addEventListener('blur', () => {
    mainSearchInput.classList.remove('focused');
  });
}); 