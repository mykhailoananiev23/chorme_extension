var clickEvent = new Event("click", { bubbles: true, cancelable: true });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (
    request.greeting === "hello" &&
    window.location.pathname.startsWith("/en-US/ofc-schedule")
  ) {
    sendResponse({ farewell: "goodbye" });
  }
});

setTimeout(function () {
  var select = document.getElementById("post_select");

  var textToMatch = "CHENNAI VAC";

  // Loop through the options to find the one with the matching text
  if (select) {
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].text === textToMatch) {
        // Set the selectedIndex to the found option's index
        select.selectedIndex = i;
        break; // Exit the loop once a match is found
      }
    }
  }
  setTimeout(function () {
    var openCalendar = document.getElementById("datepicker");
    openCalendar && openCalendar.focus();
    setTimeout(function () {
      var rollCount = 0;
      var matchedDate;
      function matchData() {
        rollCount++;
        var calender_mon_next = document.querySelector('[data-handler="next"]');
        var days = document.querySelector(".ui-datepicker-calendar");
        var trs = days.childNodes[1].childNodes;
        for (let i = 0; i < trs.length; i++) {
          var tds = trs[i].childNodes;
          if (rollCount > 50) {
            break;
          } else {
            for (let j = 0; j < tds.length; j++) {
              const element = tds[j];
              if (
                element.classList.length > 0 &&
                element.classList.contains("greenday")
              ) {
                matchedDate = element;
                rollCount = 51;
              } else {
                if (calender_mon_next) {
                  calender_mon_next.click();
                  matchData();
                }
              }
            }
          }
        }
      }
      matchData();
      console.log(matchedDate);
    }, 3000);
  }, 4000);
}, 2000);
