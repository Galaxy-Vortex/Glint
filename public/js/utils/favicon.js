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
  const tabs = window.tabs || {};
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
  const tabs = window.tabs || {};
  if (tabs[tabId]) {
    tabs[tabId].faviconLoading = false;
    const originalUrl = window.getOriginalUrl(url);
    tabs[tabId].url = originalUrl;
    tabs[tabId].title = window.getWebsiteName(originalUrl);
    
    const tabTitle = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-title`);
    if (tabTitle) {
      tabTitle.textContent = tabs[tabId].title;
    }
    
    window.saveTabsToStorage();
  }
  
  try {
    const actualUrl = window.decodeProxiedUrl(url) || url;
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

function updateTabFavicon(tabId, frame) {
  const tabs = window.tabs || {};
  if (tabs[tabId]?.favicon && !tabs[tabId].favicon.includes('favicon-proxy')) {
    return;
  }
  
  if (tabs[tabId]?.faviconLoading) {
    return;
  }
  
  tabs[tabId].faviconLoading = false;
}

window.checkFaviconExists = checkFaviconExists;
window.setTabFavicon = setTabFavicon;
window.updateTabFaviconForUrl = updateTabFaviconForUrl;
window.updateTabFavicon = updateTabFavicon;
