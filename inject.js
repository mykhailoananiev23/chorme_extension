(
  function() {
    // injected data holder to catch available dates
    const dataHolder = document.createElement("div");
    dataHolder.setAttribute("id", "myDataHolder");
    document.head.appendChild(dataHolder);


    console.log("Script Injected");
    // define monkey patch function
    const monkeyPatch = () => {
      let oldXHROpen = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function() {
        this.addEventListener("load", function() {
          const responseBody = this.responseText;
          console.log(`Response Body: ${responseBody}`);
          if(this.responseURL.includes('schedule-days')) {
            let path = new URL(this.responseURL);
            document.getElementById('myDataHolder').setAttribute(`availabledays`, responseBody)
          }
        });
        return oldXHROpen.apply(this, arguments);
      };
    };
    monkeyPatch();
  }
)();
