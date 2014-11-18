/*global window, com, alert */

// Hub is the brain that acts as the receiver / dispatcher for all messages
com.octabits.starfish.Hub = function() {
    var arms = {},
        id = com.octabits.starfish.utils.UUID(),
        listeners = new com.octabits.starfish.utils.EventRegister(),
        that = this;

    window.onbeforeunload = function(e) {
        that.closeAll();
    };

    // Check to see if the window we are communicating with was in fact launched as an arm and still has the correct origin
    function checkTrust(event) {
        var trustedArm = null,
            arm;
        for (arm in arms) {
            if (arms.hasOwnProperty(arm)) {
                // ensure that the pop was launched by this code, and the origin for    that popup has not changed since it was launched
                if ((event.sender.id === arms[arm].id) && (event.origin === arms[arm].origin)) {
                    trustedArm = arms[arm];
                    break;
                }
            }
        }
        return trustedArm;
    }


    function receiveMessage(event) {
        // Do we trust the sender of this message?  (might be
        // different from what we originally opened, for example).
        var arm = checkTrust(event.data),
            subscribedArms = [];

        if (arm !== null) {
            var msg = event.data;
            console.log(JSON.stringify(msg));
            switch (msg.action) {
                // Nerve is publishing a message back to Hub
                case com.octabits.starfish.constants.PUBLISH:
                    subscribedArms = listeners.grab({
                        key: msg.channel
                    });
                    if (subscribedArms.length > 0) {
                        // send the message to all the other arms that are subscribed to this channel
                        that.publish({
                            message: event.data,
                            arms: subscribedArms
                        });
                    }
                    break;
                    // Nerve is subscribing to a message channel
                case com.octabits.starfish.constants.SUBSCRIBE:
                    listeners.addListener({
                        key: msg.channel,
                        value: arm
                    });
                    break;
                case com.octabits.starfish.constants.UNSUBSCRIBE:
                    listeners.removeListener({
                        channel: msg.channel,
                        arm: arm
                    });
                    break;
                case com.octabits.starfish.constants.SEVER:
                    that.arm.sever({
                        url: arm.baseUrl
                    });
                    break;
                default:
                    alert("Unknown message action: " + msg.action);
                    break;
            }
        } else {
            alert("untrusted Message! Came from: " + event.origin);
        }
    }
    window.addEventListener("message", receiveMessage, false);
    /*
        window.onunload = function() {
            for (arm in arms) {
                if (arms.hasOwnProperty(arm)) {
                    // ensure that the pop was launched by this code, and the origin for    that popup has not changed since it was launched
                    arm.popupwin.close();
                }
            }
        }
        */

    /*
        var confirmOnPageExit = function(e) {
            // If we haven't been passed the event get the window.event
            e = e || window.event;

            var message = 'Any text will block the navigation and display a prompt';

            // For IE6-8 and Firefox prior to version 4
            if (e) {
                e.returnValue = message;
            }

            // For Chrome, Safari, IE8+ and Opera 12+
            return message;
        }

        window.onbeforeunload = confirmOnPageExit;
    */

    this.arm = {
        grow: function(args) {
            var arm;
            arm = arms[args.url];
            if (!arm) {

                arm = new com.octabits.starfish.Arm({
                    url: args.url,
                    hubId: id
                });
                arms[args.url] = arm;
            } else {
                arm.popupwin.focus();
            }
            return arm;
        },
        sever: function(args) {
            var arm = arms[args.url];
            if (arm) {
                arm.sever();
                delete arms[args.url];
            }
        },
        grab: function() {
            var armIds = [],
                arm;
            for (arm in arms) {
                if (arms.hasOwnProperty(arm)) {
                    armIds.push(arms[arm]);
                }
            }
            return armIds;
        }
    };

    this.broadcast = function(args) {
        var arm;
        for (arm in arms) {
            if (arms.hasOwnProperty(arm)) {
                arms[arm].popupwin.postMessage({
                    action: com.octabits.starfish.constants.PUBLISH,
                    channel: args.channel,
                    message: args.message,
                    sender: {
                        id: id
                    }
                }, "*");
            }
        }
    };

    this.publish = function(args) {
        var arm,
            len = args.arms.length,
            i,
            senderId = args.message.sender.id;
        for (i = 0; i < len; i++) {
            arm = args.arms[i];
            if (arm !== null && arm.hasOwnProperty("popupwin")) {
                // filter out the message sender in case they also subsribe to the cahnel they are publoishing on
                if (senderId !== arm.id) {
                    arm.popupwin.postMessage(args.message, "*");
                }
            }
        }
    };

    this.closeAll = function() {
        var arm;
        for (arm in arms) {
            if (arms.hasOwnProperty(arm)) {
                // ensure that the pop was launched by this code, and the origin for    that popup has not changed since it was launched
                arms[arm].popupwin.close();
                delete arms[arm];
            }
        }
    };
};
