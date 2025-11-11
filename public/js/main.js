document.addEventListener("DOMContentLoaded", async () => {


	await import("/scram/scramjet.all.js");

	const { ScramjetController } = $scramjetLoadController();
	const scramjet = new ScramjetController({
		files: {
			wasm: "/scram/scramjet.wasm.wasm",
			all: "/scram/scramjet.all.js",
			sync: "/scram/scramjet.sync.js",
		},
		prefix: "/scramjet/",
		flags: {
			rewriterLogs: false,
			scramitize: false,
			cleanErrors: true,
		},
		siteFlags: {
			"https://worker-playground.glitch.me/.*": {
				serviceworkers: true,
			},
		},
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
  let activeTabId = "newtab";
  
  window.tabs = tabs;
  window.activeTabId = activeTabId;
  let tabCounter = 1;
  
  const tabHistory = {};
  
  function addToHistory(tabId, url) {
    if (!tabHistory[tabId]) {
      tabHistory[tabId] = [];
      tabHistory[tabId].historyIndex = -1;
    }
    
    const history = tabHistory[tabId];
    const originalUrl = getOriginalUrl(url);
    
    if (history.length > 0 && history[history.historyIndex] === originalUrl) {
      return;
    }
    
    if (history.historyIndex < history.length - 1) {
      history.splice(history.historyIndex + 1);
    }
    
    history.push(originalUrl);
    history.historyIndex = history.length - 1;
    
    if (history.length > 50) {
      history.shift();
      history.historyIndex--;
    }
  }
  
  function getPreviousUrl(tabId) {
    if (!tabHistory[tabId] || tabHistory[tabId].historyIndex <= 0) {
      return null;
    }
    return tabHistory[tabId][tabHistory[tabId].historyIndex - 1];
  }
  
  function getNextUrl(tabId) {
    if (!tabHistory[tabId] || tabHistory[tabId].historyIndex >= tabHistory[tabId].length - 1) {
      return null;
    }
    return tabHistory[tabId][tabHistory[tabId].historyIndex + 1];
  }
  
  function moveHistoryBack(tabId) {
    if (!tabHistory[tabId] || tabHistory[tabId].historyIndex <= 0) {
      return false;
    }
    tabHistory[tabId].historyIndex--;
    return true;
  }
  
  function moveHistoryForward(tabId) {
    if (!tabHistory[tabId] || tabHistory[tabId].historyIndex >= tabHistory[tabId].length - 1) {
      return false;
    }
    tabHistory[tabId].historyIndex++;
    return true;
  }

  function getOriginalUrl(url) {
    if (!url) return "";
    
    if (url.startsWith("http://") || url.startsWith("https://")) {
      if (url.includes("/scramjet/") && url.includes(location.origin)) {
        try {
          const urlObj = new URL(url);
          if (urlObj.pathname.startsWith('/scramjet/')) {
            const encodedUrl = urlObj.pathname.substring('/scramjet/'.length);
            try {
              const decoded = decodeURIComponent(encodedUrl);
              if (decoded.startsWith('http')) {
                return decoded;
              }
              const base64Decoded = atob(encodedUrl);
              if (base64Decoded.startsWith('http')) {
                return base64Decoded;
              }
            } catch (e) {
            }
          }
        } catch (e) {
        }
      }
      return url;
    }
    
    const decoded = decodeProxiedUrl(url);
    if (decoded && (decoded.startsWith("http://") || decoded.startsWith("https://"))) {
      if (decoded.includes("/scramjet/") && decoded.includes(location.origin)) {
        return getOriginalUrl(decoded); 
      }
      return decoded;
    }
    
    if (url.includes("/scramjet/")) {
      try {
        const urlObj = new URL(url);
        if (urlObj.pathname.startsWith('/scramjet/')) {
          const encodedUrl = urlObj.pathname.substring('/scramjet/'.length);
          try {
            const decoded = decodeURIComponent(encodedUrl);
            if (decoded.startsWith('http')) {
              if (decoded.includes("/scramjet/") && decoded.includes(location.origin)) {
                return getOriginalUrl(decoded); 
              }
              return decoded;
            }
            const base64Decoded = atob(encodedUrl);
            if (base64Decoded.startsWith('http')) {
              if (base64Decoded.includes("/scramjet/") && base64Decoded.includes(location.origin)) {
                return getOriginalUrl(base64Decoded); 
              }
              return base64Decoded;
            }
          } catch (e) {
          }
        }
      } catch (e) {
      }
    }
    
    return url;
  }

  function getWebsiteName(url) {
    try {
      if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
        return url;
      }
      
      const urlObj = new URL(url);
      let hostname = urlObj.hostname;
      
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      
      return hostname;
    } catch (e) {
      return url.length > 20 ? url.substring(0, 20) + '...' : url;
    }
  }

  let saveTabsTimeout = null;
  function saveTabsToStorage(immediate = false) {
    if (saveTabsTimeout && !immediate) {
      clearTimeout(saveTabsTimeout);
    }
    
    const performSave = () => {
      try {
        const tabsData = {};
        for (const [tabId, tabData] of Object.entries(tabs)) {
          if (tabId !== "newtab" || tabData.url) {
            const originalUrl = getOriginalUrl(tabData.url || "");
            
            tabsData[tabId] = {
              url: originalUrl,
              title: tabData.title || "New Tab",
              favicon: tabData.favicon || "",
              isNewTab: tabData.isNewTab || false
            };
          }
        }
        localStorage.setItem('glint_tabs', JSON.stringify(tabsData));
        localStorage.setItem('glint_activeTabId', activeTabId);
        localStorage.setItem('glint_tabCounter', tabCounter.toString());
      } catch (e) {
        console.error('Error saving tabs:', e);
      }
      saveTabsTimeout = null;
    };
    
    if (immediate) {
      performSave();
    } else {
      saveTabsTimeout = setTimeout(performSave, 300);
    }
  }
  
  window.saveTabsToStorage = saveTabsToStorage;

  function restoreTabsFromStorage() {
    try {
      const savedTabs = localStorage.getItem('glint_tabs');
      const savedActiveTabId = localStorage.getItem('glint_activeTabId');
      const savedTabCounter = localStorage.getItem('glint_tabCounter');

      if (savedTabCounter) {
        tabCounter = parseInt(savedTabCounter, 10) || 1;
      }

      if (savedTabs) {
        const tabsData = JSON.parse(savedTabs);
        const existingNewTab = document.querySelector('.tab[data-tab-id="newtab"]');
        
        if (Object.keys(tabsData).length > 0) {
          if (existingNewTab) {
            existingNewTab.remove();
            delete tabs["newtab"];
            const newTabFrame = document.getElementById('proxy-frame-newtab');
            if (newTabFrame) newTabFrame.remove();
          }

          for (const [tabId, tabData] of Object.entries(tabsData)) {
            tabs[tabId] = tabData;
            tabs[tabId].isHistoryNavigation = false;
            
            if (!tabHistory[tabId]) {
              tabHistory[tabId] = [];
              tabHistory[tabId].historyIndex = -1;
            }
            
            if (tabData.url && (tabData.url.startsWith("http://") || tabData.url.startsWith("https://"))) {
              addToHistory(tabId, tabData.url);
            }
            
            const newTabElement = document.createElement("div");
            newTabElement.className = "tab";
            newTabElement.setAttribute("data-tab-id", tabId);
            
            const faviconHtml = tabData.favicon 
              ? `<img src="${tabData.favicon}" alt="Favicon" class="tab-favicon">`
              : `<div class="tab-favicon-placeholder"><img src="images/logo.png" alt="Glint Logo" class="tab-logo"></div>`;
            
            newTabElement.innerHTML = `
              ${faviconHtml}
              <span class="tab-title">${tabData.title || "New Tab"}</span>
              <span class="tab-close"><i class="fas fa-times"></i></span>
            `;

            tabsContainer.insertBefore(newTabElement, newTabButton);
            initializeTab(newTabElement);
            
            createProxyFrame(tabId);
            
            if (tabData.url && !tabData.isNewTab && (tabData.url.startsWith("http://") || tabData.url.startsWith("https://"))) {
              tabs[tabId].pendingUrl = tabData.url;
            }
          }
          if (savedActiveTabId && tabs[savedActiveTabId]) {
            activeTabId = savedActiveTabId;
          } else if (Object.keys(tabs).length > 0) {
            activeTabId = Object.keys(tabs)[0];
          }
          } else {
          tabs["newtab"] = {
            url: "",
            title: "New Tab",
            favicon: "",
            isNewTab: true
          };
        }
      } else {
        tabs["newtab"] = {
          url: "",
          title: "New Tab",
          favicon: "",
          isNewTab: true
        };
      }
    } catch (e) {
      console.error('Error restoring tabs:', e);
      tabs["newtab"] = {
        url: "",
        title: "New Tab",
        favicon: "",
        isNewTab: true
      };
    }
  }

  tabs["newtab"] = {
    url: "",
    title: "New Tab",
    favicon: "",
    isNewTab: true,
    isHistoryNavigation: false
  };
  
  if (!tabHistory["newtab"]) {
    tabHistory["newtab"] = [];
    tabHistory["newtab"].historyIndex = -1;
  }

  const proxyFramesContainer = document.createElement('div');
  proxyFramesContainer.id = 'proxy-frames-container';
  proxyFramesContainer.style.width = '100%';
  proxyFramesContainer.style.height = '100%';
  proxyFramesContainer.style.position = 'absolute';
  proxyFramesContainer.style.top = '0';
  proxyFramesContainer.style.left = '0';
  browserContent.appendChild(proxyFramesContainer);

  const restoreTabsAfterInit = async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    restoreTabsFromStorage();

    if (!document.getElementById(`proxy-frame-${activeTabId}`)) {
      createProxyFrame(activeTabId);
    }

    const prevSave = saveTabsToStorage;
    saveTabsToStorage = () => {};
    setActiveTab(activeTabId);
    saveTabsToStorage = prevSave;
    
    updateTabDividers();
    
    for (const [tabId, tabData] of Object.entries(tabs)) {
      if (tabData.pendingUrl) {
        const url = tabData.pendingUrl;
        delete tabData.pendingUrl;
        
        const originalUrl = getOriginalUrl(url);
        
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
                
                if (urlToEncode.includes("/scramjet/") || urlToEncode.includes(location.origin + "/scramjet/")) {
                  const decoded = getOriginalUrl(urlToEncode);
                  if (decoded && (decoded.startsWith("http://") || decoded.startsWith("https://"))) {
                    urlToEncode = decoded;
                  }
                }
                
                proxyFrame.classList.add('loading');
                
                if (tabId === activeTabId) {
                  newTabPage.style.display = 'none';
                  proxyFramesContainer.style.pointerEvents = 'auto';
                  proxyFramesContainer.style.zIndex = '10';
                  
                  document.querySelectorAll('.proxy-frame').forEach(frame => {
                    frame.style.display = frame.id === `proxy-frame-${tabId}` ? 'block' : 'none';
                  });
                }
                
                const encodedUrl = window.scramjet.encodeUrl(urlToEncode);
                
                tabs[tabId].url = originalUrl;
                tabs[tabId].isHistoryNavigation = true;
                
                proxyFrame.onload = () => {
                  proxyFrame.classList.remove('loading');
                  updateTabFavicon(tabId, proxyFrame);
                  
                  if (tabs[tabId]?.navigationMonitor) {
                    clearInterval(tabs[tabId].navigationMonitor);
                  }
                  startIframeNavigationMonitor(proxyFrame, tabId);
                  
                  try {
                    const frameWindow = proxyFrame.contentWindow;
                    if (frameWindow) {
                      const currentURL = frameWindow.location.href;
                      updateAddressBar(currentURL, tabId);
                      updateTabFaviconForUrl(tabId, currentURL);
                      
                      const actualOriginalUrl = getOriginalUrl(currentURL);
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

  restoreTabsAfterInit();

  async function registerSW() {
    try {
      await navigator.serviceWorker.register('/sw.js', {});
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
      let wispUrl = localStorage.getItem("glint_wisp") || (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";

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
    frame.setAttribute('loading', 'lazy');
    proxyFramesContainer.appendChild(frame);

    frame.classList.add('loading');
    
    const defaultOnload = () => {
      frame.classList.remove('loading');
      updateTabFavicon(tabId, frame);

      try {
        const frameWindow = frame.contentWindow;
        if (frameWindow && frame.src) {
          const currentURL = frameWindow.location.href;
          updateAddressBar(currentURL, tabId);
          updateTabFaviconForUrl(tabId, currentURL);
          
          if (tabs[tabId] && !tabs[tabId].isNewTab && frame.src) {
            if (tabs[tabId]?.navigationMonitor) {
              clearInterval(tabs[tabId].navigationMonitor);
            }
            startIframeNavigationMonitor(frame, tabId);
          }
        }
      } catch (e) {
      }
    };
    
    frame.onload = defaultOnload;

    return frame;
  }

  function updateTabFavicon(tabId, frame) {
    if (tabs[tabId]?.favicon && !tabs[tabId].favicon.includes('favicon-proxy')) {
      return;
    }
    
    if (tabs[tabId]?.faviconLoading) {
      return;
    }
    
    tabs[tabId].faviconLoading = false;
  }

  function tryFaviconFallbacks(tabId) {
    tabs[tabId].faviconLoading = false;
  }

  function tryFaviconSource(tabId, sources, index, hostname) {
    if (index >= sources.length) {
      tabs[tabId].faviconLoading = false;
      return;
    }

    const faviconUrl = sources[index];
    
    checkFaviconExists(faviconUrl, (exists) => {
      if (!tabs[tabId]?.faviconLoading) {
        return;
      }
      
      if (exists) {
        setTabFavicon(tabId, faviconUrl);
        tabs[tabId].faviconLoading = false;
      } else {
        tryFaviconSource(tabId, sources, index + 1, hostname);
      }
    });
  }

  function checkFaviconExists(url, callback) {
    const img = new Image();
    let loaded = false;
    
    const timeout = setTimeout(() => {
      if (!loaded) {
        loaded = true;
        callback(false);
      }
    }, 2000);
    
    img.onload = () => {
      if (!loaded) {
        loaded = true;
        clearTimeout(timeout);
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          callback(true);
        } else {
          callback(false);
        }
      }
    };
    
    img.onerror = () => {
      if (!loaded) {
        loaded = true;
        clearTimeout(timeout);
        callback(false);
      }
    };
    
    if (url.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = url;
  }

  function setTabFavicon(tabId, faviconUrl) {
    if (!tabs[tabId]) {
      return;
    }
    
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
      
      favicon.onerror = () => {
        favicon.remove();
      };
      
      favicon.src = faviconUrl;
    }
  }

  function updateTabFaviconForUrl(tabId, url) {
    if (tabs[tabId]) {
      tabs[tabId].faviconLoading = false;
      const originalUrl = getOriginalUrl(url);
      tabs[tabId].url = originalUrl;
      tabs[tabId].title = getWebsiteName(originalUrl);
      
      const tabTitle = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-title`);
      if (tabTitle) {
        tabTitle.textContent = tabs[tabId].title;
      }
      
      saveTabsToStorage();
    }
    
    try {
      const actualUrl = decodeProxiedUrl(url) || url;
      const actualHostname = new URL(actualUrl).hostname;
      
      if (tabs[tabId]?.faviconLoading) {
        return;
      }
      
      tabs[tabId].faviconLoading = true;
      
      const faviconSources = [
        `/favicon-proxy?url=${encodeURIComponent(`https://www.google.com/s2/favicons?domain=${actualHostname}&sz=32`)}`,
        `/favicon-proxy?url=${encodeURIComponent(`https://icons.duckduckgo.com/ip3/${actualHostname}.ico`)}`,
        `/favicon-proxy?url=${encodeURIComponent(`https://favicons.githubusercontent.com/${actualHostname}`)}`
      ];
      
      let faviconLoaded = false;
      let sourceIndex = 0;
      
      const tryNextSource = () => {
        if (faviconLoaded || sourceIndex >= faviconSources.length) {
          tabs[tabId].faviconLoading = false;
          return;
        }
        
        if (!tabs[tabId]?.faviconLoading) {
          return;
        }
        
        checkFaviconExists(faviconSources[sourceIndex], (exists) => {
          if (exists && !faviconLoaded && tabs[tabId]?.faviconLoading) {
            faviconLoaded = true;
            setTabFavicon(tabId, faviconSources[sourceIndex]);
            tabs[tabId].faviconLoading = false;
          } else {
            sourceIndex++;
            tryNextSource();
          }
        });
      };
      
      tryNextSource();
    } catch (err) {
      if (tabs[tabId]) {
        tabs[tabId].faviconLoading = false;
      }
    }
  }

  function startIframeNavigationMonitor(iframe, tabId) {
    let lastUrl = '';
    
    const checkForNavigation = () => {
      try {
        const frameWindow = iframe.contentWindow;
        if (frameWindow && tabs[tabId]) {
          const currentURL = frameWindow.location.href;
          
          if (currentURL !== lastUrl) {
            lastUrl = currentURL;
            updateAddressBar(currentURL, tabId);
            updateTabFaviconForUrl(tabId, currentURL);
            
            if (tabs[tabId]) {
              const originalUrl = getOriginalUrl(currentURL);
              tabs[tabId].url = originalUrl;
              tabs[tabId].title = getWebsiteName(originalUrl);
              
              const tabTitle = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-title`);
              if (tabTitle) {
                tabTitle.textContent = tabs[tabId].title;
              }
              
              saveTabsToStorage();
            }
          }
        }
      } catch (e) {
      }
    };
    
    const monitorInterval = setInterval(checkForNavigation, 500);
    
    if (!tabs[tabId]) tabs[tabId] = {};
    tabs[tabId].navigationMonitor = monitorInterval;
    
    checkForNavigation();
  }

  const setActiveTab = (tabId) => {
    const prevTabId = activeTabId;

    activeTabId = tabId;
    window.activeTabId = activeTabId;

    document.querySelectorAll(".tab").forEach((tab) => {
      const currentTabId = tab.getAttribute("data-tab-id");
      if (currentTabId === tabId) {
        tab.classList.add("active");
        tab.style.transform = "translateY(1px)";
      } else {
        tab.classList.remove("active");
        tab.style.transform = "";
      }
    });

    if (tabs[tabId] && tabs[tabId].isNewTab) {
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

      addressBarInput.value = tabs[tabId]?.url || '';
    }

    saveTabsToStorage(true);
  };

  const createNewTab = () => {
    const tabId = `tab-${tabCounter++}`;

    tabs[tabId] = {
      url: "",
      title: "New Tab",
      favicon: "",
      isNewTab: true,
      isHistoryNavigation: false
    };
    
    if (!tabHistory[tabId]) {
      tabHistory[tabId] = [];
      tabHistory[tabId].historyIndex = -1;
    }

    const newTabElement = document.createElement("div");
    newTabElement.className = "tab";
    newTabElement.setAttribute("data-tab-id", tabId);
    newTabElement.innerHTML = `
        <div class="tab-favicon-placeholder">
          <img src="images/logo.png" alt="Glint Logo" class="tab-logo">
        </div>
        <span class="tab-title">New Tab</span>
        <span class="tab-close"><i class="fas fa-times"></i></span>
      `;

    tabsContainer.insertBefore(newTabElement, newTabButton);
    initializeTab(newTabElement);

    createProxyFrame(tabId);

    setActiveTab(tabId);
    updateTabDividers();
    
    saveTabsToStorage(true);
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

    tabElement.addEventListener("mousedown", handleTabMouseDown);
  };

  let dragState = {
    isDragging: false,
    draggedTab: null,
    draggedTabId: null,
    startX: 0,
    currentX: 0,
    originalIndex: -1,
    currentIndex: -1,
    tabs: [],
    originalRects: []
  };

  function handleTabMouseDown(e) {
    if (e.target.closest(".tab-close")) return;
    
    const tab = e.target.closest(".tab");
    if (!tab) return;

    const tabId = tab.getAttribute("data-tab-id");
    
    if (tabId !== activeTabId) {
      setActiveTab(tabId);
    }

    dragState.isDragging = false;
    dragState.draggedTab = tab;
    dragState.draggedTabId = tabId;
    dragState.startX = e.clientX;
    dragState.currentX = e.clientX;

    const tabsContainer = document.querySelector(".tabs");
    dragState.tabs = Array.from(tabsContainer.querySelectorAll(".tab"));
    dragState.originalIndex = dragState.tabs.indexOf(tab);
    dragState.currentIndex = dragState.originalIndex;

    document.addEventListener("mousemove", handleTabMouseMove);
    document.addEventListener("mouseup", handleTabMouseUp);
    
    e.preventDefault();
  }

  function handleTabMouseMove(e) {
    if (!dragState.draggedTab) return;

    dragState.currentX = e.clientX;
    const deltaX = dragState.currentX - dragState.startX;

    if (!dragState.isDragging && Math.abs(deltaX) > 5) {
      dragState.isDragging = true;
      dragState.draggedTab.classList.add("dragging");
      dragState.draggedTab.style.zIndex = "1000";
      document.body.classList.add("dragging");
      
      const tabsContainer = document.querySelector(".tabs");
      dragState.originalRects = dragState.tabs.map(tab => {
        const rect = tab.getBoundingClientRect();
        return {
          left: rect.left,
          width: rect.width,
          center: rect.left + rect.width / 2
        };
      });
    }

    if (!dragState.isDragging) return;

    const draggedOriginalCenter = dragState.originalRects[dragState.originalIndex].center;
    const draggedCurrentCenter = draggedOriginalCenter + deltaX;

    let newIndex = dragState.currentIndex;
    
    const tabsContainer = document.querySelector(".tabs");
    const newTabButton = document.querySelector(".new-tab-btn");
    const newTabButtonRect = newTabButton ? newTabButton.getBoundingClientRect() : null;
    const newTabButtonLeft = newTabButtonRect ? newTabButtonRect.left : Infinity;
    
    const tabPositions = dragState.tabs.map((tab, index) => {
      if (index === dragState.originalIndex) {
        return { index, center: draggedCurrentCenter, isDragged: true };
      }
      
      let tabCurrentCenter = dragState.originalRects[index].center;
      const currentTransform = tab.style.transform;
      if (currentTransform) {
        const match = currentTransform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
        if (match) {
          tabCurrentCenter += parseFloat(match[1]);
        }
      }
      
      return { index, center: tabCurrentCenter, isDragged: false };
    });
    
    tabPositions.sort((a, b) => a.center - b.center);
    
    const draggedPos = tabPositions.find(p => p.isDragged);
    if (draggedPos) {
      newIndex = tabPositions.indexOf(draggedPos);
    }
    
    const draggedTabRect = dragState.originalRects[dragState.originalIndex];
    const draggedTabRightEdge = draggedTabRect.left + draggedTabRect.width + deltaX;
    
    if (newTabButtonRect && draggedTabRightEdge >= newTabButtonLeft) {
      newIndex = dragState.tabs.length - 1;
    }

    if (newIndex !== dragState.currentIndex) {
      const draggedWidth = dragState.originalRects[dragState.originalIndex].width;
      
      dragState.tabs.forEach(tab => {
        if (tab !== dragState.draggedTab) {
          tab.style.transform = "";
        }
      });
      
      dragState.tabs.forEach((tab, index) => {
        if (tab === dragState.draggedTab) return;
        
        let offset = 0;
        if (dragState.originalIndex < newIndex) {
          if (index > dragState.originalIndex && index <= newIndex) {
            offset = -draggedWidth;
          }
        } else if (dragState.originalIndex > newIndex) {
          if (index >= newIndex && index < dragState.originalIndex) {
            offset = draggedWidth;
          }
        }
        
        if (offset !== 0) {
          tab.style.transform = `translateX(${offset}px)`;
          tab.style.transition = "transform 0.2s ease";
        }
      });
      
      dragState.currentIndex = newIndex;
    }

    let finalDeltaX = deltaX;
    if (newTabButtonRect) {
      const draggedTabRect = dragState.originalRects[dragState.originalIndex];
      const draggedTabRightEdge = draggedTabRect.left + draggedTabRect.width + deltaX;
      
      if (draggedTabRightEdge >= newTabButtonLeft) {
        const maxDeltaX = newTabButtonLeft - (draggedTabRect.left + draggedTabRect.width) - 5;
        finalDeltaX = Math.min(deltaX, maxDeltaX);
      }
    }
    
    const isActive = dragState.draggedTab.classList.contains("active");
    if (isActive) {
      dragState.draggedTab.style.transform = `translateX(${finalDeltaX}px) translateY(1px)`;
    } else {
      dragState.draggedTab.style.transform = `translateX(${finalDeltaX}px)`;
    }
    dragState.draggedTab.style.transition = "none";
  }

  function handleTabMouseUp(e) {
    if (!dragState.draggedTab) {
      document.removeEventListener("mousemove", handleTabMouseMove);
      document.removeEventListener("mouseup", handleTabMouseUp);
      return;
    }

    const wasDragging = dragState.isDragging;
    const draggedTab = dragState.draggedTab;
    const tabsToAnimate = [...dragState.tabs];
    const originalIndex = dragState.originalIndex;
    const newIndex = dragState.currentIndex;

    if (wasDragging) {
      const tabsContainer = document.querySelector(".tabs");
      const newTabButton = document.querySelector(".new-tab-btn");
      const isActive = draggedTab.classList.contains("active");
      
      draggedTab.classList.remove("dragging");
      draggedTab.style.zIndex = "";
      
      if (newIndex !== originalIndex) {
        const currentPositions = new Map();
        tabsToAnimate.forEach(tab => {
          const rect = tab.getBoundingClientRect();
          currentPositions.set(tab, rect.left);
        });
        
        const allTabs = Array.from(tabsContainer.querySelectorAll(".tab"));
        const tabsWithoutDragged = allTabs.filter(t => t !== draggedTab);
        
        if (newIndex >= tabsWithoutDragged.length) {
          tabsContainer.insertBefore(draggedTab, newTabButton);
        } else {
          const targetTab = tabsWithoutDragged[newIndex];
          tabsContainer.insertBefore(draggedTab, targetTab);
        }
        
        updateTabDividers();
        
        tabsToAnimate.forEach(tab => {
          tab.style.transition = "none";
          tab.style.willChange = "transform";
        });
        
        requestAnimationFrame(() => {
          tabsToAnimate.forEach(tab => {
            tab.style.transform = "";
          });
          
          const finalPositions = new Map();
          tabsToAnimate.forEach(tab => {
            const rect = tab.getBoundingClientRect();
            finalPositions.set(tab, rect.left);
          });
          
          tabsToAnimate.forEach(tab => {
            const currentPos = currentPositions.get(tab);
            const finalPos = finalPositions.get(tab);
            
            if (currentPos !== undefined && finalPos !== undefined) {
              const offset = currentPos - finalPos;
              if (Math.abs(offset) > 0.5) {
                if (tab.classList.contains("active")) {
                  tab.style.transform = `translateX(${offset}px) translateY(1px)`;
                } else {
                  tab.style.transform = `translateX(${offset}px)`;
                }
              }
            }
          });
          
          requestAnimationFrame(() => {
            tabsToAnimate.forEach(tab => {
              tab.style.transition = "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)";
              if (tab.classList.contains("active")) {
                tab.style.transform = "translateY(1px)";
              } else {
                tab.style.transform = "";
              }
            });
            
            setTimeout(() => {
              tabsToAnimate.forEach(tab => {
                tab.style.transition = "";
                tab.style.willChange = "";
              });
              document.body.classList.remove("dragging");
              updateTabDividers();
              saveTabsToStorage();
            }, 250);
          });
        });
      } else {
        const tabsWithTransforms = [];
        tabsToAnimate.forEach(tab => {
          if (tab !== draggedTab) {
            const tabTransform = tab.style.transform;
            const tabMatch = tabTransform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
            if (tabMatch) {
              tabsWithTransforms.push({
                tab: tab,
                translateX: parseFloat(tabMatch[1])
              });
            }
          }
        });
        
        draggedTab.style.transition = "transform 0.2s ease";
        tabsWithTransforms.forEach(({ tab }) => {
          tab.style.transition = "transform 0.2s ease";
        });
        
        if (isActive) {
          draggedTab.style.transform = "translateY(1px)";
        } else {
          draggedTab.style.transform = "";
        }
        
        tabsWithTransforms.forEach(({ tab }) => {
          if (tab.classList.contains("active")) {
            tab.style.transform = "translateY(1px)";
          } else {
            tab.style.transform = "";
          }
        });
        
        setTimeout(() => {
          draggedTab.style.transition = "";
          tabsWithTransforms.forEach(({ tab }) => {
            tab.style.transition = "";
          });
          document.body.classList.remove("dragging");
          updateTabDividers();
        }, 200);
      }
    } else {
      document.body.classList.remove("dragging");
    }
    dragState = {
      isDragging: false,
      draggedTab: null,
      draggedTabId: null,
      startX: 0,
      currentX: 0,
      originalIndex: -1,
      currentIndex: -1,
      tabs: [],
      originalRects: []
    };

    document.removeEventListener("mousemove", handleTabMouseMove);
    document.removeEventListener("mouseup", handleTabMouseUp);
  }

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

    if (tabs[tabId]?.navigationMonitor) {
      clearInterval(tabs[tabId].navigationMonitor);
    }

    delete tabs[tabId];

    tabElement.remove();
    updateTabDividers();

    if (document.querySelectorAll(".tab").length === 0) {
      createNewTab();
    } else if (isActive && nextActiveTabId) {
      setActiveTab(nextActiveTabId);
    }
    
    saveTabsToStorage(true);
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
    if (!tabs[tabId]) {
      tabs[tabId] = { url: "", title: "New Tab", favicon: "", isNewTab: true };
    }
    
    const originalUrl = getOriginalUrl(url);
    
    if (!originalUrl || (!originalUrl.startsWith("http://") && !originalUrl.startsWith("https://"))) {
      console.error('Invalid URL for navigation:', originalUrl);
      return;
    }
    
    tabs[tabId].url = originalUrl;
    tabs[tabId].title = getWebsiteName(originalUrl);
    tabs[tabId].isNewTab = false;

    const tabTitle = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-title`);
    if (tabTitle) {
      tabTitle.textContent = tabs[tabId].title;
    }
    
    saveTabsToStorage(true);

    try {
      const urlObj = new URL(originalUrl);
      const hostname = urlObj.hostname;
      
      const actualHostname = hostname;
      
      if (tabs[tabId]?.faviconLoading) {
        return;
      }
      
      tabs[tabId].faviconLoading = true;
      
      const faviconSources = [
        `/favicon-proxy?url=${encodeURIComponent(`https://www.google.com/s2/favicons?domain=${actualHostname}&sz=32`)}`,
        `/favicon-proxy?url=${encodeURIComponent(`https://icons.duckduckgo.com/ip3/${actualHostname}.ico`)}`,
        `/favicon-proxy?url=${encodeURIComponent(`https://favicons.githubusercontent.com/${actualHostname}`)}`
      ];
      
      let faviconLoaded = false;
      let sourceIndex = 0;
      
      const tryNextSource = () => {
        if (faviconLoaded || sourceIndex >= faviconSources.length) {
          tabs[tabId].faviconLoading = false;
          return;
        }
        
        if (!tabs[tabId]?.faviconLoading) {
          return;
        }
        
        checkFaviconExists(faviconSources[sourceIndex], (exists) => {
          if (exists && !faviconLoaded && tabs[tabId]?.faviconLoading) {
            faviconLoaded = true;
            setTabFavicon(tabId, faviconSources[sourceIndex]);
            tabs[tabId].faviconLoading = false;
          } else {
            sourceIndex++;
            tryNextSource();
          }
        });
      };
      
      tryNextSource();
    } catch (err) {
      console.log('Error preloading favicon:', err);
    }

    const proxyFrame = document.getElementById(`proxy-frame-${tabId}`);
    if (!proxyFrame) {
      console.error('Proxy frame not found for tab:', tabId);
      return;
    }

    const attemptNavigation = () => {
      if (!window.scramjet || !window.scramjet.encodeUrl) {
        setTimeout(attemptNavigation, 100);
        return;
      }

      proxyFrame.classList.add('loading');

      try {
        newTabPage.style.display = 'none';

        proxyFramesContainer.style.pointerEvents = 'auto';
        proxyFramesContainer.style.zIndex = '10';

        document.querySelectorAll('.proxy-frame').forEach(frame => {
          frame.style.display = frame.id === `proxy-frame-${tabId}` ? 'block' : 'none';
        });

        let urlToEncode = originalUrl;
        
        if (urlToEncode.includes("/scramjet/") || urlToEncode.includes(location.origin + "/scramjet/")) {
          const decoded = getOriginalUrl(urlToEncode);
          if (decoded && (decoded.startsWith("http://") || decoded.startsWith("https://"))) {
            urlToEncode = decoded;
          }
        }
        
        const encodedUrl = window.scramjet.encodeUrl(urlToEncode);
        
        if (!tabs[tabId].isHistoryNavigation) {
          addToHistory(tabId, originalUrl);
        }
        tabs[tabId].isHistoryNavigation = false;

        proxyFrame.onload = () => {
          proxyFrame.classList.remove('loading');
          updateTabFavicon(tabId, proxyFrame);

          if (tabs[tabId]?.navigationMonitor) {
            clearInterval(tabs[tabId].navigationMonitor);
          }
          startIframeNavigationMonitor(proxyFrame, tabId);

          try {
            const frameWindow = proxyFrame.contentWindow;
            if (frameWindow) {
              const currentURL = frameWindow.location.href;
              updateAddressBar(currentURL, tabId);
              updateTabFaviconForUrl(tabId, currentURL);
              
              const actualOriginalUrl = getOriginalUrl(currentURL);
              if (actualOriginalUrl !== originalUrl && !tabs[tabId].isHistoryNavigation) {
                addToHistory(tabId, actualOriginalUrl);
              }
            }
          } catch (e) {
          }
        };
        
        proxyFrame.src = encodedUrl;
        addressBarInput.value = originalUrl;
      } catch (err) {
        console.error('Error loading proxied content:', err);
        proxyFrame.classList.remove('loading');
      }
    };
    
    attemptNavigation();
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
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (tabs[activeTabId] && !tabs[activeTabId].isNewTab) {
        const previousUrl = getPreviousUrl(activeTabId);
        if (previousUrl) {
          moveHistoryBack(activeTabId);
          
          tabs[activeTabId].isHistoryNavigation = true;
          
          const proxyFrame = document.getElementById(`proxy-frame-${activeTabId}`);
          if (proxyFrame && window.scramjet) {
            proxyFrame.classList.add('loading');
            
            const attemptBack = () => {
              if (!window.scramjet || !window.scramjet.encodeUrl) {
                setTimeout(attemptBack, 100);
                return;
              }
              
              try {
                const urlToEncode = getOriginalUrl(previousUrl);
                const encodedUrl = window.scramjet.encodeUrl(urlToEncode);
                
                tabs[activeTabId].url = urlToEncode;
                tabs[activeTabId].title = getWebsiteName(urlToEncode);
                addressBarInput.value = urlToEncode;
                
                const tabTitle = document.querySelector(`.tab[data-tab-id="${activeTabId}"] .tab-title`);
                if (tabTitle) {
                  tabTitle.textContent = tabs[activeTabId].title;
                }
                
                proxyFrame.onload = () => {
                  proxyFrame.classList.remove('loading');
                  updateTabFavicon(activeTabId, proxyFrame);
                  
                  if (tabs[activeTabId]?.navigationMonitor) {
                    clearInterval(tabs[activeTabId].navigationMonitor);
                  }
                  startIframeNavigationMonitor(proxyFrame, activeTabId);
                  
                  try {
                    const frameWindow = proxyFrame.contentWindow;
                    if (frameWindow) {
                      const currentURL = frameWindow.location.href;
                      updateAddressBar(currentURL, activeTabId);
                      updateTabFaviconForUrl(activeTabId, currentURL);
                      
                      const actualOriginalUrl = getOriginalUrl(currentURL);
                      if (tabs[activeTabId]) {
                        tabs[activeTabId].url = actualOriginalUrl;
                        tabs[activeTabId].isHistoryNavigation = false;
                        saveTabsToStorage();
                      }
                    }
                  } catch (e) {
                    tabs[activeTabId].isHistoryNavigation = false;
                  }
                };
                
                proxyFrame.src = encodedUrl;
              } catch (err) {
                console.error('Error navigating back:', err);
                proxyFrame.classList.remove('loading');
                moveHistoryForward(activeTabId);
                tabs[activeTabId].isHistoryNavigation = false;
              }
            };
            
            attemptBack();
          }
        }
      }
      
      return false;
    });

  document
    .querySelector(".forward-btn")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (tabs[activeTabId] && !tabs[activeTabId].isNewTab) {
        const nextUrl = getNextUrl(activeTabId);
        if (nextUrl) {
          moveHistoryForward(activeTabId);
          
          tabs[activeTabId].isHistoryNavigation = true;
          
          const proxyFrame = document.getElementById(`proxy-frame-${activeTabId}`);
          if (proxyFrame && window.scramjet) {
            proxyFrame.classList.add('loading');
            
            const attemptForward = () => {
              if (!window.scramjet || !window.scramjet.encodeUrl) {
                setTimeout(attemptForward, 100);
                return;
              }
              
              try {
                const urlToEncode = getOriginalUrl(nextUrl);
                const encodedUrl = window.scramjet.encodeUrl(urlToEncode);
                
                tabs[activeTabId].url = urlToEncode;
                tabs[activeTabId].title = getWebsiteName(urlToEncode);
                addressBarInput.value = urlToEncode;
                
                const tabTitle = document.querySelector(`.tab[data-tab-id="${activeTabId}"] .tab-title`);
                if (tabTitle) {
                  tabTitle.textContent = tabs[activeTabId].title;
                }
                
                proxyFrame.onload = () => {
                  proxyFrame.classList.remove('loading');
                  updateTabFavicon(activeTabId, proxyFrame);
                  
                  if (tabs[activeTabId]?.navigationMonitor) {
                    clearInterval(tabs[activeTabId].navigationMonitor);
                  }
                  startIframeNavigationMonitor(proxyFrame, activeTabId);
                  
                  try {
                    const frameWindow = proxyFrame.contentWindow;
                    if (frameWindow) {
                      const currentURL = frameWindow.location.href;
                      updateAddressBar(currentURL, activeTabId);
                      updateTabFaviconForUrl(activeTabId, currentURL);
                      
                      const actualOriginalUrl = getOriginalUrl(currentURL);
                      if (tabs[activeTabId]) {
                        tabs[activeTabId].url = actualOriginalUrl;
                        tabs[activeTabId].isHistoryNavigation = false;
                        saveTabsToStorage();
                      }
                    }
                  } catch (e) {
                    tabs[activeTabId].isHistoryNavigation = false;
                  }
                };
                
                proxyFrame.src = encodedUrl;
              } catch (err) {
                console.error('Error navigating forward:', err);
                proxyFrame.classList.remove('loading');
                moveHistoryBack(activeTabId);
                tabs[activeTabId].isHistoryNavigation = false;
              }
            };
            
            attemptForward();
          }
        }
      }
      
      return false;
    });

  document
    .querySelector(".reload-btn")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (tabs[activeTabId] && !tabs[activeTabId].isNewTab) {
        const proxyFrame = document.getElementById(`proxy-frame-${activeTabId}`);
        if (proxyFrame && window.scramjet) {
          const currentUrl = tabs[activeTabId].url || '';
          if (!currentUrl) {
            return false;
          }
          
          const originalUrl = getOriginalUrl(currentUrl);
          if (!originalUrl || (!originalUrl.startsWith("http://") && !originalUrl.startsWith("https://"))) {
            return false;
          }
          
          proxyFrame.classList.add('loading');
          
          const attemptReload = () => {
            if (!window.scramjet || !window.scramjet.encodeUrl) {
              setTimeout(attemptReload, 100);
              return;
            }
            
            try {
              const urlToEncode = getOriginalUrl(originalUrl);
              const encodedUrl = window.scramjet.encodeUrl(urlToEncode);
              
              proxyFrame.onload = () => {
                proxyFrame.classList.remove('loading');
                updateTabFavicon(activeTabId, proxyFrame);
                
                if (tabs[activeTabId]?.navigationMonitor) {
                  clearInterval(tabs[activeTabId].navigationMonitor);
                }
                startIframeNavigationMonitor(proxyFrame, activeTabId);
                
                try {
                  const frameWindow = proxyFrame.contentWindow;
                  if (frameWindow) {
                    const currentURL = frameWindow.location.href;
                    updateAddressBar(currentURL, activeTabId);
                    updateTabFaviconForUrl(activeTabId, currentURL);
                    
                    const actualOriginalUrl = getOriginalUrl(currentURL);
                    if (tabs[activeTabId]) {
                      tabs[activeTabId].url = actualOriginalUrl;
                      saveTabsToStorage();
                    }
                  }
                } catch (e) {
                }
              };
              
              proxyFrame.src = encodedUrl;
            } catch (err) {
              console.error('Error reloading:', err);
              proxyFrame.classList.remove('loading');
            }
          };
          
          attemptReload();
        }
      } else {
        if (mainSearchInput) mainSearchInput.value = '';
        if (addressBarInput) addressBarInput.value = '';
      }
      
      return false;
    });

  document
    .querySelector(".menu-btn")
    ?.addEventListener("click", () => {
    });

	document.addEventListener("glint:settings-updated", initBaremux)

  updateTabDividers();
});

function decodeProxiedUrl(proxiedUrl) {
  try {
    const url = new URL(proxiedUrl);
    
    if (url.pathname.startsWith('/scramjet/')) {
      const encodedUrl = url.pathname.substring('/scramjet/'.length);
      if (encodedUrl) {
        try {
          const decoded = decodeURIComponent(encodedUrl);
          if (decoded.startsWith('http')) {
            return decoded;
          }
          return atob(encodedUrl);
        } catch (e) {
          return encodedUrl;
        }
      }
    }
    
    if (url.searchParams.has('url')) {
      return url.searchParams.get('url');
    }
    
    const pathMatch = url.pathname.match(/^\/proxy\/(.+)$/);
    if (pathMatch) {
      return decodeURIComponent(pathMatch[1]);
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

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
    
    const tabsRef = window.tabs || tabs;
    const addressBarInput = document.querySelector('.address-bar-input');

    if (displayUrl.startsWith(location.origin + "/scramjet/")) {
			displayUrl = decodeURIComponent(
        displayUrl.substring(location.origin.length + "/scramjet/".length)
			);

      if (tabsRef && tabsRef[tabId]) {
        tabsRef[tabId].url = displayUrl;
        tabsRef[tabId].title = getWebsiteName(displayUrl);

        const tabTitle = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-title`);
        if (tabTitle) {
          tabTitle.textContent = tabsRef[tabId].title;
        }
        
        const saveFunction = window.saveTabsToStorage || saveTabsToStorage;
        if (typeof saveFunction === 'function') {
          saveFunction();
        }
      }

      if (addressBarInput) {
        addressBarInput.value = displayUrl;
      }
    }
  } catch (e) {
    console.error("Error updating address bar:", e);
  }
}
