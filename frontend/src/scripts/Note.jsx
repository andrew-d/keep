var React = require('react/addons'),
    Morearty = require('morearty'),
    Router = require('react-router');

var Markdown = require('./components/Markdown'),
    socket = require('./socket');


var Note = React.createClass({
    displayName: 'Note',
    mixins: [Morearty.Mixin, Router.Navigation],

    getInitialState: function() {
        return {
            hover: false,
        };
    },

    render: function() {
        var b = this.getDefaultBinding();

        var title = b.get('title'),
            itemHeader = null;

        if( title ) {
            itemHeader = (
                <div className="panel-heading">
                  <b>{title}</b>
                </div>
            );
        }

        var footerClasses = React.addons.classSet({
            'panel-footer': true,
            'invisible':    !this.state.hover,
            // TODO: fade in/out?
        });

        return (
            <div className="col-md-4 col-sm-6 col-xs-12">
              <div className="panel panel-default"
                   onMouseEnter={this.handleMouseEnter}
                   onMouseLeave={this.handleMouseLeave}>
                {itemHeader}
                <div className="panel-body">
                  <Markdown markdown={b.get('text')}
                            taskChanged={this.handleTaskChanged} />
                </div>
                <div className={footerClasses}>
                  <div className="btn-group">
                    <a className="btn btn-default" onClick={this.handleDelete}>
                      <i className="fa fa-lg fa-trash"></i>
                    </a>
                    <a className="btn btn-default" onClick={this.handleEdit}>
                      <i className="fa fa-lg fa-edit"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
        );
    },

    handleTaskChanged: function(index, value) {
        console.log("TODO: Should update item " + index + " with state " + value);
    },

    // Notes should update when their hover state changes, in addition to the
    // overall note state.
    shouldComponentUpdateOverride: function(original, nextProps, nextState) {
        return this.state.hover !== nextState.hover || original();
    },

    handleDelete: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var binding = this.getDefaultBinding();
        socket.sendMessage('delete note', {
            id:       binding.get('id'),
            revision: binding.get('revision'),
        });
    },

    handleMouseEnter: function(e) {
        this.setState({hover: true});
    },

    handleMouseLeave: function(e) {
        this.setState({hover: false});
    },

    handleEdit: function(e) {
        this.transitionTo('edit-note', {note_id: this.getDefaultBinding().get('id')});
    },
});

module.exports = Note;
