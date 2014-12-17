var React = require('react'),
    Router = require('react-router'),
    routes = require('./scripts/Routes');

Router.run(routes, function(Handler) {
    React.render(<Handler />, document.getElementById('application'));
});
