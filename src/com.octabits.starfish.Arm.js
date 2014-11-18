/*global window, com, alert */

com.octabits.starfish.Arm = function(args) {
    var active = false,
        urlId = "",
        debug = false;
    if (args.hasOwnProperty("debug")) {
        debug = args.debug;
    }
    // this.popup = args.popup;
    this.name = args.name || "Untitled";
    this.id = com.octabits.starfish.utils.UUID();
    this.hubId = args.hubId;
    this.baseUrl = args.url;
    this.width = 250;
    if (args.hasOwnProperty("width")) {
        this.width = args.width;
    }
    this.height = 400;
    if (args.hasOwnProperty("height")) {
        this.height = args.height;
    }


    // Send the id
    if (args.url.indexOf("?") === -1) {
        urlId += "?armId=" + this.id;
    } else {
        urlId += "&armId=" + this.id;
    }
    //get rid of white space
    this.url = args.url.trim();
    // Add the UUID of this Arm to the url so it can be extracted by the receiver after launch
    this.url += urlId;
    // Open the new window
    if (debug === true) {
        this.popupwin = window.open(this.url, this.id, "width=250, height=300"); //, titlebar=0, menubar=0, location=0, status=0");
    } else {
        this.popupwin = window.open(this.url, this.id, "width=" + this.width + ", height=" + this.height);// + ", titlebar = 0, menubar = 0, location = 0, status = 0 ");
    }
    // Track the origin so that we can compare later for security reasons
    // We don't want to be communicating with strange sea creatures
    this.origin = this.popupwin.origin;

    this.tell = function(args) {
        //var msg = JSON.stringify(args.message);
        if (active === true) {

            this.popupwin.postMessage(args.message, "*"); //, "http://localhost:8080");
        }
    };

    this.sever = function() {

        this.active = false;
        this.popupwin.close();

    };
};
