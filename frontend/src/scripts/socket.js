var path = '/api/sockjs',
    extend = require('lodash-node/modern/objects/assign'),
    events = require('events'),
    SockJS = require('sockjs-client');


class ReconnectingSocket {
    constructor(cli_path, options, status_cb, cli_onmessage, cli_onopen, cli_onclose) {
        this.cli_path = cli_path;
        this.status_cb = status_cb;
        this.cli_onmessage = cli_onmessage;
        this.cli_onopen = cli_onopen;
        this.cli_onclose = cli_onclose;

        this.reconnect = {
            reconnecting:          false,
            do_not_reconnect:      false,
            reload_after_n:        true,
            max_retries:           30,
            reset_mult:            6,
            retry_timeout_ms:      1500 + Math.floor(Math.random() * 60),
            retry_multiplier:      2,
            retry_curr_multiplier: 0,
            retry_curr_timeout:    0,
            retry_count:           0,
        };
        extend(this.reconnect, options)
    }

    update_status() {
        if( this.status_cb === null ) {
            return;
        }

        if( this.reconnect.reconnecting ) {
            this.status_cb('reconnecting');
        } else if( this.conn === null || this.conn.readyState !== SockJS.OPEN ) {
            this.status_cb('disconnected');
        } else {
            this.status_cb('connected');
        }
    }

    connect() {
        if( this.conn != null ) {
            this.conn.close();
            this.conn = null;
        }

        this.conn = new SockJS(this.cli_path);
        if( this.status_cb != null ) {
            this.status_cb('connecting');
        }

        this.conn.onopen = this.on_open;
        this.conn.onclose = this.on_close;
        this.conn.onmessage = this.cli_onmessage;
    }

    reconnect_reset() {
        this.reconnect.reconnecting = false;
        this.reconnect.retry_curr_timeout = 0;
        this.reconnect.retry_curr_multipler = 0;
        this.reconnect.retry_count = 0;
    }

    reconnect_try(connfunc) {
        if( this.reconnect.retry_count === this.reconnect.max_retries ) {
            this.reconnect.reconnecting = false;
            if( this.reconnect.reload_after_n ) {
                window.location.reload(true);
            }

            return;
        }
        if( !this.reconnect.reconnecting ) {
            this.reconnect.reconnecting = true;
            this.reconnect.retry_curr_timeout = this.reconnect.retry_timeout_ms;
            this.reconnect.retry_curr_multipler = 1;
            this.reconnect.retry_count = 1;
            connfunc();
        } else {
            this.reconnect.retry_count += 1;
            var callback = () => {
                this.reconnect.retry_curr_timeout *= this.reconnect.retry_multiplier;
                this.reconnect.retry_curr_multipler += 1;
                if( this.reconnect.retry_curr_multipler === this.reconnect.reset_mult ) {
                    this.reconnect.retry_curr_timeout = this.reconnect.retry_timeout_ms;
                    this.reconnect.retry_curr_multipler = 1;
                }
                connfunc();
            };

            setTimeout(callback, this.reconnect.retry_curr_timeout);
        }
    }

    on_open() {
        this.reconnect_reset();
        this.update_status();
        if( this.cli_onopen != null ) {
            return this.cli_onopen();
        }
    }

    on_close() {
        this.conn = null;
        this.update_status();
        if( this.cli_onclose != null ) {
            this.cli_onclose();
        }
        if( this.reconnect.do_not_reconnect ) {
            return;
        }
        this.reconnect_try(this.connect);
    }

    send(data) {
        return this.conn.send(data);
    }

    sendMessage(ty, obj) {
        return this.send(ty + "|" + JSON.stringify(obj));
    }
}

var socket = new ReconnectingSocket(path);
socket.connect();

module.exports = socket;
