var userInfo; // Data inputted by user
var ele_matchTimes = [], // Matched Dates in /OFC-schedule/
  ele_matchTimes2 = []; // Matched Dates in /schedule/
var post_pointer = 0, post_pointer2 = 0; // Post recyling value
var lp_pos = 0,
  lp_pos2 = 0; // Matched Dates Loop event value
var action_stop = false; // Stop Action Flag
var ofc_waitTime = 500; // default Post schedule waiting time.

// wait for data from plugin
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "ofc-schedule_start") {
    const message = request.message; // from popup.js
    userInfo = message;
    ofc_waitTime = Number(userInfo["OFC-waitTime"]) * 1000;
    if (window.location.pathname.toLowerCase() == "/en-us/ofc-schedule/") {
      action_stop = false;
      step0(); //start OFC-schedule steps
    }
  } else if (request.type === "workflow2") {
    const message = request.message;
    userInfo = message;
    if (window.location.pathname.toLowerCase() == "/en-us/schedule/") {
      action_stop = false;
      next_step0(); //start schedule steps
    }
  } else if (request.type === "action_stop") {
    action_stop = true;
    alert("Stop scheduling"); // Stop Action
  }
});

function convertDate(str, day) {
  const parts = str.split(",");
  const monthName = parts[0];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames.indexOf(monthName);
  const year = parseInt(parts[1], 10);
  var result = day
    ? new Date(year, month, Number(day))
    : new Date(year, month, 14);
  return result;
}

function convrtTime(str) {
  const [hours, minutes] = str.split(":");
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));

  return date;
}

