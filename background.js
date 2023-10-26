chrome.action.onClicked.addListener(function (tab) {
  // Change the URL here
  var newUrl =
    "https://www.usvisascheduling.com/en-US/ofc-schedule/?reschedule=true";

  // Redirect the current tab
  chrome.tabs.update(tab.id, { url: newUrl });
});

(async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  const response = await chrome.tabs.sendMessage(tab.id, { greeting: "hello" });
  // do something with response here, not outside the function
  console.log(response);
})();