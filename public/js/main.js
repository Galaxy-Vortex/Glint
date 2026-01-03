document.addEventListener("DOMContentLoaded", async () => {
  await import("/scram/scramjet.all.js");

  const { ScramjetController } = $scramjetLoadController();
  const scramjet = new ScramjetController({
    files: {
      wasm: "/scram/scramjet.wasm.wasm",
      all: "/scram/scramjet.all.js",
      sync: "/scram/scramjet.sync.js"
    },
    prefix: "/scramjet/",
    flags: {
      rewriterLogs: false,
      scramitize: false,
      cleanErrors: true
    },
    siteFlags: {
      "https://worker-playground.glitch.me/.*": {
        serviceworkers: true
      }
    }
  });
  scramjet.init();
  window.scramjet = scramjet;

  const tabsContainer = document.querySelector(".tabs");
  const newTabButton = document.querySelector(".new-tab-btn");
  const addressBarInput = document.querySelector(".address-bar-input");
  const mainSearchInput = document.querySelector(".main-search-input");
  const browserContent = document.querySelector(".browser-content");
  const newTabPage = document.querySelector('.new-tab-page');

  const tabs = {};
  let activeTabId = 'newtab';
  let tabCounter = 1;

  window.tabs = tabs;
  window.activeTabId = activeTabId;
  window.tabCounter = tabCounter;

  tabs['newtab'] = {
    url: '',
    title: 'New Tab',
    favicon: '',
    isNewTab: true,
    isHistoryNavigation: false
  };

  window.initTabHistory('newtab');

  let proxyFramesContainer = document.getElementById('proxy-frames-container');
  if (!proxyFramesContainer) {
    proxyFramesContainer = document.createElement('div');
    proxyFramesContainer.id = 'proxy-frames-container';
    browserContent.appendChild(proxyFramesContainer);
  }

  proxyFramesContainer.style.width = '100%';
  proxyFramesContainer.style.height = '100%';
  proxyFramesContainer.style.position = 'absolute';
  proxyFramesContainer.style.top = '0';
  proxyFramesContainer.style.left = '0';
  proxyFramesContainer.style.pointerEvents = 'none';
  proxyFramesContainer.style.zIndex = '1';

  setTimeout(() => {
    if (window.createProxyFrame && !document.getElementById('proxy-frame-newtab')) {
      window.createProxyFrame('newtab', proxyFramesContainer);
    }
  }, 100);

  const restoreTabsAfterInit = async () => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const result = window.restoreTabsFromStorage(
      window.createTabElement,
      window.initializeTab,
      (tabId) => window.createProxyFrame(tabId, proxyFramesContainer)
    );

    activeTabId = result.activeTabId || 'newtab';
    window.activeTabId = activeTabId;

    if (!document.getElementById(`proxy-frame-${activeTabId}`)) {
      window.createProxyFrame(activeTabId, proxyFramesContainer);
    }

    const prevSave = window.saveTabsToStorage;
    window.saveTabsToStorage = () => { };
    window.setActiveTab(activeTabId);
    window.saveTabsToStorage = prevSave;

    window.updateTabDividers();

    for (const [tabId, tabData] of Object.entries(tabs)) {
      if (tabData.pendingUrl) {
        const url = tabData.pendingUrl;
        delete tabData.pendingUrl;

        const originalUrl = window.getOriginalUrl(url);

        setTimeout(() => {
          const proxyFrame = document.getElementById(`proxy-frame-${tabId}`);
          if (proxyFrame && window.scramjet && originalUrl) {
            const attemptRestoreNavigation = () => {
              if (!window.scramjet || !window.scramjet.encodeUrl) {
                setTimeout(attemptRestoreNavigation, 100);
                return;
              }

              try {
                let urlToEncode = originalUrl;

                if (urlToEncode.includes('/scramjet/') || urlToEncode.includes(location.origin + '/scramjet/')) {
                  const decoded = window.getOriginalUrl(urlToEncode);
                  if (decoded && (decoded.startsWith('http://') || decoded.startsWith('https://'))) {
                    urlToEncode = decoded;
                  }
                }

                proxyFrame.classList.add('loading');

                if (tabId === activeTabId) {
                  newTabPage.style.display = 'none';

                  if (proxyFramesContainer) {
                    proxyFramesContainer.classList.add('active');
                    proxyFramesContainer.style.pointerEvents = 'auto';
                    proxyFramesContainer.style.zIndex = '100';
                  }

                  if (browserContent) {
                    browserContent.classList.add('frame-active');
                  }

                  document.querySelectorAll('.proxy-frame').forEach(frame => {
                    const isActive = frame.id === `proxy-frame-${tabId}`;
                    frame.style.display = isActive ? 'block' : 'none';

                    if (isActive) {
                      frame.classList.add('visible');
                      frame.style.pointerEvents = 'auto';

                      setTimeout(() => {
                        try {
                          frame.focus();
                          if (frame.contentWindow) {
                            frame.contentWindow.focus();
                          }
                        } catch (e) {
                        }
                      }, 50);
                    } else {
                      frame.classList.remove('visible');
                    }
                  });
                }

                const encodedUrl = window.scramjet.encodeUrl(urlToEncode);

                tabs[tabId].url = originalUrl;
                tabs[tabId].isHistoryNavigation = true;

                proxyFrame.onload = () => {
                  proxyFrame.classList.remove('loading');
                  window.updateTabFavicon(tabId, proxyFrame);

                  if (tabs[tabId]?.navigationMonitor) {
                    clearInterval(tabs[tabId].navigationMonitor);
                  }
                  window.startIframeNavigationMonitor(proxyFrame, tabId);

                  try {
                    const frameWindow = proxyFrame.contentWindow;
                    if (frameWindow) {
                      const currentURL = frameWindow.location.href;
                      window.updateAddressBar(currentURL, tabId);
                      window.updateTabFaviconForUrl(tabId, currentURL);

                      const actualOriginalUrl = window.getOriginalUrl(currentURL);
                      if (tabs[tabId]) {
                        tabs[tabId].url = actualOriginalUrl;
                        tabs[tabId].isHistoryNavigation = false;
                      }
                    }
                  } catch (e) {
                  }
                };

                proxyFrame.onerror = () => {
                  proxyFrame.classList.remove('loading');
                  tabs[tabId].isHistoryNavigation = false;
                  console.error('Error loading restored tab:', tabId);
                };

                proxyFrame.src = encodedUrl;
              } catch (err) {
                console.error('Error restoring tab navigation:', err);
                proxyFrame.classList.remove('loading');
                tabs[tabId].isHistoryNavigation = false;
              }
            };

            attemptRestoreNavigation();
          }
        }, 200);
      }
    }
  };

  async function registerSW() {
    try {
      await navigator.serviceWorker.register('/sw.js', {});
      return true;
    } catch (err) {
      console.error('sw registration failed:', err);
      return false;
    }
  }

  let baremuxConnection = null;
  async function initBaremux() {
    try {
      baremuxConnection = new BareMux.BareMuxConnection('/baremux/worker.js');
      let wispUrl = localStorage.getItem('glint_wisp') || (location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host + '/wisp/';

      if (await baremuxConnection.getTransport() !== '/epoxy/index.mjs') {
        await baremuxConnection.setTransport('/epoxy/index.mjs', [{ wisp: wispUrl }]);
      }
      return true;
    } catch (err) {
      console.error('baremux init failed:', err);
      return false;
    }
  }

  (async function initializeProxy() {
    try {
      const swRegistered = await registerSW();
      const baremuxInitialized = await initBaremux();

      if (!swRegistered || !baremuxInitialized) {
        console.warn('proxy init incomplete');
      }
    } catch (err) {
      console.error('proxy init error:', err);
    }
  })();

  if (newTabButton) {
    newTabButton.addEventListener('click', window.createNewTab);
  }

  document.querySelectorAll('.tab').forEach(window.initializeTab);

  window.initNavigationControls();

  window.addEventListener('glint:search', (e) => {
    const { searchUrl } = e.detail;
    const activeTabId = window.activeTabId || 'newtab';
    if (window.handleSearch && searchUrl) {
      window.handleSearch(searchUrl, activeTabId);
    } else if (window.navigateTo && searchUrl) {
      window.navigateTo(searchUrl, activeTabId);
    }
  });

  document.addEventListener('glint:settings-updated', initBaremux);

  restoreTabsAfterInit();
  window.updateTabDividers();
});
