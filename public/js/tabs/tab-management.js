function createTabElement(tabId, tabData) {
  const newTabElement = document.createElement('div');
  newTabElement.className = 'tab';
  newTabElement.setAttribute('data-tab-id', tabId);
  
  const faviconHtml = tabData.favicon 
    ? `<img src="${tabData.favicon}" alt="Favicon" class="tab-favicon">`
    : `<div class="tab-favicon-placeholder"><img src="images/logo.png" alt="Glint Logo" class="tab-logo"></div>`;
  
  newTabElement.innerHTML = `
    ${faviconHtml}
    <span class="tab-title">${tabData.title || 'New Tab'}</span>
    <span class="tab-close"><i class="fas fa-times"></i></span>
  `;
  
  return newTabElement;
}

function createNewTab() {
  const tabs = window.tabs || {};
  const tabCounter = window.tabCounter || 1;
  const tabId = `tab-${tabCounter}`;
  window.tabCounter = tabCounter + 1;

  tabs[tabId] = {
    url: '',
    title: 'New Tab',
    favicon: '',
    isNewTab: true,
    isHistoryNavigation: false
  };
  
  window.initTabHistory(tabId);

  const tabsContainer = document.querySelector('.tabs');
  const newTabElement = createTabElement(tabId, tabs[tabId]);
  tabsContainer.insertBefore(newTabElement, document.querySelector('.new-tab-btn'));
  initializeTab(newTabElement);

  window.createProxyFrame(tabId, document.getElementById('proxy-frames-container'));

  window.setActiveTab(tabId);
  window.updateTabDividers();
  
  window.saveTabsToStorage(true);
  
  return tabId;
}

function initializeTab(tabElement) {
  const tabId = tabElement.getAttribute('data-tab-id');

  tabElement.addEventListener('click', (e) => {
    if (e.target.closest('.tab-close')) return;
    window.setActiveTab(tabId);
  });

  const closeButton = tabElement.querySelector('.tab-close');
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    closeTab(tabId);
  });

  tabElement.addEventListener('mousedown', window.handleTabMouseDown);
}

function closeTab(tabId) {
  const tabs = window.tabs || {};
  const activeTabId = window.activeTabId || 'newtab';
  const tabElement = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
  if (!tabElement) return;

  const isActive = activeTabId === tabId;
  let nextActiveTabId = null;

  if (isActive) {
    const allTabs = Array.from(document.querySelectorAll('.tab'));
    const currentIndex = allTabs.indexOf(tabElement);

    if (currentIndex > 0) {
      nextActiveTabId = allTabs[currentIndex - 1].getAttribute('data-tab-id');
    } else if (allTabs.length > 1) {
      nextActiveTabId = allTabs[1].getAttribute('data-tab-id');
    }
  }

  const proxyFrame = document.getElementById(`proxy-frame-${tabId}`);
  if (proxyFrame) proxyFrame.remove();

  if (tabs[tabId]?.navigationMonitor) {
    clearInterval(tabs[tabId].navigationMonitor);
  }

  delete tabs[tabId];

  tabElement.remove();
  window.updateTabDividers();

  if (document.querySelectorAll('.tab').length === 0) {
    createNewTab();
  } else if (isActive && nextActiveTabId) {
    window.setActiveTab(nextActiveTabId);
  }
  
  window.saveTabsToStorage(true);
}

function setActiveTab(tabId) {
  const tabs = window.tabs || {};
  const prevTabId = window.activeTabId || 'newtab';
  const newTabPage = document.querySelector('.new-tab-page');
  const addressBarInput = document.querySelector('.address-bar-input');
  const proxyFramesContainer = document.getElementById('proxy-frames-container');

  window.activeTabId = tabId;

  document.querySelectorAll('.tab').forEach((tab) => {
    const currentTabId = tab.getAttribute('data-tab-id');
    if (currentTabId === tabId) {
      tab.classList.add('active');
      tab.style.transform = 'translateY(1px)';
    } else {
      tab.classList.remove('active');
      tab.style.transform = '';
    }
  });

  const browserContent = document.querySelector('.browser-content');
  
  if (tabs[tabId] && tabs[tabId].isNewTab) {
    newTabPage.style.display = 'flex';

    document.querySelectorAll('.proxy-frame').forEach(frame => {
      frame.style.display = 'none';
      frame.classList.remove('visible');
    });

    if (proxyFramesContainer) {
      proxyFramesContainer.classList.remove('active');
      proxyFramesContainer.style.pointerEvents = 'none';
      proxyFramesContainer.style.zIndex = '1';
    }
    
    if (browserContent) {
      browserContent.classList.remove('frame-active');
    }

    addressBarInput.value = '';
  } else {
    newTabPage.style.display = 'none';

    if (proxyFramesContainer) {
      proxyFramesContainer.classList.add('active');
      proxyFramesContainer.style.pointerEvents = 'auto';
      proxyFramesContainer.style.zIndex = '100';
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
    
    if (browserContent) {
      browserContent.classList.add('frame-active');
    }

    addressBarInput.value = tabs[tabId]?.url || '';
  }

  window.saveTabsToStorage(true);
}

function updateTabDividers() {
  const tabsContainer = document.querySelector('.tabs');
  tabsContainer.querySelectorAll('.tab-divider').forEach((div) => div.remove());
  const tabs = Array.from(tabsContainer.querySelectorAll('.tab'));
  tabs.forEach((tab, idx) => {
    if (idx < tabs.length - 1) {
      const divider = document.createElement('div');
      divider.className = 'tab-divider';
      tab.after(divider);
    }
  });
}

window.createTabElement = createTabElement;
window.createNewTab = createNewTab;
window.initializeTab = initializeTab;
window.closeTab = closeTab;
window.setActiveTab = setActiveTab;
window.updateTabDividers = updateTabDividers;
