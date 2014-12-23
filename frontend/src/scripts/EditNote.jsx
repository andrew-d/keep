var React = require('react'),
    Morearty = require('morearty'),
    Router = require('react-router');


var EditNote = React.createClass({
    displayName: 'EditNote',
    mixins: [Morearty.Mixin, Router.Navigation],

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
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <button type="button"
                            className="close"
                            onClick={this.handleClose}
                            aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 className="modal-title" id="myModalLabel">Modal title</h4>
                  </div>
                  <div className="modal-body">
                    <h2>Modal Content</h2>
                  </div>
                  <div className="modal-footer">
                    Modal Footer
                  </div>
                </div>
              </div>
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
