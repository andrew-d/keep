var // path = window.location.protocol + '//' + window.location.host;
	path = '/api/sockjs',
    socket = require('sockjs-client')(path);

socket.sendMessage = function(ty, obj) {
	return this.send(ty + "|" + JSON.stringify(obj));
};

module.exports = socket;
