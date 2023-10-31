var intervalId;
let currentStep = 0, currentStep2 = 0;
var continue_flg = true;
var userInfo = {"OFC-POST" :  "CHENNAI VAC", "startdate-OFC" : "11-10-2023", "enddate-OFC" : "12-10-2023", "starttime-OFC" : "9:00", "endTime-OFC" : "15:00", "Consular-POST": "KOLKATA", "Consular-POST-startdate": "10-10-2023", "Consular-POST-endtdate": "12-10-2024", "Consular-POST-starttime": "8:00", "Consular-POST-endtime" : "17:00"}
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

var ele_matchDates = [];
var ele_matchTimes2 = [];

const functionsToExecute = [
    function loading(step) {
        var g_mem = document.getElementById("gm_select");
        if(g_mem){
            if(g_mem.childNodes.length <1){
                currentStep = 0;
            } else {
                currentStep = 1;
            }
        }
        console.log(step)
    },
    function step1(step) { // set OFC Post value setting
        var post_select = document.getElementById("post_select")
        if (post_select) {
            for (var i = 0; i < post_select.options.length; i++) {
                if (post_select.options[i].text == userInfo["OFC-POST"]) {
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
    },
    function step2(step) { // open the Calendar
        var openCalendar = document.getElementById("datepicker");
        if(openCalendar){
            console.log(openCalendar.value)
            if(openCalendar.value == "Select Date"){
                openCalendar.focus();
                var calendar = document.getElementById("ui-datepicker-div")
                calendar.style.display = "block"
                currentStep = 3;
            } else {
                currentStep = 2
            }
        }
        console.log(step)
    },
    function step3(step) { // searching Available Date
        var calendar = document.querySelector(".ui-datepicker-calendar");
        if (calendar){
            var sel_month, sel_year;

            var p_year = document.querySelector(".ui-datepicker-year");
            p_year.childNodes.forEach(element => {
                if(element.selected == true){
                    sel_year = element.textContent
                }
            });
            var p_month = document.querySelector(".ui-datepicker-month");
            p_month.childNodes.forEach(element => {
                if(element.selected == true){
                    sel_month = element.textContent
                }
            });

            var sel_date = convertDate(sel_month + ","  + sel_year)

            var cond_day_start = new Date(userInfo["startdate-OFC"])
            var cond_day_end = new Date(userInfo["enddate-OFC"])
            var cond_date_start, cond_date_end;

            if(cond_day_start.getMonth() < 11){
                cond_date_start = new Date(cond_day_start.getFullYear() + "-" + (cond_day_start.getMonth() + 1) + "-" + "01");
            } else {
                cond_date_start = new Date((cond_day_start.getFullYear() + 1) + "-" + (cond_day_start.getMonth() - 10) + "-" + "01");
            }
            if(cond_day_end.getMonth() < 11){
                cond_date_end = new Date(cond_day_end.getFullYear() + "-" + (cond_day_end.getMonth() + 1) + "-" + "01");
            } else {
                cond_date_end = new Date((cond_day_end.getFullYear() + 1) + "-" + (cond_day_end.getMonth() - 10) + "-" + "01");
            }
            
            if(new Date(sel_date) >= new Date(cond_date_end)){
                alert("No correct User Information!")
                clearInterval(intervalId)
            }

            var trs = calendar.childNodes[1].childNodes;
            for (let i = 0; i < trs.length; i++) {
                var tds = trs[i].childNodes
                for (let j = 0; j < tds.length; j++) {
                    const element = tds[j];
                    var day = element.childNodes[0].textContent
                    if((!day || (convertDate(sel_month + ","  + sel_year, day) < new Date(userInfo["startdate-OFC"]) || convertDate(sel_month + ","  + sel_year, day) > new Date(userInfo["enddate-OFC"])))){
                        continue ;
                    }
                    if(element.classList.length > 0 && element.classList.contains("greenday")) {
                        ele_matchDates.push(element)
                        currentStep = 5;
                        return ;
                    }
                }
            }
            currentStep = 4;
        }
        console.log(step)
    },
    function step4(step) { // Click the Next
        
        var calender_mon_next = document.querySelector('[data-handler="next"]');
        if(!calender_mon_next){
            clearInterval(intervalId);
        } else {
            calender_mon_next.click()
        }
        currentStep = 3;
        console.log(step)
    },
    function step5(step) { // set a schedule time
        var available_btn = ele_matchDates[0];
        available_btn && available_btn.click();
        currentStep = 6;
    },
    function step6(step) {
        const timeRadios = document.querySelectorAll('[name="schedule-entries"]');
        if(timeRadios.length == 0){
            currentStep = 6;
        } else {
            for (let j = 0; j < timeRadios.length; j++) {
                const ele = timeRadios[j];
                var a_time_cell = convrtTime(ele.parentNode.textContent)
                var u_s_t = convrtTime(userInfo["starttime-OFC"]), u_e_t = convrtTime(userInfo["endTime-OFC"]);
                if((new Date(a_time_cell) >= new Date(u_s_t)) && (new Date(a_time_cell) <= new Date(u_e_t))){
                    ele.click()
                    break ;
                }
            }
            currentStep = 7;
        }
        console.log(step)
    },
    function step7(step) { // click the submit button
        var submitBtn = document.getElementById("submitbtn");
        submitBtn && submitBtn.click()
        console.log(step);
        clearInterval(intervalId)
    },
];
  
  
  // Function to execute the next step
  function executeNextStep() {
    if (currentStep < functionsToExecute.length) {
        functionsToExecute[currentStep](currentStep);
    } else {
        clearInterval(intervalId);
    }
  }


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "popup-message") {
        const message = request.message;
        userInfo = message;
        if(window.location.pathname == "/en-US/ofc-schedule/"){
            console.log(message);
            intervalId = setInterval(executeNextStep, 3000)
        }
    }
});


