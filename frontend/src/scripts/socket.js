var // path = window.location.protocol + '//' + window.location.host;
    path = '/api/sockjs',
    extend = require('lodash-node/modern/objects/assign'),
    events = require('events'),
    sockjs = require('sockjs-client');


// The backoff wait times, in seconds.
var BACKOFF_WAITS = {
    1:   2,
    2:   5,
    3:  10,
    4:  20,
    5:  30,
    6:  60,
    7: 120,
};

// Default options.
var DEFAULT_OPTIONS = {
    // Whether or not we should reconnect
    reconnect: true,

    // TODO: more
};


class ReconnectingSocket extends events.EventEmitter {
    constructor(path, options) {
        super();

        // Private variables.
        this._path = path;
        this._conn = null;
        this._reconnecting = false;

        // Public variables
        this.options = extend({}, DEFAULT_OPTIONS, options);
    }

    connect() {
        if( this._conn ) {
            this._conn.close();
            this._conn = null;
        }

        this._conn = sockjs(path);
        this.emit('status', 'connecting');

        // Setup callbacks.
        this._conn.onopen = this.on_open.bind(this);
        this._conn.onclose = this.on_close.bind(this);
        this._conn.onmessage = this.on_message.bind(this);
    }

    on_open() {
        this.reset_reconnect();
        this.update_status();
        this.emit('open');
    }

    on_close() {
        this._conn = null;
        this.update_status();

        this.emit('close');     // TODO: use "disconnecting"?
        if( !this.options.reconnect ) {
            return;
        }

        this.try_reconnect(this.connect.bind(this));
    }

    on_message(e) {
        this.emit('message', e.data);
    }

    reset_reconnect() {
        this._reconnecting = false;
        // TODO: reset reconnect count
    }

    try_reconnect(connfunc) {
        // TODO
    }

    update_status() {
        if( this._reconnecting ) {
            this.emit('reconnecting');
        } else if( this._conn === null || this._conn !== SockJS.OPEN ) {
            this.emit('disconnected');
        } else {
            this.emit('connected');
        }
    }

    // Public functions.
    send(data) {
        this._conn.send(data);
    }

    sendMessage(ty, obj) {
        return this.send(ty + "|" + JSON.stringify(obj));
    }
}


// Create the underlying SockJS instance.
var sockjs = sockjs(path);

// The current backoff count.
var backoffCount;

// The token for our current backoff timeout.
var backoffToken = null;

// The backoff function.
var backoffRetry = function() {
    // Try reconnecting again
    // TODO:

    // Increment backoff counter.
    backoffToken = setTimeout(backoffRetry, BACKOFF_WAITS[++backoffCount] * 1000);
};

// When we're disconnected, try reconnecting immediately, and start our backoff
// timer.
socket.onclose = function() {
    console.log("Disconnected from server");

    // Set our backoff count and start waiting.
    backoffCount = 1;
    backoffToken = setTimeout(backoffRetry, BACKOFF_WAITS[backoffCount] * 1000);

    // TODO: call onclose callback
};

// When we reconnect, stop our backoff counter.
socket.onopen = function() {
    console.log("Connected to server");

    backoffCount = 0;
    if( backoffToken ) {
        clearTimeout(backoffToken);
        backoffToken = null;
    }

    // TODO: call onopen callback
};

/*
 * Helper method that sends a message type, and then a JSON-encoded object.
 */
socket.sendMessage = function(ty, obj) {
    return this.send(ty + "|" + JSON.stringify(obj));
};

module.exports = socket;
