var Morearty = require('morearty');

var Ctx = Morearty.createContext({
    // Global status
    connected: false,
    syncing: false,

    // Individual notes
    notes: [],
});

module.exports = Ctx;
