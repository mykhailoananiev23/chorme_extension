let currentStep = 0, currentStep2 = 0;
var userInfo;
var ele_matchTimes2 = [];
var post_pointer = 0;

// wait for data from plugin
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('heyybbn')
  if (request.type === "popup-message") {
    var ele_matchDates = [];
    const message = request.message;
    userInfo = message;
    if(window.location.pathname.toLowerCase() == "/en-us/ofc-schedule/"){
      step0(); //start steps
    }
  }
});

// wait for data from plugin
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('heeeeeey');
  if (request.type === "popup-message") {
    var ele_matchDates = [];
    const message = request.message;
    userInfo = message;
    if(window.location.pathname.toLowerCase() == "/en-us/schedule/"){
      step0();
    }
  }
});

function convertDate(str, day) {
    const parts = str.split(',');
    const monthName = parts[0];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames.indexOf(monthName);
    const year = parseInt(parts[1], 10);
    var result = day ? new Date(year, month, Number(day)) : new Date(year, month, 14)
    return result;
}

function convrtTime(str) {
    const [hours, minutes] = str.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date;
}


 // functions to execute in order to select date and submit
 let waitTime = 1000;
  function step0(step) { // wait for ofc load
      console.log(`0 : wait for ofc load`)
      var g_mem = document.getElementById("gm_select");
      if(g_mem){
          if(g_mem.childNodes.length <1){
              currentStep = 0;
              return setTimeout(step0, waitTime)
          } else {
              currentStep = 1;
              return step1();
          }
      }
      console.log(step)
  }
  function step1(step) { // set OFC Post value setting
    console.log(`1 : set OFC Post value setting`)
      var post_select = document.getElementById("post_select")
      if (post_select) {
          for (var i = 0; i < post_select.options.length; i++) {
              if (post_select.options[i].text == userInfo["OFC-POST"][post_pointer % userInfo["OFC-POST"].length]) {
                  post_select.value = post_select.options[i].value
                  const event = new Event("change", {
                      bubbles: true, // Allow the event to bubble up the DOM tree
                      cancelable: true, // Allow the event to be cancelable
                  });
                  post_select.dispatchEvent(event);
                  break; // Exit the loop once a match is found
              }
          }
      }
      currentStep = 2;
      console.log(step)
      return step2();
  }
  function step2(step) { // open the Calendar
    console.log(`2 : wait for calendar`)
      var openCalendar = document.getElementById("datepicker");
      if(openCalendar){
          if(openCalendar.value == ""){
              currentStep = 0
              console.log(`no date input step2`);
              return;
          } else {
              if(openCalendar.value == "Loading..."){
                  currentStep = 2;
                  setTimeout(step2, waitTime)
              } else if(openCalendar.value == "Select Date"){
                  // openCalendar.setAttribute("onclick","$('#datepicker').datepicker('show')")
                  // openCalendar.click()
                  currentStep = 3;
                  return step3();
              }
          }
      }
      console.log(step)
  }
  function step3(step) { // search available dates and set one that meets critera
    console.log(`3 : search available dates and set one that meets critera...`)
    let datesHolder = document.querySelector("#myDataHolder");
    let availableDates = datesHolder.getAttribute("availabledays");

    availableDates = JSON.parse(availableDates);
    availableDates = availableDates.ScheduleDays;


    if(availableDates && availableDates.length > 0) {
      let cond_day_start = new Date(userInfo["startdate-OFC"]);
      let cond_day_end = new Date(userInfo["enddate-OFC"]);
      let foundDate = null;
      let foundDateObj = null;

      // search for date that matches critera
      for(let i = 0; i < availableDates.length; i++) {
        let availableDay = new Date(availableDates[i].Date);

        if(availableDay >= cond_day_start && availableDay <= cond_day_end) {
          foundDate = availableDay;
          foundDateObj = availableDates[i];
          break;
        }
        if(i == (availableDates.length-1) && post_pointer <= userInfo["OFC-POST"].length){
          post_pointer ++;
          currentStep = 1;
          step1(currentStep)
        }
      }

      if(!foundDate) {
        currentStep = 0;
        console.log(`no date available that matches critera`);
        return;
      }

      // got date returnfoundDate.getMonth()+1
      document.querySelector('#datepicker').value = `${foundDate.getMonth()+1}/${foundDate.getDate()}/${foundDate.getFullYear()}`;

      // inject a script to substitute for calender onSelect event
      const getDateTimes = document.createElement("button");
      getDateTimes.setAttribute("onClick", `(()=> {
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

      })()`);
      document.head.appendChild(getDateTimes);
      getDateTimes.click();

      currentStep = 6;
      return step6();

    } else {
        currentStep = 0;
        console.log(step)
        return;
      }

      console.log(step)
  }
  function step4(step) { // Click the Next  on calendar

      var calender_mon_next = document.querySelector('[data-handler="next"]');
      if(!calender_mon_next){
          currentStep = 0;
          clearInterval(intervalId);
      } else {
          calender_mon_next.click()
      }
      currentStep = 3;
      console.log(step)
      return step3();
  }
  function step5(step) { // set a schedule time
      var available_btn = ele_matchDates[0];
      available_btn && available_btn.click();
      currentStep = 6;
      return step6();
  }
  function step6(step) { // click time that meets critera
     console.log(`6 : click time that meets critera`)
      const timeRadios = document.querySelectorAll('[name="schedule-entries"]');
      if(timeRadios.length == 0){
          currentStep = 6;
          setTimeout(step6, waitTime)
      } else {

        // if any time wanted give first..
        if(userInfo["starttime-OFC"] == '*' && userInfo["endTime-OFC"] == '*') {
          timeRadios[0].click();
          return step7();
        }

        // if start time set but no end time select first after start
        if(userInfo["starttime-OFC"] && userInfo["endTime-OFC"] == '*') {
          for (let j = 0; j < timeRadios.length; j++) {
              const ele = timeRadios[j];
              var a_time_cell = convrtTime(ele.parentNode.textContent)
              var u_s_t = convrtTime(userInfo["starttime-OFC"]), u_e_t = convrtTime(userInfo["endTime-OFC"]);

              if(new Date(a_time_cell) >= new Date(u_s_t)){
                  ele.click()
                  return step7() ;
              }
          }
        }

        // if end time set but no end time select first after start
        if(userInfo["starttime-OFC"] == '*' && userInfo["endTime-OFC"]) {
          for (let j = 0; j < timeRadios.length; j++) {
              const ele = timeRadios[j];
              var a_time_cell = convrtTime(ele.parentNode.textContent)
              var u_s_t = convrtTime(userInfo["starttime-OFC"]), u_e_t = convrtTime(userInfo["endTime-OFC"]);

              if(new Date(a_time_cell) <= new Date(u_e_t)){
                  ele.click()
                  return step7();
              }
          }
        }

        // now if both set just go thru and select the one in between
        if(userInfo["starttime-OFC"] && userInfo["endTime-OFC"]){
          for (let j = 0; j < timeRadios.length; j++) {
            const ele = timeRadios[j];
            var a_time_cell = convrtTime(ele.parentNode.textContent)
            var u_s_t = convrtTime(userInfo["starttime-OFC"]), u_e_t = convrtTime(userInfo["endTime-OFC"]);

            if((new Date(a_time_cell) >= new Date(u_s_t)) && (new Date(a_time_cell) <= new Date(u_e_t))){
              ele.click()
              return setTimeout(step7, 500);
            }
          }
        }
      }
  }
  function step7(step) { // click the submit button
      console.log(`7 : click the submit button`)
      var submitBtn = document.getElementById("submitbtn");
      // submitBtn && submitBtn.click()
      return;
  }
