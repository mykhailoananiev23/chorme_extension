chrome.action.onClicked.addListener(function (tab) {
  // Change the URL here
  var newUrl =
    "https://www.usvisascheduling.com/en-US/ofc-schedule/?reschedule=true";

  // Redirect the current tab
  chrome.tabs.update(tab.id, { url: newUrl });
});