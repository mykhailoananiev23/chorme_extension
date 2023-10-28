var clickEvent = new Event("click", { bubbles: true, cancelable: true });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (
    request.greeting === "hello" &&
    window.location.pathname.startsWith("/en-US/ofc-schedule")
  ) {
    sendResponse({ farewell: "goodbye" });
  }
});

var select = document.getElementById("post_select");

var textToMatch = "CHENNAI VAC";

// Loop through the options to find the one with the matching text
for (var i = 0; i < select.options.length; i++) {
  if (select.options[i].text === textToMatch) {
    // Set the selectedIndex to the found option's index
    select.selectedIndex = i;
    break; // Exit the loop once a match is found
  }
}


var openCalendar = document.getElementById("ui-datepicker-div")

setTimeout(function () {
  console.log("openCalendar")
  openCalendar.style.display = "block !important";
}, 10000)

var calender_mon_next = document.querySelector('[data-handler="next"]');

setTimeout(function () {
  if(calender_mon_next){
    calender_mon_next.addEventListener("click", function() {
      // Your code to handle the "next" click goes here
      console.log("Button with data-handler='next' clicked");
    });
  
    // Programmatically trigger the click event
    calender_mon_next.click();
  }
}, 15000)