/*global window, com */

com.octabits.starfish.utils = (function() {
    var publicInterface,
        usedIds = {};

    function generateUUID() {
        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return uuid;
    }

    publicInterface = {
        // Generate a UUID
        UUID: function() {
            var id,
                isUnique = false;
            // Ensure that the returned id is unique for this session
            while (isUnique === false) {
                id = generateUUID();
                if (!usedIds[id]) {
                    usedIds[id] = true;
                    isUnique = true;
                }
            }
            return id;

        },
        getUrlParameterByName: function(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(window.location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        },
        EventRegister: function() {
            var i;
            this.length = 0;
            this.items = [];
            for (i = 0; i < arguments.length; i += 2) {
                if (typeof(arguments[i + 1]) !== 'undefined') {
                    this.items[arguments[i]] = arguments[i + 1];
                    this.length += 1;
                }
            }
            /**
             * @method removeItem
             * @memberof emp.helpers
             * @return {object}
             */
            this.removeItem = function(in_key) {
                var tmp_previous;
                if (typeof(this.items[in_key]) !== 'undefined') {
                    this.length -= 1;
                    tmp_previous = this.items[in_key];
                    delete this.items[in_key];
                }

                return tmp_previous;
            };
            /**
             * @method getItem
             * @memberof emp.helpers
             * @return {object}
             */
            this.getItem = function(in_key) {
                return this.items[in_key];
            };
            /**
             * @method setItem
             * @memberof emp.helpers
             * @return {object}
             */
            this.setItem = function(in_key, in_value) {
                var tmp_previous;
                if (typeof(in_value) !== 'undefined') {
                    if (typeof(this.items[in_key]) === 'undefined') {
                        this.length += 1;
                    } else {
                        tmp_previous = this.items[in_key];
                    }

                    this.items[in_key] = in_value;
                }

                return tmp_previous;
            };
            /**
             * @method hasItem
             * @memberof emp.helpers
             * @return {object}
             */
            this.hasItem = function(in_key) {
                return typeof(this.items[in_key]) !== 'undefined';
            };
            /**
             * @method clear
             * @memberof emp.helpers
             * @return {object}
             */
            this.clear = function() {
                var j;

                for (j in this.items) {
                    if (this.items.hasOwnProperty(j)) {
                        delete this.items[j];
                    }
                }

                this.length = 0;
            };

            this.addListener = function(listenerInfo) {
                if (this.getItem(listenerInfo.key) !== null && this.getItem(listenerInfo.key) !== undefined) {
                    this.getItem(listenerInfo.key).push(listenerInfo.value);
                } else {
                    var values = [];
                    values.push(listenerInfo.value);
                    this.setItem(listenerInfo.key, values);
                }
            };

            this.removeListener = function(listenerInfo) {
                var values,
                    len,
                    k;

                if (this.getItem(listenerInfo.key) !== null && this.getItem(listenerInfo.key) !== undefined) {
                    values = this.getItem(listenerInfo.key);
                    len = values.length;

                    for (k = 0; k < len; k += 1) {
                        if (values[i] === listenerInfo.value) {
                            values.splice(k, 1);
                            return true;
                        }
                    }
                }
                return false;
            };

            this.grab = function(args) {
                // retrieve array of arms registered for this event type
                var values = this.getItem(args.key);
                if (values === undefined || values === null) {
                    values = [];
                }
                return values;
            }; // end grab

        }
    };

    return publicInterface;
}());
