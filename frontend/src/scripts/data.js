var immstruct = require('immstruct');


var data = immstruct({
	// Server connection status
	connected: false,

	// Notes to display (of type text or list)
	notes: [{id: 1, title:"foo", text:"bar"}],
});


module.exports = data;
