var Morearty = require('morearty');

var Ctx = Morearty.createContext({
    // Global Socket.IO status
    connected: false,

    // Individual notes
    notes: [],
});

module.exports = Ctx;
