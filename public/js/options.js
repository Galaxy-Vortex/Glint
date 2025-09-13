
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const optionsDropdown = document.getElementById('options-dropdown');
  
  const searchEngineRadios = document.querySelectorAll('input[name="dropdown-search-engine"]');
  const wispInput = document.getElementById('input-wisp');

  const searchEngines = {
    google: 'https://www.google.com/search?q=%s',
    bing: 'https://www.bing.com/search?q=%s',
    duckduckgo: 'https://duckduckgo.com/?q=%s',
    yahoo: 'https://search.yahoo.com/search?p=%s'
  };

  let isDropdownOpen = false;

  // Default settings if none exist
  if (!localStorage.getItem('glint_search_engine')) {
    localStorage.setItem('glint_search_engine', 'duckduckgo');
  }
  if (!localStorage.getItem('glint_wisp')) {
    localStorage.setItem('glint_wisp', '');
  }

  loadSettings();

  // Dropdown toggle
  menuBtn.addEventListener('click', toggleDropdown);
  document.addEventListener('click', handleOutsideClick);
  
  // Search engine change
  searchEngineRadios.forEach(radio => {
    radio.addEventListener('change', handleSearchEngineChange);
  });

  // Wisp input change
  wispInput.addEventListener('input', handleWispChange);

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

  function handleWispChange(event) {
    const wispValue = event.target.value.trim();
    localStorage.setItem('glint_wisp', wispValue);
    updateGlobalSettings();
  }

  function loadSettings() {
    const savedSearchEngine = localStorage.getItem('glint_search_engine') || 'duckduckgo';
    const savedWisp = localStorage.getItem('glint_wisp') || '';

    // Set search engine radio
    searchEngineRadios.forEach(radio => {
      radio.checked = false;
    });
    const radioToCheck = document.getElementById(`dropdown-${savedSearchEngine}`);
    if (radioToCheck) {
      radioToCheck.checked = true;
    }

    // Set wisp input
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
});

