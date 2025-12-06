function createProxyFrame(tabId, container) {
  const frame = document.createElement('iframe');
  frame.id = `proxy-frame-${tabId}`;
  frame.className = 'proxy-frame';
  frame.style.display = 'none';
  frame.style.border = 'none';
  frame.style.width = '100%';
  frame.style.height = '100%';
  frame.setAttribute('loading', 'lazy');
  container.appendChild(frame);

  frame.classList.add('loading');

  const defaultOnload = () => {
    frame.classList.remove('loading');
    window.updateTabFavicon(tabId, frame);

    try {
      const frameWindow = frame.contentWindow;
      if (frameWindow && frame.src) {
        const currentURL = frameWindow.location.href;
        window.updateAddressBar(currentURL, tabId);
        window.updateTabFaviconForUrl(tabId, currentURL);

        const tabs = window.tabs || {};
        if (tabs[tabId] && !tabs[tabId].isNewTab && frame.src) {
          if (tabs[tabId]?.navigationMonitor) {
            clearInterval(tabs[tabId].navigationMonitor);
          }
          window.startIframeNavigationMonitor(frame, tabId);
        }
      }
    } catch (e) {
    }
  };

  frame.onload = defaultOnload;

  return frame;
}

function startIframeNavigationMonitor(iframe, tabId) {
  const tabs = window.tabs || {};
  let lastUrl = '';

  const checkForNavigation = () => {
    try {
      const frameWindow = iframe.contentWindow;
      if (frameWindow && tabs[tabId]) {
        const currentURL = frameWindow.location.href;

        if (currentURL !== lastUrl) {
          lastUrl = currentURL;
          window.updateAddressBar(currentURL, tabId);
          window.updateTabFaviconForUrl(tabId, currentURL);

          if (tabs[tabId]) {
            const originalUrl = window.getOriginalUrl(currentURL);
            tabs[tabId].url = originalUrl;

            if (!tabs[tabId].isHistoryNavigation) {
              window.addToHistory(tabId, originalUrl);
            }

            tabs[tabId].title = window.getWebsiteName(originalUrl);

            const tabTitle = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-title`);
            if (tabTitle) {
              tabTitle.textContent = tabs[tabId].title;
            }

            window.saveTabsToStorage();
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

window.createProxyFrame = createProxyFrame;
window.startIframeNavigationMonitor = startIframeNavigationMonitor;
