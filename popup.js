document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("auto_booking").addEventListener("click", sendData);
});

function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function sendData() {
  var textarea = document.getElementById("userInfo");
  if(!isJSON(textarea.value)){
    alert("Please input your infomation correctly!")
    return false;
  }
  var userInfo = JSON.parse(textarea.value)

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    var newUrl = "https://www.usvisascheduling.com/en-US/ofc-schedule/";
    chrome.tabs.update(activeTab.id, { url: newUrl }, function name(params) {
      (async () => {
        try {
          const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
          const response = await chrome.tabs.sendMessage(tab.id, {greeting: "hello", user: userInfo});
          // do something with response here, not outside the function
          console.log(response);
          return true;
        } catch (error) {
          console.log(error)
          return false;          
        }
      })();
    });
  });
}