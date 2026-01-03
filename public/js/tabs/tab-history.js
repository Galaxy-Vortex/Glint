const tabHistory = {};

function addToHistory(tabId, url) {
  if (!tabHistory[tabId]) {
    tabHistory[tabId] = [];
    tabHistory[tabId].historyIndex = -1;
  }

  const history = tabHistory[tabId];
  const originalUrl = window.getOriginalUrl(url);

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

function initTabHistory(tabId) {
  if (!tabHistory[tabId]) {
    tabHistory[tabId] = [];
    tabHistory[tabId].historyIndex = -1;
  }
}

window.tabHistory = tabHistory;
window.addToHistory = addToHistory;
window.getPreviousUrl = getPreviousUrl;
window.getNextUrl = getNextUrl;
window.moveHistoryBack = moveHistoryBack;
window.moveHistoryForward = moveHistoryForward;
window.initTabHistory = initTabHistory;
