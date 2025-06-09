document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const optionsMenu = document.getElementById('options-menu');
  const optionsOverlay = document.getElementById('options-overlay');
  const closeOptionsBtn = document.querySelector('.close-options');
  const saveOptionsBtn = document.querySelector('.save-options');
  const customSearchInput = document.getElementById('custom-search-url');
  const searchEngineRadios = document.querySelectorAll('input[name="search-engine"]');
  const customSearchRadio = document.getElementById('search-custom');
  const aboutBlankBtn = document.getElementById('about-blank-button');

  const searchEngines = {
    google: 'https://www.google.com/search?q=%s',
    bing: 'https://www.bing.com/search?q=%s',
    duckduckgo: 'https://duckduckgo.com/?q=%s',
    yahoo: 'https://search.yahoo.com/search?p=%s',
    blank: 'about:blank',
    custom: ''
  };

  loadSettings();

  menuBtn.addEventListener('click', openOptionsMenu);
  closeOptionsBtn.addEventListener('click', closeOptionsMenu);
  optionsOverlay.addEventListener('click', closeOptionsMenu);
  saveOptionsBtn.addEventListener('click', saveSettings);

  aboutBlankBtn.addEventListener('click', openAboutBlankCloak);

  customSearchRadio.addEventListener('change', () => {
    if (customSearchRadio.checked) {
      customSearchInput.focus();
    }
  });

  customSearchInput.addEventListener('focus', () => {
    customSearchRadio.checked = true;
  });

  function openOptionsMenu() {
    optionsMenu.style.display = 'flex';
    optionsOverlay.classList.remove('hidden');
  }

  function closeOptionsMenu() {
    optionsMenu.style.display = 'none';
    optionsOverlay.classList.add('hidden');
  }

  function openAboutBlankCloak() {
    try {
      const currentTab = getCurrentTab();
      const currentUrl = currentTab ? currentTab.url : window.location.href;

      const win = window.open('about:blank', '_blank');

      if (!win || win.closed) {
        showNotification('Popup blocked. Please allow popups and try again.', 'error');
        return;
      }

      setTimeout(() => {
        try {
          let urlToLoad = currentUrl;
          if (window.proxyUtils && window.proxyUtils.encodeURL) {
            urlToLoad = window.proxyUtils.encodeURL(currentUrl);
          }

          win.document.body.style.margin = '0';
          win.document.body.style.padding = '0';
          win.document.body.style.overflow = 'hidden';

          const iframe = win.document.createElement('iframe');
          iframe.style.width = '100vw';
          iframe.style.height = '100vh';
          iframe.style.border = 'none';
          iframe.style.position = 'absolute';
          iframe.style.top = '0';
          iframe.style.left = '0';
          iframe.src = urlToLoad;

          win.document.body.appendChild(iframe);

          win.document.title = 'about:blank';

          showNotification('Successfully opened in about:blank cloak');
        } catch (err) {
          console.error('Error setting up about:blank iframe:', err);
          showNotification('Error setting up about:blank iframe', 'error');
        }
      }, 100);

      closeOptionsMenu();
    } catch (err) {
      console.error('Error opening about:blank:', err);
      showNotification('Failed to open in about:blank. Check popup settings.', 'error');
    }
  }

  function getCurrentTab() {
    if (window.activeTabId && window.tabs && window.tabs[window.activeTabId]) {
      return window.tabs[window.activeTabId];
    }
    return null;
  }

  function loadSettings() {
    const savedSearchEngine = localStorage.getItem('glint_search_engine') || 'google';
    const customSearchUrl = localStorage.getItem('glint_custom_search_url') || '';

    customSearchInput.value = customSearchUrl;

    searchEngines.custom = customSearchUrl;

    const radioToCheck = document.getElementById(`search-${savedSearchEngine}`);
    if (radioToCheck) {
      radioToCheck.checked = true;
    }

    updateGlobalSearchSettings();
  }

  function saveSettings() {
    let selectedEngine = 'google';

    for (const radio of searchEngineRadios) {
      if (radio.checked) {
        selectedEngine = radio.value;
        break;
      }
    }

    if (selectedEngine === 'custom') {
      const customUrl = customSearchInput.value.trim();
      if (customUrl) {
        localStorage.setItem('glint_custom_search_url', customUrl);
        searchEngines.custom = customUrl;
      } else {
        selectedEngine = 'google';
      }
    }

    localStorage.setItem('glint_search_engine', selectedEngine);

    updateGlobalSearchSettings();

    closeOptionsMenu();

    showNotification('Settings saved successfully');
  }

  function updateGlobalSearchSettings() {
    window.glintSettings = window.glintSettings || {};
    window.glintSettings.searchEngine = localStorage.getItem('glint_search_engine') || 'google';
    window.glintSettings.searchEngines = searchEngines;

    window.dispatchEvent(new CustomEvent('glint:settings-updated'));
  }

  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}); 