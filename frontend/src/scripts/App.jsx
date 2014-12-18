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

        // Init Socket.IO
        var b = Ctx.getBinding();
        socket.on('connect', function() {
            console.log("Connected to server");
            b.set('connected', true);
        });
        socket.on('disconnect', function() {
            console.log("Disconnected from server");
            b.set('connected', false);
        });
        socket.on('notes added', function(data) {
            console.log("New notes: ", data);

            // Push these notes on our array.
            b.update('notes', function(notes) {
                return notes.concat(Immutable.fromJS(data));
            });

            // TODO: should check for conflicts in IDs
        });
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