/**
 * 
 * /en-US/schedule/ page
 * 
 */


const functionsToExecute2 = [
    function loading(step) {
        var g_mem = document.getElementById("gm_select");
        if(g_mem){
            if(g_mem.childNodes.length <1){
                currentStep2 = 0;
            } else {
                currentStep2 = 1;
            }
        }
        console.log(step)
    },
    function step1(step) { // set OFC Post value setting
        var post_select = document.getElementById("post_select")
        if (post_select) {
            for (var i = 0; i < post_select.options.length; i++) {
                if (post_select.options[i].text === userInfo["Consular-POST"]) {
                    post_select.value = post_select.options[i].value
                    const event = new Event("change", {
                        bubbles: true, // Allow the event to bubble up the DOM tree
                        cancelable: true, // Allow the event to be cancelable
                    });
                    post_select.dispatchEvent(event);
                    break; // Exit the loop once a match is found
                }
            }
            currentStep2 = 2;
        }
        console.log(step)
    },
    function step2(step) { // open the Calendar
        var openCalendar = document.getElementById("datepicker");
        if(openCalendar){
            if(openCalendar.value == ""){
                clearInterval(intervalId);
                alert('Matched Data is not exist!')
            } else {
                if(openCalendar.value == "Loading..."){
                    currentStep2 = 2;
                } else {
                    openCalendar.focus();
                    var calendar = document.getElementById("ui-datepicker-div")
                    calendar.style.display = "block"
                    currentStep2 = 3;
                }
            }
        }
        console.log(step)
    },
    function step3(step) { // searching Available Date
        var calendar = document.querySelector(".ui-datepicker-calendar");
        if (calendar){
            var sel_month, sel_year;

            var p_year = document.querySelector(".ui-datepicker-year");
            p_year.childNodes.forEach(element => {
                if(element.selected == true){
                    sel_year = element.textContent
                }
            });
            var p_month = document.querySelector(".ui-datepicker-month");
            p_month.childNodes.forEach(element => {
                if(element.selected == true){
                    sel_month = element.textContent
                }
            });

            var sel_date = convertDate(sel_month + ","  + sel_year)

            var cond_day_start = new Date(userInfo["Consular-POST-startdate"])
            var cond_day_end = new Date(userInfo["Consular-POST-endtdate"])
            var cond_date_start, cond_date_end;

            if(cond_day_start.getMonth() < 11){
                cond_date_start = new Date(cond_day_start.getFullYear() + "-" + (cond_day_start.getMonth() + 1) + "-" + "01");
            } else {
                cond_date_start = new Date((cond_day_start.getFullYear() + 1) + "-" + (cond_day_start.getMonth() - 10) + "-" + "01");
            }
            if(cond_day_end.getMonth() < 11){
                cond_date_end = new Date(cond_day_end.getFullYear() + "-" + (cond_day_end.getMonth() + 1) + "-" + "01");
            } else {
                cond_date_end = new Date((cond_day_end.getFullYear() + 1) + "-" + (cond_day_end.getMonth() - 10) + "-" + "01");
            }
            
            if(new Date(sel_date) >= new Date(cond_date_end)){
                alert("No correct User Information!")
                clearInterval(intervalId)
            }

            var trs = calendar.childNodes[1].childNodes;
            for (let i = 0; i < trs.length; i++) {
                var tds = trs[i].childNodes
                for (let j = 0; j < tds.length; j++) {
                    const element = tds[j];
                    var day = element.childNodes[0].textContent
                    if((!day || (convertDate(sel_month + ","  + sel_year, day) < new Date(userInfo["Consular-POST-startdate"]) || convertDate(sel_month + ","  + sel_year, day) > new Date(userInfo["Consular-POST-endtdate"])))){
                        continue ;
                    }
                    if(element.classList.length > 0 && element.classList.contains("greenday")) {
                        ele_matchTimes2.push(element)
                        currentStep2 = 5;
                        return;
                    }
                }
            }
            currentStep2 = 4;
        }
        console.log(step)
    },
    function step4(step) { // Click the Next
        
        var calender_mon_next = document.querySelector('[data-handler="next"]');
        if(!calender_mon_next){
            alert("Matched Date is not exist!")
            clearInterval(intervalId);
        } else {
            calender_mon_next.click()
        }
        currentStep2 = 3;
        console.log(step)
    },
    function step5(step) { // set a schedule time
        /**
         * Submit Button Click Code
         */
        var available_btn = ele_matchDates[0];
        available_btn && available_btn.click();
        currentStep2 = 6;
        /**
         * 
         */
    },
    function step6(step) {
        const timeRadios = document.querySelectorAll('[name="schedule-entries"]');
        for (let j = 0; j < timeRadios.length; j++) {
            const ele = timeRadios[j];
            var a_time_cell = convrtTime(ele.parentNode.textContent)
            var u_s_t = convrtTime(userInfo["Consular-POST-starttime"]), u_e_t = convrtTime(userInfo["Consular-POST-endtime"]);
            if((new Date(a_time_cell) >= new Date(u_s_t)) && (new Date(a_time_cell) <= new Date(u_e_t))){
                ele.click()
                currentStep2 = 7;
                return ;
            }
        }
        alert("Matched Time not exist!")
        clearInterval(intervalId)
        console.log(step)
    }
    // function step7(step) { // click the submit button
    //     var submitBtn = document.getElementById("submitbtn");
    //     submitBtn && submitBtn.click()
    //     console.log(step);
    //     clearInterval(intervalId)
    // },
];

function executeNextStep2() {
    if (currentStep2 < functionsToExecute.length) {
        functionsToExecute2[currentStep2](currentStep2);
    } else {
        clearInterval(intervalId);
    }
}

if(window.location.pathname == "/en-US/schedule/"){
    intervalId = setInterval(executeNextStep2, 3000);
}