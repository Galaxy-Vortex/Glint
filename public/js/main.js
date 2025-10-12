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
          updateTabFaviconForUrl(tabId, currentURL);
        }
      } catch (e) {
      }
    };

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
      tabs[tabId].url = url;
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
        if (frameWindow) {
          const currentURL = frameWindow.location.href;
          
          if (currentURL !== lastUrl) {
            lastUrl = currentURL;
            updateAddressBar(currentURL, tabId);
            updateTabFaviconForUrl(tabId, currentURL);
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
    newTabElement.setAttribute("draggable", "true");
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

    tabElement.addEventListener("dragstart", handleDragStart);
    tabElement.addEventListener("dragover", handleDragOver);
    tabElement.addEventListener("drop", handleDrop);
    tabElement.addEventListener("dragend", handleDragEnd);
    tabElement.addEventListener("dragenter", handleDragEnter);
    tabElement.addEventListener("dragleave", handleDragLeave);
  };

  let draggedTab = null;
  let draggedTabId = null;

  const handleDragStart = (e) => {
    draggedTab = e.target;
    draggedTabId = e.target.getAttribute("data-tab-id");
    
    e.target.classList.add("dragging");
    
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    
    const dragImage = e.target.cloneNode(true);
    dragImage.style.opacity = "0.8";
    dragImage.style.transform = "rotate(5deg)";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    if (e.target.classList.contains("tab") && e.target !== draggedTab) {
      e.target.classList.add("drag-over");
    }
  };

  const handleDragLeave = (e) => {
    if (e.target.classList.contains("tab")) {
      e.target.classList.remove("drag-over");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    const dropTarget = e.target.closest(".tab");
    if (dropTarget && dropTarget !== draggedTab) {
      const dropTargetId = dropTarget.getAttribute("data-tab-id");
      reorderTabs(draggedTabId, dropTargetId);
    }
    
    document.querySelectorAll(".tab").forEach(tab => {
      tab.classList.remove("drag-over");
    });
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove("dragging");
    
    document.querySelectorAll(".tab").forEach(tab => {
      tab.classList.remove("drag-over");
    });
    
    draggedTab = null;
    draggedTabId = null;
  };

  const reorderTabs = (draggedId, targetId) => {
    const draggedElement = document.querySelector(`.tab[data-tab-id="${draggedId}"]`);
    const targetElement = document.querySelector(`.tab[data-tab-id="${targetId}"]`);
    
    if (!draggedElement || !targetElement) return;
    
    const tabsContainer = document.querySelector(".tabs");
    const allTabs = Array.from(tabsContainer.querySelectorAll(".tab"));
    
    const draggedIndex = allTabs.indexOf(draggedElement);
    const targetIndex = allTabs.indexOf(targetElement);
    
    if (draggedIndex < targetIndex) {
      targetElement.parentNode.insertBefore(draggedElement, targetElement.nextSibling);
    } else {
      targetElement.parentNode.insertBefore(draggedElement, targetElement);
    }
    
    updateTabDividers();
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

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
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
      console.log('Error preloading favicon:', err);
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

      proxyFrame.src = scramjet.encodeUrl(url);
      addressBarInput.value = url;

      proxyFrame.onload = () => {
        proxyFrame.classList.remove('loading');
        updateTabFavicon(tabId, proxyFrame);

        try {
          const frameWindow = proxyFrame.contentWindow;
          if (frameWindow) {
            const currentURL = frameWindow.location.href;
            updateAddressBar(currentURL, tabId);
            updateTabFaviconForUrl(tabId, currentURL);
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

            startIframeNavigationMonitor(proxyFrame, activeTabId);

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
        tabsRef[tabId].title = displayUrl.length > 20
          ? displayUrl.substring(0, 20) + '...'
          : displayUrl;

        const tabTitle = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-title`);
        if (tabTitle) {
          tabTitle.textContent = tabsRef[tabId].title;
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
