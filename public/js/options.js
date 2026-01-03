document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const optionsDropdown = document.getElementById('options-dropdown');
  const searchEngineRadios = document.querySelectorAll('input[name="dropdown-search-engine"]');
  const tabCloakBtn = document.getElementById('tab-cloak-btn');

  const searchEngines = {
    google: 'https://www.google.com/search?q=%s',
    bing: 'https://www.bing.com/search?q=%s',
    duckduckgo: 'https://duckduckgo.com/?q=%s',
    yahoo: 'https://search.yahoo.com/search?p=%s'
  };

  let isDropdownOpen = false;

  if (!localStorage.getItem('glint_search_engine')) {
    localStorage.setItem('glint_search_engine', 'duckduckgo');
  }

  function toggleDropdown(event) {
    event.stopPropagation();
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  function openDropdown() {
    optionsDropdown.style.display = 'block';
    isDropdownOpen = true;
  }

  function closeDropdown() {
    optionsDropdown.style.display = 'none';
    isDropdownOpen = false;
  }

  function handleOutsideClick(event) {
    if (isDropdownOpen && !optionsDropdown.contains(event.target) && !menuBtn.contains(event.target)) {
      closeDropdown();
    }
  }

  function handleSearchEngineChange(event) {
    const selectedEngine = event.target.value;
    localStorage.setItem('glint_search_engine', selectedEngine);
    updateGlobalSettings();
  }

  function loadSettings() {
    const savedSearchEngine = localStorage.getItem('glint_search_engine') || 'duckduckgo';

    searchEngineRadios.forEach(radio => {
      radio.checked = false;
    });
    const radioToCheck = document.getElementById(`dropdown-${savedSearchEngine}`);
    if (radioToCheck) {
      radioToCheck.checked = true;
    }

    updateGlobalSettings();
  }

  function updateGlobalSettings() {
    window.glintSettings = window.glintSettings || {};
    window.glintSettings.searchEngine = localStorage.getItem('glint_search_engine') || 'duckduckgo';
    window.glintSettings.searchEngines = searchEngines;

    window.dispatchEvent(new CustomEvent('glint:settings-updated'));
  }

  function activateTabCloak() {
    const currentUrl = window.location.href;
    const newWindow = window.open('about:blank', '_blank');

    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google</title>
          <link rel="icon" href="https://www.google.com/favicon.ico">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { height: 100%; width: 100%; overflow: hidden; }
            iframe { 
              width: 100%; 
              height: 100%; 
              border: none; 
              position: fixed;
              top: 0;
              left: 0;
            }
          </style>
        </head>
        <body>
          <iframe src="${currentUrl}" allowfullscreen></iframe>
        </body>
        </html>
      `);
      newWindow.document.close();
      window.close();
    }
  }

  menuBtn.addEventListener('click', toggleDropdown);
  document.addEventListener('click', handleOutsideClick);

  searchEngineRadios.forEach(radio => {
    radio.addEventListener('change', handleSearchEngineChange);
  });

  if (tabCloakBtn) {
    tabCloakBtn.addEventListener('click', activateTabCloak);
  }

  loadSettings();
});
