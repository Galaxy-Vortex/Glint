function createProxyFrame(tabId, container) {
  const frame = document.createElement('iframe');
  frame.id = `proxy-frame-${tabId}`;
  frame.className = 'proxy-frame';
  frame.style.display = 'none';
  frame.style.border = 'none';
  frame.style.width = '100%';
  frame.style.height = 'calc(100vh - 92px)';
  frame.style.pointerEvents = 'auto';
  frame.style.position = 'relative';
  frame.style.zIndex = '10';
  frame.setAttribute('loading', 'lazy');
  frame.setAttribute('scrolling', 'yes');
  frame.setAttribute('allowtransparency', 'true');
  frame.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen');

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

        if (frameWindow.document && frameWindow.document.body) {
          frameWindow.document.body.style.overflow = 'auto';
          frameWindow.document.documentElement.style.overflow = 'auto';
        }
      }
    } catch (e) {
    }
  };

  frame.onload = defaultOnload;

  const ensureScrollable = () => {
    try {
      if (frame.contentWindow && frame.contentWindow.document) {
        const doc = frame.contentWindow.document;
        if (doc.body) {
          doc.body.style.overflow = 'auto';
          doc.body.style.overflowY = 'auto';
          doc.body.style.overflowX = 'auto';
        }
        if (doc.documentElement) {
          doc.documentElement.style.overflow = 'auto';
          doc.documentElement.style.overflowY = 'auto';
          doc.documentElement.style.overflowX = 'auto';
        }

        let styleEl = doc.getElementById('_glint-scroll-fix');
        if (!styleEl) {
          styleEl = doc.createElement('style');
          styleEl.id = '_glint-scroll-fix';
          styleEl.textContent = `
            html, body {
              overflow: auto !important;
              overflow-y: auto !important;
              overflow-x: auto !important;
              height: auto !important;
            }
          `;
          doc.head.appendChild(styleEl);
        }
      }
    } catch (e) {
    }
  };

  frame.addEventListener('load', ensureScrollable);

  const checkInterval = setInterval(() => {
    if (frame.contentWindow && frame.contentWindow.document && frame.contentWindow.document.body) {
      ensureScrollable();
      clearInterval(checkInterval);
    }
  }, 100);

  setTimeout(() => clearInterval(checkInterval), 5000);

  frame.style.overflow = 'auto';
  frame.style.overflowY = 'auto';
  frame.style.overflowX = 'auto';

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
