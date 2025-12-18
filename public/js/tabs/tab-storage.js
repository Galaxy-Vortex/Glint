function saveTabsToStorage(immediate = false) {
  const tabs = window.tabs || {};
  const activeTabId = window.activeTabId || 'newtab';
  const tabCounter = window.tabCounter || 1;
  
  if (window.saveTabsTimeout && !immediate) {
    clearTimeout(window.saveTabsTimeout);
  }
  
  const performSave = () => {
    try {
      const tabsData = {};
      for (const [tabId, tabData] of Object.entries(tabs)) {
        if (tabId !== 'newtab' || tabData.url) {
          const originalUrl = window.getOriginalUrl(tabData.url || '');
          
          tabsData[tabId] = {
            url: originalUrl,
            title: tabData.title || 'New Tab',
            favicon: tabData.favicon || '',
            isNewTab: tabData.isNewTab || false
          };
        }
      }
      localStorage.setItem('glint_tabs', JSON.stringify(tabsData));
      localStorage.setItem('glint_activeTabId', activeTabId);
      localStorage.setItem('glint_tabCounter', tabCounter.toString());
    } catch (e) {
      console.error('save tabs error:', e);
    }
    window.saveTabsTimeout = null;
  };
  
  if (immediate) {
    performSave();
  } else {
    window.saveTabsTimeout = setTimeout(performSave, 300);
  }
}

function restoreTabsFromStorage(createTabElement, initializeTab, createProxyFrame) {
  const tabs = window.tabs || {};
  const tabsContainer = document.querySelector(".tabs");
  
  try {
    const savedTabs = localStorage.getItem('glint_tabs');
    const savedActiveTabId = localStorage.getItem('glint_activeTabId');
    const savedTabCounter = localStorage.getItem('glint_tabCounter');

    if (savedTabCounter) {
      window.tabCounter = parseInt(savedTabCounter, 10) || 1;
    }

    if (savedTabs) {
      const tabsData = JSON.parse(savedTabs);
      const existingNewTab = document.querySelector('.tab[data-tab-id="newtab"]');
      
      if (Object.keys(tabsData).length > 0) {
        if (existingNewTab) {
          existingNewTab.remove();
          delete tabs['newtab'];
          const newTabFrame = document.getElementById('proxy-frame-newtab');
          if (newTabFrame) newTabFrame.remove();
        }

        for (const [tabId, tabData] of Object.entries(tabsData)) {
          tabs[tabId] = tabData;
          tabs[tabId].isHistoryNavigation = false;
          
          if (!window.tabHistory[tabId]) {
            window.tabHistory[tabId] = [];
            window.tabHistory[tabId].historyIndex = -1;
          }
          
          if (tabData.url && (tabData.url.startsWith('http://') || tabData.url.startsWith('https://'))) {
            window.addToHistory(tabId, tabData.url);
          }
          
          const newTabElement = createTabElement(tabId, tabData);
          tabsContainer.insertBefore(newTabElement, document.querySelector('.new-tab-btn'));
          initializeTab(newTabElement);
          
          createProxyFrame(tabId);
          
          if (tabData.url && !tabData.isNewTab) {
            if (tabData.url.startsWith('http://') || tabData.url.startsWith('https://')) {
              tabs[tabId].pendingUrl = tabData.url;
            }
          }
        }
        
        if (savedActiveTabId && tabs[savedActiveTabId]) {
          window.activeTabId = savedActiveTabId;
        } else if (Object.keys(tabs).length > 0) {
          window.activeTabId = Object.keys(tabs)[0];
        }
      } else {
        tabs['newtab'] = {
          url: '',
          title: 'New Tab',
          favicon: '',
          isNewTab: true
        };
      }
    } else {
      tabs['newtab'] = {
        url: '',
        title: 'New Tab',
        favicon: '',
        isNewTab: true
      };
    }
  } catch (e) {
    console.error('restore tabs error:', e);
    tabs['newtab'] = {
      url: '',
      title: 'New Tab',
      favicon: '',
      isNewTab: true
    };
  }
  
  return {
    tabs,
    activeTabId: window.activeTabId || 'newtab'
  };
}

window.saveTabsToStorage = saveTabsToStorage;
window.restoreTabsFromStorage = restoreTabsFromStorage;
