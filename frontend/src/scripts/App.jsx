var React = require('react'),
    Morearty = require('morearty'),
    RouteHandler = require('react-router').RouteHandler;

var path = window.location.protocol + '//' + window.location.host;
    socket = require('socket.io-client')(path);

var Ctx = require('./Ctx'),
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
            console.log("Connected to server at: " + path);
            b.set('connected', true);

            socket.emit("new_posts", [{id: 1}, {id: 2}]);
        });
        socket.on('disconnect', function() {
            console.log("Disconnected from server");
            b.set('connected', false);
        });
        socket.on('new_posts', function(data) {
            console.log("New posts: ", data);
        });
    },

    render: function() {
        return React.withContext({ morearty: Ctx, socket: socket }, function() {
            var b = Ctx.getBinding();
            return (
                <div>
                  <StatusBar binding={b} />
                  <div className="container">
                    <RouteHandler binding={b} />
                  </div>
                </div>
            );
        });
    },
});

module.exports = App;
