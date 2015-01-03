var React = require('react'),
    Router = require('react-router');

var App = require('./scripts/App'),
    data = require('./scripts/data'),
    { requestAnimationFrame, cancelAnimationFrame } = require('./scripts/requestAnimationFrame');


// TODO: wire up messages from sockjs


var rerender = function rerender(structure, el) {
    var Handler, state;
    var render = function render(h, s) {
        // TODO: this is b0rked
        /////if (h) Handler = h;
        if (!Handler) Handler = h;
        if (s) state = s;

        React.render(<Handler cursor={structure.cursor()} statics={state} />, el);
    };

    // Only rerender on requestAnimationFrame.
    var queuedChange = false;
    structure.on('swap', function() {
        if( queuedChange ) return;
        queuedChange = true;

        requestAnimationFrame(function() {
            queuedChange = false;
            // TODO: arguments?
            render();
        });
    });
    return render;
};


var routes = require('./scripts/Routes');
Router.run(routes, rerender(data, document.getElementById('application')));
