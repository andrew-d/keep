var React = require('react'),
    Router = require('react-router');

var Route = Router.Route,
    NotFoundRoute = Router.NotFoundRoute,
    DefaultRoute = Router.DefaultRoute,
    Link = Router.Link,
    RouteHandler = Router.RouteHandler;

var App = require('./App'),
	Home = require('./Home'),
	EditNote = require('./EditNote');


var routes = (
    <Route name="app" handler={App} path="/">
        <DefaultRoute name="index" handler={Home} />
        <Route name="edit-note" handler={EditNote} path="/notes/:note_id" />
    </Route>
);

module.exports = routes;
