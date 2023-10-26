document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("auto_booking").addEventListener("click", sendData);
});

function sendData() {
  var inputData = "Hello World!";
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    var newUrl = "https://www.usvisascheduling.com/en-US/";
    chrome.tabs.update(activeTab.id, { url: newUrl }, function name(params) {
         var inputData = "Test is Successful";
      (async () => {
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        const response = await chrome.tabs.sendMessage(tab.id, {greeting: "hello", user: inputData});
        // do something with response here, not outside the function
        console.log(response);
      })();
    });
  });
}