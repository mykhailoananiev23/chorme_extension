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
//   var textarea = document.getElementById("userInfo");
//   if(!isJSON(textarea.value)){
//     alert("Please input your infomation correctly!")
//     return false;
//   }
//   var userInfo = JSON.parse(textarea.value)
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    // tabs is an array of tabs that match the query
    if (tabs.length > 0) {
        const currentTab = tabs[0];
        // var newUrl = "https://www.usvisascheduling.com/en-US/ofc-schedule/";
        // chrome.tabs.update(currentTab.id, { url: newUrl }, function () {
            chrome.tabs.sendMessage(currentTab.id, { type: 'popup-message', message: "Message test is success!" });
        // });
    } else {
        console.log('No active tabs found.');
    }
});
}