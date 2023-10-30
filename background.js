let activeTabInfo = {};

// Listen for tab activation and update the active tab information
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    activeTabInfo = {
      id: tab.id,
      url: tab.url,
      title: tab.title
    };
  });
});

// Create a function to retrieve the remembered active tab information
function getActiveTabInfo(callback) {
  callback(activeTabInfo);
}

// Listen for messages requesting the active tab information
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getActiveTabInfo") {
    getActiveTabInfo(sendResponse);
  }
});