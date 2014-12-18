var path = window.location.protocol + '//' + window.location.host;
    socket = require('socket.io-client')(path);

module.exports = socket;
