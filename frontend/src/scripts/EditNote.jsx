var React = require('react'),
    Morearty = require('morearty'),
    Router = require('react-router'),
    $ = require('jquery');


// Required for side effects.
require('imports?jQuery=jquery!jquery-autosize');


var EditModal = React.createClass({
    displayName: 'EditModal',
    mixins: [Morearty.Mixin],

    propTypes: {
        // Callback to close the modal.
        closeModal: React.PropTypes.func.isRequired,
    },

    render: function() {
        var binding = this.getDefaultBinding();

        // TODO: this might change if the note is synchronized from the server
        // while it's open.  We should not do that.

        return (
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button"
                          className="close"
                          onClick={this.props.closeModal}
                          aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                  </button>
                  <h4 className="modal-title">{binding.get('title')}</h4>
                </div>
                <div className="modal-body">
                  <textarea className="form-control" ref="text" defaultValue={binding.get('text')}></textarea>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-default" onClick={this.props.closeModal}>Close</button>
                  <button type="button" className="btn btn-primary" onClick={this.handleSave}>Save changes</button>
                </div>
              </div>
            </div>
        );
    },

    componentDidMount: function() {
        $(this.refs.text.getDOMNode()).autosize();
    },

    handleSave: function(e) {
        console.log("Should save changes");

        // this.props.closeModal();
    },
});


var EditNote = React.createClass({
    displayName: 'EditNote',
    mixins: [Morearty.Mixin, Router.Navigation, Router.State],

    getInitialState: function() {
        return {windowHeight: window.innerHeight};
    },

    componentDidMount: function() {
        window.addEventListener('resize', this.handleResize);
    },

    componentWillUnmount: function() {
        window.removeEventListener('resize', this.handleResize);
    },

    handleResize: function(e) {
        this.setState({windowHeight: window.innerHeight});
    },

    shouldComponentUpdateOverride: function(original, nextProps, nextState) {
        return this.state.windowHeight !== nextState.windowHeight || original();
    },

    render: function() {
        // Get the height of the window and set the backdrop's style
        var backdropStyle = {
            height: this.state.windowHeight + "px",
        };

        // Get the active note.
        var activeNoteId  = +this.getParams().note_id,
            binding       = this.getDefaultBinding(),
            allNotes      = binding.get('notes'),
            activeNote    = allNotes.findIndex(function(note) {
                return note.get('id') === activeNoteId;
            }),
            activeBinding = binding.sub('notes').sub(activeNote);

        return (
            <div onClick={this.handleClick}
                 className="modal fade in"
                 role="dialog"
                 aria-hidden="true"
                 style={{display: "block"}}
                 >
              {/* The static backdrop */}
              <div className="modal-backdrop fade in" style={backdropStyle} onClick={this.handleClose}></div>

              {/* The actual modal content */}
              <EditModal binding={activeBinding} closeModal={this.handleClose} />
            </div>
        );
    },

    handleClick: function(e) {
        e.stopPropagation();
    },

    handleClose: function(e) {
        this.transitionTo("index");
    },
});

module.exports = EditNote;
