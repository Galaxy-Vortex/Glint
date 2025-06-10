document.addEventListener("DOMContentLoaded", () => {
  const historyBtn = document.querySelector(".history-btn");
  const historyMenu = document.getElementById("history-menu");
  const closeHistoryBtn = document.querySelector(".close-history");
  const clearHistoryBtn = document.querySelector(".clear-history-btn");
  const historyList = document.getElementById("history-list");
  const optionsOverlay = document.getElementById("options-overlay");

  let browsingHistory = JSON.parse(localStorage.getItem("glintBrowsingHistory") || "[]");

  function showHistoryModal() {
    historyMenu.classList.add("show");
    optionsOverlay.classList.remove("hidden");
    renderHistoryItems();
  }

  function hideHistoryModal() {
    historyMenu.classList.remove("show");
    optionsOverlay.classList.add("hidden");
  }

  // Clear history
  function clearHistory() {
    browsingHistory = [];
    localStorage.setItem("glintBrowsingHistory", JSON.stringify(browsingHistory));
    renderHistoryItems();
  }

  function addToHistory(url, title, favicon) {
    if (!url || url === "" || url === "about:blank") return;

    const entry = {
      url,
      title: title || url,
      favicon: favicon || "",
      timestamp: Date.now()
    };

    // Remove duplicates
    browsingHistory = browsingHistory.filter(item => item.url !== url);

    browsingHistory.unshift(entry);

    if (browsingHistory.length > 100) {
      browsingHistory.pop();
    }

    localStorage.setItem("glintBrowsingHistory", JSON.stringify(browsingHistory));
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    if (date > oneWeekAgo) {
      return `${date.toLocaleDateString(undefined, { weekday: 'long' })} at ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  function renderHistoryItems() {
    historyList.innerHTML = "";

    if (browsingHistory.length === 0) {
      historyList.innerHTML = `
        <div class="history-empty">
          <i class="fas fa-history"></i>
          <p>No browsing history yet</p>
        </div>
      `;
      return;
    }

    browsingHistory.forEach(item => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";
      historyItem.innerHTML = `
        ${item.favicon ? 
          `<img src="${item.favicon}" class="history-item-favicon" alt="">` : 
          `<div class="history-item-favicon-placeholder">
            ${item.url.includes("://") ? new URL(item.url).hostname.charAt(0).toUpperCase() : "G"}
          </div>`
        }
        <div class="history-item-content">
          <div class="history-item-title">${item.title}</div>
          <div class="history-item-url">${item.url}</div>
        </div>
        <div class="history-item-time">${formatTimestamp(item.timestamp)}</div>
      `;

      historyItem.addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent('navigate-to-url', {
          detail: { url: item.url }
        }));
        hideHistoryModal();
      });

      historyList.appendChild(historyItem);
    });
  }

  if (historyBtn) {
    historyBtn.addEventListener("click", showHistoryModal);
  }

  if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener("click", hideHistoryModal);
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", clearHistory);
  }

  optionsOverlay.addEventListener("click", (e) => {
    if (historyMenu.classList.contains("show")) {
      hideHistoryModal();
    }
  });

  window.addEventListener('add-to-history', (event) => {
    const { url, title, favicon } = event.detail;
    addToHistory(url, title, favicon);
  });

  window.glintHistory = {
    addToHistory,
    clearHistory,
    getHistory: () => browsingHistory
  };
}); 