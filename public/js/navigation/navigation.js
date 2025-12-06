function navigateTo(url, tabId) {
  const tabs = window.tabs || {};
  const newTabPage = document.querySelector('.new-tab-page');
  const addressBarInput = document.querySelector('.address-bar-input');
  const proxyFramesContainer = document.getElementById('proxy-frames-container');
  
  if (!tabs[tabId]) {
    tabs[tabId] = { url: '', title: 'New Tab', favicon: '', isNewTab: true };
  }
  
  const originalUrl = window.getOriginalUrl(url);
  
  if (!originalUrl || (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://'))) {
    console.error('invalid url:', originalUrl);
    return;
  }
  
  tabs[tabId].url = originalUrl;
  tabs[tabId].title = window.getWebsiteName(originalUrl);
  tabs[tabId].isNewTab = false;

  const tabTitle = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-title`);
  if (tabTitle) {
    tabTitle.textContent = tabs[tabId].title;
  }
  
  window.saveTabsToStorage(true);

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
      
      window.checkFaviconExists(faviconSources[sourceIndex], (exists) => {
        if (exists && !faviconLoaded && tabs[tabId]?.faviconLoading) {
          faviconLoaded = true;
          window.setTabFavicon(tabId, faviconSources[sourceIndex]);
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

  let proxyFrame = document.getElementById(`proxy-frame-${tabId}`);
  if (!proxyFrame) {
    const proxyFramesContainer = document.getElementById('proxy-frames-container');
    if (!proxyFramesContainer) {
      console.error('Proxy frames container not found');
      return;
    }
    proxyFrame = window.createProxyFrame(tabId, proxyFramesContainer);
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
      
      if (urlToEncode.includes('/scramjet/') || urlToEncode.includes(location.origin + '/scramjet/')) {
        const decoded = window.getOriginalUrl(urlToEncode);
        if (decoded && (decoded.startsWith('http://') || decoded.startsWith('https://'))) {
          urlToEncode = decoded;
        }
      }
      
      if (!window.scramjet || !window.scramjet.encodeUrl) {
        console.error('scramjet not ready');
        return;
      }
      
      const encodedUrl = window.scramjet.encodeUrl(urlToEncode);
      
      if (!encodedUrl) {
        console.error('encode failed:', urlToEncode);
        return;
      }
      
      if (!tabs[tabId].isHistoryNavigation) {
        window.addToHistory(tabId, originalUrl);
      }
      tabs[tabId].isHistoryNavigation = false;

      if (tabs[tabId]?.navigationMonitor) {
        clearInterval(tabs[tabId].navigationMonitor);
      }

      proxyFrame.onload = () => {
        proxyFrame.classList.remove('loading');
        window.updateTabFavicon(tabId, proxyFrame);

        window.startIframeNavigationMonitor(proxyFrame, tabId);

        try {
          const frameWindow = proxyFrame.contentWindow;
          if (frameWindow) {
            const currentURL = frameWindow.location.href;
            window.updateAddressBar(currentURL, tabId);
            window.updateTabFaviconForUrl(tabId, currentURL);
            
            const actualOriginalUrl = window.getOriginalUrl(currentURL);
            if (actualOriginalUrl !== originalUrl && !tabs[tabId].isHistoryNavigation) {
              window.addToHistory(tabId, actualOriginalUrl);
            }
          }
        } catch (e) {
        }
      };
      
      proxyFrame.src = encodedUrl;
      addressBarInput.value = originalUrl;
    } catch (err) {
      console.error('navigation error:', err);
      proxyFrame.classList.remove('loading');
    }
  };
  
  attemptNavigation();
}

function handleSearch(searchTerm, tabId) {
  if (!searchTerm || !tabId) return;

  const settings = window.glintSettings || {};
  const currentEngine = settings.searchEngine || 'google';
  const searchEngines = settings.searchEngines || {
    google: 'https://www.google.com/search?q=%s',
    blank: 'about:blank'
  };

  let url = searchTerm;

  if (!searchTerm.startsWith('http://') && !searchTerm.startsWith('https://')) {
    if (searchTerm.includes('.') && !searchTerm.includes(' ')) {
      url = `https://${searchTerm}`;
    } else if (currentEngine === 'blank') {
      url = 'about:blank';
    } else {
      const engineUrl = searchEngines[currentEngine] || searchEngines.google;
      url = engineUrl.replace('%s', encodeURIComponent(searchTerm));
    }
  }

  navigateTo(url, tabId);
}

