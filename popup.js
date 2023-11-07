document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("auto_booking").addEventListener("click", sendData);
  document.getElementById("stop_booking").addEventListener("click", stopProcess)
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
  textarea.value = ""
  chrome.storage.local.set({ userInfo: userInfo }, function() {
    console.log("Data saved successfully!");
  });
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    // tabs is an array of tabs that match the query
    if (tabs.length > 0) {
        const currentTab = tabs[0];
        chrome.tabs.sendMessage(currentTab.id, { type: 'popup-message', message: userInfo });
    } else {
        console.log('No active tabs found.');
    }
  });
}

function stopProcess() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    // tabs is an array of tabs that match the query
    if (tabs.length > 0) {
        const currentTab = tabs[0];
        chrome.tabs.sendMessage(currentTab.id, { type: 'action_stop', message: "Stop Process" });
    } else {
        console.log('No active tabs found.');
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if(message.type == "req_UserInfo"){
    chrome.storage.local.get("userInfo", function(result) {
      if(result){
        console.log(result.userInfo);
        var userInfo = result.userInfo;
        setTimeout(() => {
          chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            console.log("workflow2 send data")
            chrome.tabs.sendMessage(tabs[0].id, { type:"workflow2", message: userInfo });
          })
        }, 12000);
      }
    });
  }
});