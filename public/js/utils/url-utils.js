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

function getOriginalUrl(url) {
  if (!url) return '';
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('/scramjet/') && url.includes(location.origin)) {
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
  if (decoded && (decoded.startsWith('http://') || decoded.startsWith('https://'))) {
    if (decoded.includes('/scramjet/') && decoded.includes(location.origin)) {
      return getOriginalUrl(decoded); 
    }
    return decoded;
  }
  
  if (url.includes('/scramjet/')) {
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
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
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

function updateAddressBar(url, tabId) {
  try {
    let displayUrl = url;
    
    const tabsRef = window.tabs || {};
    const addressBarInput = document.querySelector('.address-bar-input');

    if (displayUrl.startsWith(location.origin + '/scramjet/')) {
      displayUrl = decodeURIComponent(
        displayUrl.substring(location.origin.length + '/scramjet/'.length)
      );

      if (tabsRef && tabsRef[tabId]) {
        tabsRef[tabId].url = displayUrl;
        tabsRef[tabId].title = getWebsiteName(displayUrl);

        const tabTitle = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-title`);
        if (tabTitle) {
          tabTitle.textContent = tabsRef[tabId].title;
        }
        
        const saveFunction = window.saveTabsToStorage || (() => {});
        if (typeof saveFunction === 'function') {
          saveFunction();
        }
      }

      if (addressBarInput) {
        addressBarInput.value = displayUrl;
      }
      }
    } catch (e) {
      console.error('address bar update error:', e);
    }
}

window.decodeProxiedUrl = decodeProxiedUrl;
window.getOriginalUrl = getOriginalUrl;
window.getWebsiteName = getWebsiteName;
window.updateAddressBar = updateAddressBar;
