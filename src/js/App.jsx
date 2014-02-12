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
        // NOTE: we need the dummy <div> here, since we can't return multiple
        // DOM nodes from the render() function.
        return (
            <div>
                <Header />
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 col-md-offset-3">
                            <EditBox coll={this.items} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <hr />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <ItemList model={this.items} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

// Expose the application to the user.
module.exports = Application;
