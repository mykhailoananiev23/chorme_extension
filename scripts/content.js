chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  if (
    request.greeting === "hello" &&
    window.location.pathname.startsWith("/en-US/ofc-schedule/")
  ) {
    alert(request.user);
    sendResponse({ farewell: "goodbye" });
  }
});
