document.addEventListener("DOMContentLoaded", () => {

  const tabsContainer = document.querySelector(".tabs");
  const newTabButton = document.querySelector(".new-tab-btn");
  const addressBarInput = document.querySelector(".address-bar-input");
  const mainSearchInput = document.querySelector(".main-search-input");
  const browserContent = document.querySelector(".browser-content");
  const newTabPage = document.querySelector('.new-tab-page');

  const tabs = {};
  let activeTabId = "newtab";
  let tabCounter = 1;

  tabs["newtab"] = {
    url: "",
    title: "New Tab",
    favicon: "",
    isNewTab: true
  };

  const proxyFramesContainer = document.createElement('div');
  proxyFramesContainer.id = 'proxy-frames-container';
  proxyFramesContainer.style.width = '100%';
  proxyFramesContainer.style.height = '100%';
  proxyFramesContainer.style.position = 'absolute';
  proxyFramesContainer.style.top = '0';
  proxyFramesContainer.style.left = '0';
  browserContent.appendChild(proxyFramesContainer);

  createProxyFrame("newtab");

  async function registerSW() {
    try {
      await navigator.serviceWorker.register('/uv/sw.js', {
        scope: __uv$config.prefix
      });
      return true;
    } catch (err) {
      console.error('Failed to register service worker:', err);
      return false;
    }
  }

  let baremuxConnection = null;
  async function initBaremux() {
    try {
      baremuxConnection = new BareMux.BareMuxConnection("/baremux/worker.js");
      let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";

      if (await baremuxConnection.getTransport() !== "/epoxy/index.mjs") {
        await baremuxConnection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
      }
      return true;
    } catch (err) {
      console.error('Failed to initialize Baremux:', err);
      return false;
    }
  }

  (async function initializeProxy() {
    try {
      const swRegistered = await registerSW();
      const baremuxInitialized = await initBaremux();

      if (!swRegistered || !baremuxInitialized) {
        console.warn('Proxy initialization incomplete - some features may not work');
      }
    } catch (err) {
      console.error('Proxy initialization error:', err);
    }
  })();

  function createProxyFrame(tabId) {
    const frame = document.createElement('iframe');
    frame.id = `proxy-frame-${tabId}`;
    frame.className = 'proxy-frame';
    frame.style.display = 'none';
    frame.style.border = 'none';
    frame.style.width = '100%';
    frame.style.height = '100%';
    proxyFramesContainer.appendChild(frame);

    frame.classList.add('loading');
    frame.onload = () => {
      frame.classList.remove('loading');
      updateTabFavicon(tabId, frame);

      try {
        const frameWindow = frame.contentWindow;
        if (frameWindow) {
          const currentURL = frameWindow.location.href;
          updateAddressBar(currentURL, tabId);
        }
      } catch (e) {
      }
    };

    return frame;
  }

  function updateTabFavicon(tabId, frame) {
    try {
      if (!frame.contentDocument) return;

      const links = frame.contentDocument.querySelectorAll('link[rel*="icon"]');
      if (links.length > 0) {
        const faviconUrl = links[0].href;
        setTabFavicon(tabId, faviconUrl);
        return;
      }

      const url = new URL(tabs[tabId].url);
      const defaultFaviconUrl = `${url.protocol}//${url.hostname}/favicon.ico`;
      checkFaviconExists(defaultFaviconUrl, (exists) => {
        if (exists) {
          setTabFavicon(tabId, defaultFaviconUrl);
        } else {
          setTabFaviconPlaceholder(tabId, url.hostname.charAt(0).toUpperCase());
        }
      });
    } catch (err) {
      console.log('Could not access favicon due to cross-origin restrictions');
      try {
        const url = new URL(tabs[tabId].url);
        const domainFavicon = `${url.protocol}//${url.hostname}/favicon.ico`;
        checkFaviconExists(domainFavicon, (exists) => {
          if (exists) {
            setTabFavicon(tabId, domainFavicon);
          } else {
            setTabFaviconPlaceholder(tabId, url.hostname.charAt(0).toUpperCase());
          }
        });
      } catch (err) {
        console.error('Error setting favicon placeholder:', err);
      }
    }
  }

  function checkFaviconExists(url, callback) {
    const img = new Image();
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
    img.src = url;
  }

  function setTabFavicon(tabId, faviconUrl) {
    tabs[tabId].favicon = faviconUrl;
    const tab = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    if (tab) {
      const placeholder = tab.querySelector('.tab-favicon-placeholder');
      if (placeholder) placeholder.remove();

      let favicon = tab.querySelector('.tab-favicon');
      if (!favicon) {
        favicon = document.createElement('img');
        favicon.className = 'tab-favicon';
        tab.insertBefore(favicon, tab.firstChild);
      }
      favicon.src = faviconUrl;
    }
  }

  function setTabFaviconPlaceholder(tabId, letter) {
    const tab = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    if (tab) {
      const favicon = tab.querySelector('.tab-favicon');
      if (favicon) favicon.remove();

      let placeholder = tab.querySelector('.tab-favicon-placeholder');
      if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.className = 'tab-favicon-placeholder';
        tab.insertBefore(placeholder, tab.firstChild);
      }
      placeholder.innerHTML = letter || '<i class="fas fa-globe"></i>';
    }
  }

  const setActiveTab = (tabId) => {
    const prevTabId = activeTabId;

    activeTabId = tabId;

    document.querySelectorAll(".tab").forEach((tab) => {
      const currentTabId = tab.getAttribute("data-tab-id");
      if (currentTabId === tabId) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    if (tabs[tabId].isNewTab) {
      newTabPage.style.display = 'flex';

      document.querySelectorAll('.proxy-frame').forEach(frame => {
        frame.style.display = 'none';
      });

      proxyFramesContainer.style.pointerEvents = 'none';
      proxyFramesContainer.style.zIndex = '1';

      addressBarInput.value = '';
    } else {
      newTabPage.style.display = 'none';

      proxyFramesContainer.style.pointerEvents = 'auto';
      proxyFramesContainer.style.zIndex = '10';

      document.querySelectorAll('.proxy-frame').forEach(frame => {
        frame.style.display = frame.id === `proxy-frame-${tabId}` ? 'block' : 'none';
      });

      addressBarInput.value = tabs[tabId].url;
    }
  };

  const createNewTab = () => {
    const tabId = `tab-${tabCounter++}`;

    tabs[tabId] = {
      url: "",
      title: "New Tab",
      favicon: "",
      isNewTab: true
    };

    const newTabElement = document.createElement("div");
    newTabElement.className = "tab";
    newTabElement.setAttribute("data-tab-id", tabId);
    newTabElement.innerHTML = `
        <div class="tab-favicon-placeholder">
          <i class="fas fa-home"></i>
        </div>
        <span class="tab-title">New Tab</span>
        <span class="tab-close"><i class="fas fa-times"></i></span>
      `;

    tabsContainer.insertBefore(newTabElement, newTabButton);
    initializeTab(newTabElement);

    createProxyFrame(tabId);

    setActiveTab(tabId);
    updateTabDividers();
  };

  const initializeTab = (tabElement) => {
    const tabId = tabElement.getAttribute("data-tab-id");

    tabElement.addEventListener("click", (e) => {
      if (e.target.closest(".tab-close")) return;
      setActiveTab(tabId);
    });

    const closeButton = tabElement.querySelector(".tab-close");
    closeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      closeTab(tabId);
    });
  };

  const closeTab = (tabId) => {
    const tabElement = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    if (!tabElement) return;

    const isActive = activeTabId === tabId;
    let nextActiveTabId = null;

    if (isActive) {
      const allTabs = Array.from(document.querySelectorAll(".tab"));
      const currentIndex = allTabs.indexOf(tabElement);

      if (currentIndex > 0) {
        nextActiveTabId = allTabs[currentIndex - 1].getAttribute("data-tab-id");
      } else if (allTabs.length > 1) {
        nextActiveTabId = allTabs[1].getAttribute("data-tab-id");
      }
    }

    const proxyFrame = document.getElementById(`proxy-frame-${tabId}`);
    if (proxyFrame) proxyFrame.remove();

    delete tabs[tabId];

    tabElement.remove();
    updateTabDividers();

    if (document.querySelectorAll(".tab").length === 0) {
      createNewTab();
    } else if (isActive && nextActiveTabId) {
      setActiveTab(nextActiveTabId);
    }
  };

  document.querySelectorAll(".tab").forEach(initializeTab);

  if (newTabButton) {
    newTabButton.addEventListener("click", createNewTab);
  }

  const handleSearch = async (searchTerm, tabId) => {
    if (!searchTerm || !tabId) return;

    const settings = window.glintSettings || {};
    const currentEngine = settings.searchEngine || 'google';
    const searchEngines = settings.searchEngines || {
      google: 'https://www.google.com/search?q=%s',
      blank: 'about:blank'
    };

    let url = searchTerm;

    if (!searchTerm.startsWith("http://") && !searchTerm.startsWith("https://")) {
      if (searchTerm.includes(".") && !searchTerm.includes(" ")) {
        url = `https://${searchTerm}`;
      }
      else if (currentEngine === 'blank') {
        url = 'about:blank';
      }
      else {
        const engineUrl = searchEngines[currentEngine] || searchEngines.google;
        url = engineUrl.replace('%s', encodeURIComponent(searchTerm));
      }
    }

    navigateTo(url, tabId);
  };

  const navigateTo = (url, tabId) => {
    tabs[tabId].url = url;
    tabs[tabId].title = url.length > 20
      ? url.substring(0, 20) + '...'
      : url;
    tabs[tabId].isNewTab = false;

    const tabTitle = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-title`);
    if (tabTitle) {
      tabTitle.textContent = tabs[tabId].title;
    }

    const proxyFrame = document.getElementById(`proxy-frame-${tabId}`);
    if (!proxyFrame) return;

    proxyFrame.classList.add('loading');

    try {
      newTabPage.style.display = 'none';

      proxyFramesContainer.style.pointerEvents = 'auto';
      proxyFramesContainer.style.zIndex = '10';

      document.querySelectorAll('.proxy-frame').forEach(frame => {
        frame.style.display = frame.id === `proxy-frame-${tabId}` ? 'block' : 'none';
      });

      proxyFrame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
      addressBarInput.value = url;

      proxyFrame.onload = () => {
        proxyFrame.classList.remove('loading');
        updateTabFavicon(tabId, proxyFrame);

        try {
          const frameWindow = proxyFrame.contentWindow;
          if (frameWindow) {
            const currentURL = frameWindow.location.href;
            updateAddressBar(currentURL, tabId);
            
            const decodedUrl = currentURL.startsWith(location.origin + __uv$config.prefix) 
              ? __uv$config.decodeUrl(currentURL.substring(location.origin.length + __uv$config.prefix.length))
              : currentURL;
              
            window.dispatchEvent(new CustomEvent('add-to-history', {
              detail: {
                url: decodedUrl,
                title: tabs[tabId].title,
                favicon: tabs[tabId].favicon
              }
            }));
          }
        } catch (e) {
        }
      };
    } catch (err) {
      console.error('Error loading proxied content:', err);
      proxyFrame.classList.remove('loading');
    }
  };

  if (addressBarInput) {
    addressBarInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && addressBarInput.value.trim() !== "") {
        e.preventDefault();
        handleSearch(addressBarInput.value.trim(), activeTabId);
      }
    });
  }

  if (mainSearchInput) {
    mainSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && mainSearchInput.value.trim() !== "") {
        e.preventDefault();
        handleSearch(mainSearchInput.value.trim(), activeTabId);
        addressBarInput.value = mainSearchInput.value.trim();
      }
    });
  }

  document
    .querySelector(".back-btn")
    ?.addEventListener("click", () => {
      if (!tabs[activeTabId].isNewTab) {
        const proxyFrame = document.getElementById(`proxy-frame-${activeTabId}`);
        if (proxyFrame && proxyFrame.contentWindow) {
          proxyFrame.contentWindow.history.back();
        }
      }
    });

  document
    .querySelector(".forward-btn")
    ?.addEventListener("click", () => {
      if (!tabs[activeTabId].isNewTab) {
        const proxyFrame = document.getElementById(`proxy-frame-${activeTabId}`);
        if (proxyFrame && proxyFrame.contentWindow) {
          proxyFrame.contentWindow.history.forward();
        }
      }
    });

  document
    .querySelector(".reload-btn")
    ?.addEventListener("click", () => {
      if (!tabs[activeTabId].isNewTab) {
        const proxyFrame = document.getElementById(`proxy-frame-${activeTabId}`);
        if (proxyFrame && proxyFrame.contentWindow) {
          proxyFrame.classList.add('loading');

          const originalOnload = proxyFrame.onload;
          proxyFrame.onload = () => {
            proxyFrame.classList.remove('loading');

            monitorIframeNavigation(proxyFrame, activeTabId);

            if (originalOnload) {
              originalOnload();
            }
          };

          proxyFrame.contentWindow.location.reload();
        }
      } else {
        window.location.reload();
      }
    });

  document
    .querySelector(".menu-btn")
    ?.addEventListener("click", () => {
    });

  window.addEventListener('navigate-to-url', (event) => {
    const { url } = event.detail;
    if (url) {
      handleSearch(url, activeTabId);
    }
  });

  updateTabDividers();
});

function updateTabDividers() {
  const tabsContainer = document.querySelector(".tabs");
  tabsContainer.querySelectorAll(".tab-divider").forEach((div) => div.remove());
  const tabs = Array.from(tabsContainer.querySelectorAll(".tab"));
  tabs.forEach((tab, idx) => {
    if (idx < tabs.length - 1) {
      const divider = document.createElement("div");
      divider.className = "tab-divider";
      tab.after(divider);
    }
  });
}

function updateAddressBar(url, tabId) {
  try {
    let displayUrl = url;
    const prefix = __uv$config.prefix;

    if (displayUrl.startsWith(location.origin + prefix)) {
      displayUrl = __uv$config.decodeUrl(
        displayUrl.substring(location.origin.length + prefix.length)
      );

      tabs[tabId].url = displayUrl;
      tabs[tabId].title = displayUrl.length > 20
        ? displayUrl.substring(0, 20) + '...'
        : displayUrl;

      const tabTitle = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-title`);
      if (tabTitle) {
        tabTitle.textContent = tabs[tabId].title;
      }

      addressBarInput.value = displayUrl;
    }
  } catch (e) {
    console.error("Error updating address bar:", e);
  }
}