function initNavigationControls() {
  const tabs = window.tabs || {};
  const activeTabId = window.activeTabId || 'newtab';
  const addressBarInput = document.querySelector('.address-bar-input');
  const mainSearchInput = document.querySelector('.main-search-input');
  const newTabPage = document.querySelector('.new-tab-page');

  document.querySelector('.back-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (tabs[activeTabId] && !tabs[activeTabId].isNewTab) {
      const previousUrl = window.getPreviousUrl(activeTabId);
      if (previousUrl) {
        window.moveHistoryBack(activeTabId);
        
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
              const urlToEncode = window.getOriginalUrl(previousUrl);
              const encodedUrl = window.scramjet.encodeUrl(urlToEncode);
              
              tabs[activeTabId].url = urlToEncode;
              tabs[activeTabId].title = window.getWebsiteName(urlToEncode);
              addressBarInput.value = urlToEncode;
              
              const tabTitle = document.querySelector(`.tab[data-tab-id="${activeTabId}"] .tab-title`);
              if (tabTitle) {
                tabTitle.textContent = tabs[activeTabId].title;
              }
              
              if (tabs[activeTabId]?.navigationMonitor) {
                clearInterval(tabs[activeTabId].navigationMonitor);
              }

              proxyFrame.onload = () => {
                proxyFrame.classList.remove('loading');
                window.updateTabFavicon(activeTabId, proxyFrame);
                
                window.startIframeNavigationMonitor(proxyFrame, activeTabId);
                
                try {
                  const frameWindow = proxyFrame.contentWindow;
                  if (frameWindow) {
                    const currentURL = frameWindow.location.href;
                    window.updateAddressBar(currentURL, activeTabId);
                    window.updateTabFaviconForUrl(activeTabId, currentURL);
                    
                    const actualOriginalUrl = window.getOriginalUrl(currentURL);
                    if (tabs[activeTabId]) {
                      tabs[activeTabId].url = actualOriginalUrl;
                      tabs[activeTabId].isHistoryNavigation = false;
                      window.saveTabsToStorage();
                    }
                  }
                } catch (e) {
                  tabs[activeTabId].isHistoryNavigation = false;
                }
              };
              
              proxyFrame.src = encodedUrl;
            } catch (err) {
              console.error('back nav error:', err);
              proxyFrame.classList.remove('loading');
              window.moveHistoryForward(activeTabId);
              tabs[activeTabId].isHistoryNavigation = false;
            }
          };
          
          attemptBack();
        }
      }
    }
    
    return false;
  });

  document.querySelector('.forward-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (tabs[activeTabId] && !tabs[activeTabId].isNewTab) {
      const nextUrl = window.getNextUrl(activeTabId);
      if (nextUrl) {
        window.moveHistoryForward(activeTabId);
        
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
              const urlToEncode = window.getOriginalUrl(nextUrl);
              const encodedUrl = window.scramjet.encodeUrl(urlToEncode);
              
              tabs[activeTabId].url = urlToEncode;
              tabs[activeTabId].title = window.getWebsiteName(urlToEncode);
              addressBarInput.value = urlToEncode;
              
              const tabTitle = document.querySelector(`.tab[data-tab-id="${activeTabId}"] .tab-title`);
              if (tabTitle) {
                tabTitle.textContent = tabs[activeTabId].title;
              }
              
              if (tabs[activeTabId]?.navigationMonitor) {
                clearInterval(tabs[activeTabId].navigationMonitor);
              }

              proxyFrame.onload = () => {
                proxyFrame.classList.remove('loading');
                window.updateTabFavicon(activeTabId, proxyFrame);
                
                window.startIframeNavigationMonitor(proxyFrame, activeTabId);
                
                try {
                  const frameWindow = proxyFrame.contentWindow;
                  if (frameWindow) {
                    const currentURL = frameWindow.location.href;
                    window.updateAddressBar(currentURL, activeTabId);
                    window.updateTabFaviconForUrl(activeTabId, currentURL);
                    
                    const actualOriginalUrl = window.getOriginalUrl(currentURL);
                    if (tabs[activeTabId]) {
                      tabs[activeTabId].url = actualOriginalUrl;
                      tabs[activeTabId].isHistoryNavigation = false;
                      window.saveTabsToStorage();
                    }
                  }
                } catch (e) {
                  tabs[activeTabId].isHistoryNavigation = false;
                }
              };
              
              proxyFrame.src = encodedUrl;
            } catch (err) {
              console.error('forward nav error:', err);
              proxyFrame.classList.remove('loading');
              window.moveHistoryBack(activeTabId);
              tabs[activeTabId].isHistoryNavigation = false;
            }
          };
          
          attemptForward();
        }
      }
    }
    
    return false;
  });

  document.querySelector('.reload-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (tabs[activeTabId] && !tabs[activeTabId].isNewTab) {
      const proxyFrame = document.getElementById(`proxy-frame-${activeTabId}`);
      if (proxyFrame && window.scramjet) {
        const currentUrl = tabs[activeTabId].url || '';
        if (!currentUrl) {
          return false;
        }
        
        const originalUrl = window.getOriginalUrl(currentUrl);
        if (!originalUrl || (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://'))) {
          return false;
        }
        
        proxyFrame.classList.add('loading');
        
        const attemptReload = () => {
          if (!window.scramjet || !window.scramjet.encodeUrl) {
            setTimeout(attemptReload, 100);
            return;
          }
          
          try {
            const urlToEncode = window.getOriginalUrl(originalUrl);
            const encodedUrl = window.scramjet.encodeUrl(urlToEncode);
            
            if (tabs[activeTabId]?.navigationMonitor) {
                clearInterval(tabs[activeTabId].navigationMonitor);
              }

              proxyFrame.onload = () => {
                proxyFrame.classList.remove('loading');
                window.updateTabFavicon(activeTabId, proxyFrame);
                
                window.startIframeNavigationMonitor(proxyFrame, activeTabId);
              
              try {
                const frameWindow = proxyFrame.contentWindow;
                if (frameWindow) {
                  const currentURL = frameWindow.location.href;
                  window.updateAddressBar(currentURL, activeTabId);
                  window.updateTabFaviconForUrl(activeTabId, currentURL);
                  
                  const actualOriginalUrl = window.getOriginalUrl(currentURL);
                  if (tabs[activeTabId]) {
                    tabs[activeTabId].url = actualOriginalUrl;
                    window.saveTabsToStorage();
                  }
                }
              } catch (e) {
              }
            };
            
            proxyFrame.src = encodedUrl;
          } catch (err) {
            console.error('reload error:', err);
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
}

window.navigateTo = navigateTo;
window.handleSearch = handleSearch;
window.initNavigationControls = initNavigationControls;
