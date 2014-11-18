/*global window, com, alert */

com.octabits.starfish.Nerve = function(args) {
    var launcherOrigin,
        that;

    this.id = com.octabits.starfish.utils.getUrlParameterByName("armId");

    launcherOrigin = window.opener.location.origin;
    // hold on to the parent window
    this.messageSource = window.opener;
    this.listeners = new com.octabits.starfish.utils.EventRegister();
    that = this;

    window.onbeforeunload = function(e) {
  that.sever();
};


    // Called sometime after postMessage is called
    this.processMessage = function(event) {
        var msg,
            len,
            callbacks;
        // Do we trust the sender of this message?
        if (event.origin !== launcherOrigin) {
            alert("We do not trust sender");
            return;
        }

        msg = event.data;
        if (typeof msg === "string") {
            try {
                msg = JSON.parse(msg);
            } catch (e) {
                alert(e.message);
            }
        }
        if (msg.hasOwnProperty("action")) {
            switch (msg.action) {
                case com.octabits.starfish.constants.INIT:
                    that.id = msg.message.id;
                    break;
                case com.octabits.starfish.constants.PUBLISH:
                    if (typeof msg.message === "string") {
                        msg.message = JSON.parse(msg.message);

                    }
                    callbacks = that.listeners.grab({
                        key: msg.channel
                    });
                    if (callbacks.length > 0) {
                        len = callbacks.length;
                        for (i = 0; i < len; i += 1) {
                            if (callbacks[i] !== null) {
                                try {
                                    callbacks[i](msg.sender, msg.message, msg.channel);
                                } catch (err) {
                                    if (console && console.hasOwnProperty("log")) {
                                        console.log(err.message);
                                    }
                                }
                            }
                        }
                    }
                    break;
                default:
                    alert("unknown action");
                    break;
            }
        } else {
            alert("No action provided");
        }

    };

    window.addEventListener("message", this.processMessage, false);

    this.publish = function(args) {
        this.messageSource.postMessage({
                action: com.octabits.starfish.constants.PUBLISH,
                channel: args.channel,
                message: args.message,
                sender: {
                    id: that.id
                }
            },
            launcherOrigin);
    };
    this.subscribe = function(args) {
        this.listeners.addListener({
            key: args.channel,
            value: args.callback
        });
        this.messageSource.postMessage({
                action: com.octabits.starfish.constants.SUBSCRIBE,
                channel: args.channel,
                sender: {
                    id: that.id
                }
            },
            launcherOrigin);
    };
    this.unsubscribe = function(args) {
        this.listeners.removeListener({
            key: args.channel,
            value: args.callback
        });
        this.messageSource.postMessage({
                action: com.octabits.starfish.constants.UNSUBSCRIBE,
                channel: args.channel,
                sender: {
                    id: that.id
                }
            },
            launcherOrigin);
    };
    this.sever = function(args) {
        this.messageSource.postMessage({
                action: com.octabits.starfish.constants.SEVER,
                channel: "com.octabits.arm.sever",
                sender: {
                    id: that.id
                }
            },
            launcherOrigin);
    };

};
