/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore')._;

var NoteItem = require('./models/NoteItem.js');


var EditBox = React.createClass({
    handleSubmit: function() {
        var title = this.refs.title.getDOMNode().value.trim(),
            type = this.state.active,
            coll = this.props.coll;

        if( 'note' === type ) {
            var text = this.refs.noteText.getDOMNode().value.trim();

            // Optimistically create and add the model, and, if the save fails,
            // back out the change.
            // TODO: report this error to the user rather than have the item just
            // mysteriously disappear... maybe have a 'saved' flag on the model?
            var model = coll.create({
                type: 'note',
                title: title,
                text: text
            }, {
                // success: function(model, response, options) {
                //     console.log(response);
                //     model.set('timestamp', response.timestamp);
                // },
                error: function(model, xhr, options) {
                    // This is only triggered if the model failed to save.  If so,
                    // we remove this model from the collection.
                    coll.remove(model);
                },
            });
        } else if( 'list' === type ) {
            console.log("List submit");
        }

        return false;
    },

    handleTypeSwitch: function(which, e) {
        var newState = this.state.active === 'note' ? 'list' : 'note';
        this.setState({active: newState});
        return false;
    },

    getInitialState: function() {
        return {active: 'note'};
    },

    render: function() {
        var active = this.state.active;

        var activeStyle = 'form-group';
        var inactiveStyle = 'form-group hidden';

        var noteComponent = (
              <div className={active === 'note' ? activeStyle : inactiveStyle}>
                <textarea className="form-control" ref="noteText" placeholder="Add note">
                </textarea>
              </div>
        );

        var listComponent = (
              <div className={active === 'list' ? activeStyle : inactiveStyle}>
                TODO: add list items here
              </div>
        );

        var buttonIcon;
        if( 'note' === active ) {
            buttonIcon = (
                <span className="glyphicon glyphicon-th-list"></span>
            );
        } else {
            buttonIcon = (
                <span className="glyphicon glyphicon-pencil"></span>
            );
        }

        var theForm = (
            <form role="form" onSubmit={this.handleSubmit}>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Title" ref="title" />
              </div>
              {noteComponent}
              {listComponent}
              <button type="submit" className="btn btn-primary">
                Add
              </button>
              <button type="button" className="btn btn-default pull-right" onClick={this.handleTypeSwitch}>
                {buttonIcon}
              </button>
            </form>
        );

        return (
            <div>
                {theForm}
            </div>
        );
    }
});


module.exports = EditBox;
