var React = require('react'),
    RouteHandler = require('react-router').RouteHandler,
    component = require('omniscient');

var EditBox = require('./EditBox').jsx,
    NoteList = require('./NoteList').jsx,
    StatusBar = require('./StatusBar').jsx;

var App = component('App', function(props) {
    return (
        <div>
          <StatusBar status={props.cursor.cursor('connected')} />
          <div className="container">
            <EditBox />

            <hr />

            <NoteList notes={props.cursor.cursor("notes")} />
            <RouteHandler {...this.props} />
          </div>
        </div>
    );
});


module.exports = App;
