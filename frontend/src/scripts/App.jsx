var React = require('react'),
    Morearty = require('morearty'),
    Immutable = require('immutable'),
    RouteHandler = require('react-router').RouteHandler;

var Ctx = require('./Ctx'),
    socket = require('./socket');

var EditBox = require('./EditBox'),
    NoteList = require('./NoteList'),
    StatusBar = require('./StatusBar');


var App = React.createClass({
    displayName: 'App',

    componentDidMount: function() {
        Ctx.init(this);

        // Debugging
        if( process.env.NODE_ENV !== 'production' ) window.Ctx = Ctx;

        // Init SockJS
        var b = Ctx.getBinding();
        socket.onopen = function() {
            console.log("Connected to server");
            b.set('connected', true);
        };
        socket.onclose = function() {
            console.log("Disconnected from server");

            // TODO: reconnect
            b.set('connected', false);
        };
        socket.onmessage = function(e) {
            var spl = e.data.split("|"),
                ty = spl[0],
                data = spl.slice(1).join('|');

            if( !ty || !data ) return;

            data = JSON.parse(data);

            switch( ty ) {
            case "notes added":
                if( !data.length ) break;

                console.log("New notes: ", data);

                // Push these notes on our array.
                b.update('notes', function(notes) {
                    var fromServer = Immutable.fromJS(data);

                    // Get all existing IDs.
                    var seen = {};
                    notes.forEach(function(note) {
                        seen[note.get('id')] = true;
                    });

                    // Add only notes that we haven't seen already.
                    var shouldAdd = fromServer.filter(function(note) {
                        return seen[note.get('id')] === undefined;
                    });

                    return notes.concat(shouldAdd);
                });
                break;

            case "note deleted":
                console.log("Deleting note:", data);

                b.update('notes', function(notes) {
                    return notes.filter(function(note) {
                        return note.get('id') !== data;
                    });
                });
                break;

            default:
                console.log("Unknown message:", ty);
            }
        };
    },

    render: function() {
        return React.withContext({ morearty: Ctx, socket: socket }, function() {
            var b = Ctx.getBinding();
            return (
                <div>
                  <StatusBar binding={b} />
                  <div className="container">
                    <EditBox binding={b} />

                    <hr />

                    {/* Render the list of notes */}
                    <NoteList binding={b.sub("notes")} />

                    {/* Subroutes are rendered into here */}
                    <RouteHandler binding={b} />
                  </div>
                </div>
            );
        });
    },
});

module.exports = App;
