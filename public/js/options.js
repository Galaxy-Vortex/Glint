document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const optionsDropdown = document.getElementById('options-dropdown');
  const searchEngineRadios = document.querySelectorAll('input[name="dropdown-search-engine"]');
  const wispInput = document.getElementById('input-wisp');
  const tabCloakBtn = document.getElementById('tab-cloak-btn');
  const themeOptionsContainer = document.getElementById('theme-options-container');

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
  if (!localStorage.getItem('glint_theme')) {
    localStorage.setItem('glint_theme', 'dark');
  }
  if (!localStorage.getItem('glint_wisp')) {
    localStorage.setItem('glint_wisp', '');
  }

  function populateThemes() {
    if (!themeOptionsContainer || !window.themes) return;
    
    const savedTheme = localStorage.getItem('glint_theme') || 'dark';
    themeOptionsContainer.innerHTML = '';
    
    Object.keys(window.themes).forEach(themeKey => {
      const theme = window.themes[themeKey];
      const accent = theme.colors['--accent'];
      const btn = document.createElement('button');
      btn.className = 'theme-circle' + (themeKey === savedTheme ? ' active' : '');
      btn.dataset.theme = themeKey;
      btn.title = theme.name;
      btn.style.background = accent;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.theme-circle').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        localStorage.setItem('glint_theme', themeKey);
        if (window.applyTheme) {
          window.applyTheme(themeKey);
        }
      });
      themeOptionsContainer.appendChild(btn);
    });
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

  function handleThemeChange(event) {
    const selectedTheme = event.target.value;
    localStorage.setItem('glint_theme', selectedTheme);
    if (window.applyTheme) {
      window.applyTheme(selectedTheme);
    }
  }

  function handleWispChange(event) {
    const wispValue = event.target.value.trim();
    localStorage.setItem('glint_wisp', wispValue);
    updateGlobalSettings();
  }

  function loadSettings() {
    const savedSearchEngine = localStorage.getItem('glint_search_engine') || 'duckduckgo';
    const savedWisp = localStorage.getItem('glint_wisp') || '';

    searchEngineRadios.forEach(radio => {
      radio.checked = false;
    });
    const radioToCheck = document.getElementById(`dropdown-${savedSearchEngine}`);
    if (radioToCheck) {
      radioToCheck.checked = true;
    }

    wispInput.value = savedWisp;

    updateGlobalSettings();
  }

  function updateGlobalSettings() {
    window.glintSettings = window.glintSettings || {};
    window.glintSettings.searchEngine = localStorage.getItem('glint_search_engine') || 'duckduckgo';
    window.glintSettings.searchEngines = searchEngines;
    window.glintSettings.wisp = localStorage.getItem('glint_wisp') || '';

    window.dispatchEvent(new CustomEvent('glint:settings-updated'));
  }

  function getCurrentTab() {
    if (window.activeTabId && window.tabs && window.tabs[window.activeTabId]) {
      return window.tabs[window.activeTabId];
    }
    return null;
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

  wispInput.addEventListener('input', handleWispChange);

  if (tabCloakBtn) {
    tabCloakBtn.addEventListener('click', activateTabCloak);
  }

  if (window.themes) {
    populateThemes();
  } else {
    window.addEventListener('load', populateThemes);
  }

  loadSettings();
});
