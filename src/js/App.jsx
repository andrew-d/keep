/** @jsx React.DOM */
var React = require('react');
var $ = require('jquery');

var Header = require('./Header.jsx');
var EditBox = require('./EditBox.jsx');
var ItemList = require('./ItemList.jsx');
var ItemCollection = require('./models/ItemCollection.js');


var Application = React.createClass({
    componentWillMount: function() {
        this.items = new ItemCollection();
        this.items.fetch({reset: true});
    },
    render: function() {
        return (
            <div className="container">
                <Header />
                <div className="row">
                    <div className="col-md-6 col-md-offset-3">
                        <EditBox coll={this.items} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <ItemList model={this.items} />
                    </div>
                </div>
            </div>
        );
    }
});

// Expose the application to the user.
module.exports = Application;
