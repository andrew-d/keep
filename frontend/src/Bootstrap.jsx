var React = require('react'),
    Router = require('react-router');

var App = require('./scripts/App'),
    data = require('./scripts/data'),
    { requestAnimationFrame, cancelAnimationFrame } = require('./scripts/requestAnimationFrame');


// TODO: wire up messages from sockjs


var rerender = function rerender(structure, el) {
    var Handler;
    var render = function render(h) {
        if (h) Handler = h;

        React.render(<Handler cursor={structure.cursor()} />, el);
    };

    // Only rerender on requestAnimationFrame.
    var queuedChange = false;
    structure.on('swap', function() {
        if( queuedChange ) return;
        queuedChange = true;

        requestAnimationFrame(function() {
            queuedChange = false;

            // Note: we call this without arguments so as to use the existing
            // saved Handler.
            render();
        });
    });
    return render;
};


var routes = require('./scripts/Routes');
Router.run(routes, rerender(data, document.getElementById('application')));
