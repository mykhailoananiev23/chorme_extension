let currentStep = 0;
var continue_flg = true;
var userInfo = {"OFC-POST" :  "CHENNAI VAC", "startdate-OFC" : "11-10-2023", "enddate-OFC" : "12-10-2023", "starttime-OFC" : "1:00", "endTimeOFC" : "5:00", "Consular-POST": "CHENNAI", "Consular-POST-startdate": "10-10-2023", "Consular-POST-endtdate": "12-10-2023", "Consular-POST-starttime": "1:00", "Consular-POST-endtime" : "*"}
function convertDate(str, day) {
    const parts = str.split(',');

    const monthName = parts[0];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames.indexOf(monthName);

    // Extract the year
    const year = parseInt(parts[1], 10);

    // Create a new Date object
    var result = day ? new Date(year, month, Number(day)) : new Date(year, month, 14)
    return result;
}
var ele_matchDates = []

const functionsToExecute = [
    function step1(step) { // set OFC Post value setting
        var post_select = document.getElementById("post_select")
        if (post_select) {
            for (var i = 0; i < post_select.options.length; i++) {
                if (post_select.options[i].text === userInfo["OFC-POST"]) {
                    post_select.selectedIndex = i;
                    break; // Exit the loop once a match is found
                }
            }
        }
        console.log(step)
    },
    function step2(step) { // open the Calendar
        var openCalendar = document.getElementById("datepicker");
        openCalendar && openCalendar.focus();
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
                clearInterval(intervalId)
            }

            var trs = calendar.childNodes[1].childNodes;
            for (let i = 0; i < trs.length; i++) {
                var tds = trs[i].childNodes
                for (let j = 0; j < tds.length; j++) {
                    const element = tds[j];
                    var day = element.childNodes[0].textContent
                    if(!day || (convertDate(sel_month + ","  + sel_year, day) < new Date(userInfo["startdate-OFC"]) || convertDate(sel_month + ","  + sel_year, day) > new Date(userInfo["enddate-OFC"]))){
                        continue ;
                    }
                    if(element.classList.length > 0 && element.classList.contains("ui-state-disabled")) {
                        ele_matchDates.push(element)
                        console.log(element)
                        currentStep = 4;
                    }
                }
            }
        }
        console.log(step)
    },
    function step4(step) { // Click the Next
        var calender_mon_next = document.querySelector('[data-handler="next"]');
        if(!calender_mon_next){
            clearInterval(intervalId);
        } else {
            calender_mon_next.click()
            console.log(step)
        }
    },
    function step5(step) { // set a schedule time
        const timeRadios = document.querySelectorAll('[name="schedule-entries"]');
        timeRadios.forEach((ele) => {
            const [hours, minutes] = ele.parentNode.textContent.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));

            // console.log(date);      
        })
        console.log(step)
    },
    function step6(step) { // click the submit button
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
        if(currentStep > 3){
            if(ele_matchDates.length == 0){
                currentStep = 1;    
            } else {
                currentStep = 4
            }
        }
        currentStep++;
    } else {
        clearInterval(intervalId);
        console.log(ele_matchDates);
    }
  }
  
  // Set up an interval to execute the steps every 1 seconds
  const intervalId = setInterval(executeNextStep, 1000);  