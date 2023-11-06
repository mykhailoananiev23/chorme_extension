let currentStep = 0, currentStep2 = 0;
var userInfo;
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function convertDate(str, day) {
    const parts = str.split(',');
    const monthName = parts[0];
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

var ele_matchTimes2 = [];

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "popup-message") {
        var ele_matchDates = [];
        const message = request.message;
        userInfo = message;
        if(window.location.pathname == "/en-US/OFC-schedule/" || window.location.pathname.startsWith("/en-US/ofc-schedule/")){
            var intervalId;
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
                                post_select.dispatchEvent(new Event("change", {
                                    bubbles: true,
                                    cancelable: true,
                                }));
                                break; // Exit the loop once a match is found
                            }
                        }
                    }
                    currentStep = 2;
                    console.log(step)
                },
                function step2(step) { // open the Calendar
                    // var openCalendar = document.getElementById("datepicker");
                    // if(openCalendar){
                    //     if(openCalendar.value == ""){
                    //         currentStep = 0
                    //         clearInterval(intervalId);
                    //         alert("Available Date is not exist!")
                    //     } else {
                    //         if(openCalendar.value == "Loading..."){
                    //             currentStep = 2;
                    //         } else if(openCalendar.value == "Select Date"){
                    //             openCalendar.setAttribute("onclick","$('#datepicker').datepicker('show')")
                    //             openCalendar.click()
                                
                    //             var calendar_div = document.getElementById("ui-datepicker-div")
                    //             if(calendar_div.childNodes.length > 0){
                    //                 var s_ele_MMM = document.querySelector('.ui-datepicker-month');
                    //                 s_ele_MMM.value = new Date(userInfo["startdate-OFC"]).getMonth();
                    //                 s_ele_MMM.dispatchEvent(new Event("change", {
                    //                     bubbles: true,
                    //                     cancelable: true,
                    //                 }))
                    //                 var s_ele_yyy = document.querySelector('.ui-datepicker-year')
                    //                 s_ele_yyy.value = new Date(userInfo["startdate-OFC"]).getFullYear();
                    //                 s_ele_yyy.dispatchEvent(new Event("change", {
                    //                     bubbles: true,
                    //                     cancelable: true,
                    //                 }))
    
                    //                 var sel_year = s_ele_MMM.value;
                    //                 var sel_month = s_ele_yyy.value;
                                    
                    //                 // while(ele_matchDates.length == 0){
                    //                 //     var calendar = document.querySelector(".ui-datepicker-calendar");
                    //                 //     if (calendar){
                    //                 //         var trs = calendar.childNodes[1].childNodes;
                    //                 //         for (let i = 0; i < trs.length; i++) {
                    //                 //             var tds = trs[i].childNodes
                    //                 //             for (let j = 0; j < tds.length; j++) {
                    //                 //                 const element = tds[j];
                    //                 //                 var day = element.childNodes[0].textContent
                    //                 //                 if((!day || (convertDate(sel_month + ","  + sel_year, day) < new Date(userInfo["startdate-OFC"]) || convertDate(sel_month + ","  + sel_year, day) > new Date(userInfo["enddate-OFC"])))){
                    //                 //                     continue ;
                    //                 //                 }
                    //                 //                 if(element.classList.length > 0 && element.classList.contains("greenday")) {
                    //                 //                     ele_matchDates.push(element)
                    //                 //                 }
                    //                 //             }
                    //                 //         }
                    //                 //         if(ele_matchDates.length == 0){
                    //                 //             var calender_mon_next = document.querySelector('[data-handler="next"]');
                    //                 //             calender_mon_next.click()
                    //                 //         }
                    //                 //     }
                    //                 // }
                    //                 currentStep = 3;
                    //             } else {
                    //                 currentStep = 2;
                    //             }
                    //         }
                    //         // select start date
                    //     }
                    // }
                    // console.log(step)
                    // clearInterval(intervalId)
                    getScheduleDays(function(data){ele_matchDates = data})
                },
                function step3(step) {
                    if(ele_matchDates.length > 0){
                        console.log(ele_matchDates[0])
                    } else {
                        currentStep = 3;
                    }
                    // console.log(ele_matchDates[0])
                    // clearInterval(intervalId)
                    // console.log(step)
                    // ele_matchDates[0].click()
                    // currentStep = 4;
                },
                function step4(step) {
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
                        currentStep = 5;
                    }
                    console.log(step)
                },
                function step5(step) {
                    currentStep = 0;
                    clearInterval(intervalId)
                    cconsole.log(step)
                }
            ];
              
              // Function to execute the next step
              function executeNextStep() {
                if (currentStep < functionsToExecute.length) {
                    functionsToExecute[currentStep](currentStep);
                } else {
                    currentStep = 0;
                    clearInterval(intervalId);
                }
              }
            intervalId = setInterval(executeNextStep, 1000)
        }
    }
});