try {
  // functions to execute in order to select date and submit
  let waitTime = 100;
  function step0() {
    // wait for ofc load
    var g_mem = document.getElementById("gm_select");
    if (g_mem) {
      if (g_mem.childNodes.length < 1) {
        return setTimeout(step0, waitTime);
      } else {
        return setTimeout(step1, waitTime);
      }
    }
  }
  function step1() {
    // set OFC Post value setting
    if (action_stop) {
      return false;
    }
    console.log(`1 : set OFC Post value setting`);
    var post_select = document.getElementById("post_select");
    if (post_select) {
      for (var i = 0; i < post_select.options.length; i++) {
        if (
          post_select.options[i].text ==
          userInfo["OFC-POST"][post_pointer % userInfo["OFC-POST"].length]
        ) {
          post_select.value = post_select.options[i].value;
          const event = new Event("change", {
            bubbles: true, // Allow the event to bubble up the DOM tree
            cancelable: true, // Allow the event to be cancelable
          });
          post_select.dispatchEvent(event);
          break; // Exit the loop once a match is found
        }
      }
    }
    return step2();
  }
  function step2() {
    if (action_stop) {
      return false;
    }
    // open the Calendar
    console.log(`2 : wait for calendar`);
    var openCalendar = document.getElementById("datepicker");
    if (openCalendar) {
      if (openCalendar.value == "") {
        post_pointer++;
        if((post_pointer % userInfo["OFC-POST"].length) == 0){
          console.log("wait 5 seconds");
          return setTimeout(step1, ofc_waitTime);
        } else {
          return setTimeout(step1, waitTime)
        }
      } else {
        if (openCalendar.value == "Loading...") {
          setTimeout(step2, waitTime);
        } else if (openCalendar.value == "Select Date") {
          return step3();
        }
      }
    }
  }
  function step3() {
    if (action_stop) {
      // Stop Action
      return false;
    }
    // search available dates and set one that meets critera
    console.log(`3 : search available dates and set one that meets critera...`);
    let datesHolder = document.querySelector("#myDataHolder");
    let availableDates = datesHolder.getAttribute("availabledays");

    availableDates = JSON.parse(availableDates);
    availableDates = availableDates.ScheduleDays;

    if (availableDates && availableDates.length > 0) {
      console.log(availableDates)
      let cond_day_start = new Date(userInfo["startdate-OFC"]);
      let cond_day_end = new Date(userInfo["enddate-OFC"]);

      // search for date that matches critera
      for (let i = 0; i < availableDates.length; i++) {
        let availableDay = new Date(availableDates[i].Date);
        console.log(availableDay)

        if ((availableDay >= cond_day_start) && (availableDay <= cond_day_end)) {
          ele_matchTimes.push(availableDates[i]);
        }
        if(i == (availableDates.length - 1)){
          console.log(ele_matchTimes.length)
        }
        if ((i == (availableDates.length - 1)) && (ele_matchTimes.length == 0)) {
          post_pointer++;
          console.log(
            `No matched data in ${
              userInfo["OFC-POST"][(post_pointer - 1) % userInfo["OFC-POST"].length]
            }`
          );
          if((post_pointer % userInfo["OFC-POST"].length) == 0){
            console.log("wait 5 seconds");
            return setTimeout(step1, ofc_waitTime);
          } else {
            return setTimeout(step1, waitTime)
          }
        }
      }

      if (ele_matchTimes.length == 0) {
        console.log(`no date available that matches critera`);
        return;
      }

      return step4();
    } else {
      return;
    }
  }
  function step4() {
    if (action_stop) {
      return false;
    }
    if (lp_pos == ele_matchTimes.length) {
      post_pointer++;
      if((post_pointer % userInfo["OFC-POST"].length) == 0){
        console.log("wait 5 seconds");
        return setTimeout(step1, ofc_waitTime);
      } else {
        return setTimeout(step1, waitTime)
      };
    }
    if (ele_matchTimes.length == 0) {
      return;
    }
    const foundDate = new Date(ele_matchTimes[lp_pos].Date);
    const foundDateObj = ele_matchTimes[lp_pos];
    document.querySelector("#datepicker").value = `${
      foundDate.getMonth() + 1
    }/${foundDate.getDate()}/${foundDate.getFullYear()}`;

    // inject a script to substitute for calender onSelect event
    const getDateTimes = document.createElement("button");
    getDateTimes.setAttribute(
      "onClick",
      `(()=> {
        jsdata.scheduleDayId = "${foundDateObj.ID}"
        getScheduleEntries(function (data) {
            var lHtml = "";
            var rHtml = "";
  
            for (var i = 0; i < data.length; i++) {
                var id = data[i].ID;
                var time = data[i].Time;
                var slots = data[i].EntriesAvailable;
                var html = [];
                html.push('<li class="list-group-item py-0">');
                html.push('<div class="radio">');
                html.push('<label>');
                html.push('<input type="radio" id="' + id + '" name="schedule-entries" value="' + id
                    + '" data-slots="' + slots + '" onclick="onSelectScheduleEntry(this)">');
                html.push(time + ' (' + slots + ')');
                html.push('</label>');
                html.push('</div>');
                html.push('</li>')
  
                if (i % 2) {
                    rHtml += html.join("");
                }
                else {
                    lHtml += html.join("");
                }
            }
  
            $("#time_select_left").html(lHtml);
            $("#time_select_right").html(rHtml);
        });
  
      })()`
    );
    document.head.appendChild(getDateTimes);
    getDateTimes.click();
    return setTimeout(step6(), waitTime);
  }
  function step5() {
    if (action_stop) {
      return false;
    }
    // set a schedule time
    var available_btn = ele_matchDates[0];
    available_btn && available_btn.click();
    return setTimeout(step6, waitTime);
  }
  function step6() {
    if (action_stop) {
      return false;
    }
    // click time that meets critera
    console.log(`6 : click time that meets critera`);
    const timeRadios = document.querySelectorAll('[name="schedule-entries"]');
    console.log(timeRadios)
    if (timeRadios.length == 0) {
      setTimeout(step6, waitTime);
    } else {
      // if any time wanted give first..
      if (userInfo["starttime-OFC"] == "*" && userInfo["endTime-OFC"] == "*") {
        timeRadios[0].click();
        return setTimeout(step7, waitTime);
      }

      // if start time set but no end time select first after start
      if (userInfo["starttime-OFC"] && userInfo["endTime-OFC"] == "*") {
        for (let j = 0; j < timeRadios.length; j++) {
          const ele = timeRadios[j];
          var a_time_cell = convrtTime(
            ele.parentNode.textContent.split(" ")[0]
          );
          var u_s_t = convrtTime(userInfo["starttime-OFC"]),
            u_e_t = convrtTime(userInfo["endTime-OFC"]);

          if (new Date(a_time_cell) >= new Date(u_s_t)) {
            ele.click();
            return setTimeout(step7, waitTime);
          }
        }
      }

      // if end time set but no end time select first after start
      if (userInfo["starttime-OFC"] == "*" && userInfo["endTime-OFC"]) {
        for (let j = 0; j < timeRadios.length; j++) {
          const ele = timeRadios[j];
          var a_time_cell = convrtTime(
            ele.parentNode.textContent.split(" ")[0]
          );
          var u_s_t = convrtTime(userInfo["starttime-OFC"]),
            u_e_t = convrtTime(userInfo["endTime-OFC"]);

          if (new Date(a_time_cell) <= new Date(u_e_t)) {
            ele.click();
            return setTimeout(step7, waitTime);
          }
        }
      }

      // now if both set just go thru and select the one in between
      if (userInfo["starttime-OFC"] && userInfo["endTime-OFC"]) {
        for (let j = 0; j < timeRadios.length; j++) {
          console.log(timeRadios[j])
          const ele = timeRadios[j];
          var a_time_cell = convrtTime(
            ele.parentNode.textContent.split(" ")[0]
          );
          var u_s_t = convrtTime(userInfo["starttime-OFC"]),
            u_e_t = convrtTime(userInfo["endTime-OFC"]);

          if (
            new Date(a_time_cell) >= new Date(u_s_t) &&
            new Date(a_time_cell) <= new Date(u_e_t)
          ) {
            ele.click();
            return setTimeout(step7, waitTime);
          }
        }
      }
      lp_pos++;
      return step4();
    }
  }

  function step7() {
    if (action_stop) {
      return false;
    }
    // click the submit button
    console.log(`7 : click the submit button`);
    var submitBtn = document.getElementById("submitbtn");
    try {
      submitBtn && submitBtn.click();
      ele_matchTimes = [];
    } catch (error) {
      error.message && chrome.runtime.sendMessage({ error: error.message });
      return false;
    }
    chrome.runtime.sendMessage({
      type: "req_UserInfo",
      message: "this is test!",
    });
    return;
  }

  function next_step0(step) {
    if (action_stop) {
      return false;
    }
    // wait for ofc load
    console.log(`0 : wait for ofc load`);
    var g_mem = document.getElementById("gm_select");
    if (g_mem) {
      if (g_mem.childNodes.length < 1) {
        return setTimeout(next_step0, waitTime);
      } else {
        return setTimeout(next_step1, waitTime);
      }
    } else {
      return next_step0();
    }
  }
  function next_step1() {
    if (action_stop) {
      return false;
    }
    // set OFC Post value setting
    console.log(`1 : set OFC Post value setting`);
    var post_select = document.getElementById("post_select");
    if (post_select) {
      for (var i = 0; i < post_select.options.length; i++) {
        if (
          post_select.options[i].text ==
          userInfo["Consular-POST"][
            post_pointer % userInfo["Consular-POST"].length
          ]
        ) {
          post_select.value = post_select.options[i].value;
          const event = new Event("change", {
            bubbles: true, // Allow the event to bubble up the DOM tree
            cancelable: true, // Allow the event to be cancelable
          });
          post_select.dispatchEvent(event);
          break; // Exit the loop once a match is found
        }
      }
    }
    return setTimeout(next_step2, waitTime);
  }
  function next_step2() {
    if (action_stop) {
      return false;
    }
    console.log(`2 : wait for calendar`);
    var openCalendar = document.getElementById("datepicker");
    if (openCalendar) {
      if (openCalendar.value == "") {
        post_pointer++;
        console.log("wait 5 seconds");
        return setTimeout(next_step1, waitTime);
      } else {
        if (openCalendar.value == "Loading...") {
          setTimeout(next_step2, waitTime);
        } else if (openCalendar.value == "Select Date") {
          return setTimeout(next_step3, waitTime);
        }
      }
    }
  }
  function next_step3() {
    if (action_stop) {
      return false;
    }
    console.log(`3 : search available dates and set one that meets critera...`);
    let datesHolder = document.querySelector("#myDataHolder");
    let availableDates = datesHolder.getAttribute("availabledays");

    availableDates = JSON.parse(availableDates);
    availableDates = availableDates.ScheduleDays;

    if (availableDates && availableDates.length > 0) {
      let cond_day_start = new Date(userInfo["Consular-POST-startdate"]);
      let cond_day_end = new Date(userInfo["Consular-POST-endtdate"]);
      let foundDate = null;

      // search for date that matches critera
      for (let i = 0; i < availableDates.length; i++) {
        let availableDay = new Date(availableDates[i].Date);

        if (availableDay >= cond_day_start && availableDay <= cond_day_end) {
          ele_matchTimes2.push(availableDates[i]);
        }
        if (i == availableDates.length - 1 && ele_matchTimes2.length == 0) {
          post_pointer++;
          console.log("wait 5 seconds");
          setTimeout(next_step1, waitTime);
        }
      }

      if (!foundDate) {
        console.log(`no date available that matches critera`);
        return;
      }
      return setTimeout(next_step6, 500);
    } else {
      return;
    }
  }
  function next_step4() {
    if (action_stop) {
      return false;
    }
    if (lp_pos2 == ele_matchTimes2.length) {
      post_pointer++;
      if((post_pointer % userInfo["OFC-POST"].length) == 0){
        console.log("wait 5 seconds");
        return setTimeout(step1, ofc_waitTime);
      } else {
        return setTimeout(step1, waitTime)
      };
    }
    if (ele_matchTimes.length == 0) {
      return;
    }
    const foundDate = new Date(ele_matchTimes2[lp_pos2].Date);
    const foundDateObj = ele_matchTimes2[lp_pos2];
    document.querySelector("#datepicker").value = `${
      foundDate.getMonth() + 1
    }/${foundDate.getDate()}/${foundDate.getFullYear()}`;

    // inject a script to substitute for calender onSelect event
    const getDateTimes = document.createElement("button");
    getDateTimes.setAttribute(
      "onClick",
      `(()=> {
      jsdata.scheduleDayId = "${foundDateObj.ID}"
      getScheduleEntries(function (data) {
          var lHtml = "";
          var rHtml = "";
  
          for (var i = 0; i < data.length; i++) {
              var id = data[i].ID;
              var time = data[i].Time;
              var slots = data[i].EntriesAvailable;
              var html = [];
              html.push('<li class="list-group-item py-0">');
              html.push('<div class="radio">');
              html.push('<label>');
              html.push('<input type="radio" id="' + id + '" name="schedule-entries" value="' + id
                  + '" data-slots="' + slots + '" onclick="onSelectScheduleEntry(this)">');
              html.push(time + ' (' + slots + ')');
              html.push('</label>');
              html.push('</div>');
              html.push('</li>')
  
              if (i % 2) {
                  rHtml += html.join("");
              }
              else {
                  lHtml += html.join("");
              }
          }
  
          $("#time_select_left").html(lHtml);
          $("#time_select_right").html(rHtml);
      });
  
    })()`
    );
    document.head.appendChild(getDateTimes);
    getDateTimes.click();
    return setTimeout(next_step6, waitTime);
  }
  function next_step5() {
    if (action_stop) {
      return false;
    }
    // set a schedule time
    var available_btn = ele_matchDates[0];
    available_btn && available_btn.click();
    return setTimeout(next_step6, waitTime);
  }
  function next_step6() {
    if (action_stop) {
      return false;
    }
    // click time that meets critera
    console.log(`6 : click time that meets critera`);
    const timeRadios = document.querySelectorAll('[name="schedule-entries"]');
    if (timeRadios.length == 0) {
      setTimeout(next_step6, waitTime);
    } else {
      // if any time wanted give first..
      if (
        userInfo["Consular-POST-starttime"] == "*" &&
        userInfo["Consular-POST-endtime"] == "*"
      ) {
        timeRadios[0].click();
        return setTimeout(next_step7, waitTime);
      }

      // if start time set but no end time select first after start
      if (
        userInfo["Consular-POST-starttime"] &&
        userInfo["Consular-POST-endtime"] == "*"
      ) {
        for (let j = 0; j < timeRadios.length; j++) {
          const ele = timeRadios[j];
          var a_time_cell = convrtTime(
            ele.parentNode.textContent.split(" ")[0]
          );
          var u_s_t = convrtTime(userInfo["Consular-POST-starttime"]),
            u_e_t = convrtTime(userInfo["Consular-POST-endtime"]);

          if (new Date(a_time_cell) >= new Date(u_s_t)) {
            ele.click();
            return setTimeout(next_step7, waitTime);
          }
        }
      }

      // if end time set but no end time select first after start
      if (
        userInfo["Consular-POST-starttime"] == "*" &&
        userInfo["Consular-POST-endtime"]
      ) {
        for (let j = 0; j < timeRadios.length; j++) {
          const ele = timeRadios[j];
          var a_time_cell = convrtTime(
            ele.parentNode.textContent.split(" ")[0]
          );
          var u_s_t = convrtTime(userInfo["Consular-POST-starttime"]),
            u_e_t = convrtTime(userInfo["Consular-POST-endtime"]);

          if (new Date(a_time_cell) <= new Date(u_e_t)) {
            ele.click();
            return setTimeout(next_step7, waitTime);
          }
        }
      }

      // now if both set just go thru and select the one in between
      if (
        userInfo["Consular-POST-starttime"] &&
        userInfo["Consular-POST-endtime"]
      ) {
        for (let j = 0; j < timeRadios.length; j++) {
          const ele = timeRadios[j];
          var a_time_cell = convrtTime(
            ele.parentNode.textContent.split(" ")[0]
          );
          var u_s_t = convrtTime(userInfo["Consular-POST-starttime"]),
            u_e_t = convrtTime(userInfo["Consular-POST-endtime"]);

          if (
            new Date(a_time_cell) >= new Date(u_s_t) &&
            new Date(a_time_cell) <= new Date(u_e_t)
          ) {
            ele.click();
            return setTimeout(next_step7, waitTime);
          }
        }
      }
      setTimeout(next_step2, waitTime)
    }
  }
  function next_step7() {
    if (action_stop) {
      return false;
    }
    ele_matchTimes2 = []
  }
} catch (error) {
  action_stop = true;
  saveDataToFile(error, `error-${new Date()}.txt`)
}

// save error function
function saveDataToFile(data, fileName) {
  const blob = new Blob([data], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
}