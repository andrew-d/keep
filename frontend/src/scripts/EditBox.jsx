var React = require('react'),
    Morearty = require('morearty');

var socket = require('./socket');


var EditBox = React.createClass({
    displayName: 'EditBox',
    mixins: [Morearty.Mixin],

    render: function() {
        return (
            <div className="row">
              <div className="col-lg-6 col-lg-offset-3">
                <form role="form" onSubmit={this.handleSubmit}>
                  <div className="form-group">
                    <input type="text" className="form-control" placeholder="Title" ref="title" />
                  </div>
                  <div className="form-group">
                    <textarea className="form-control" ref="text" placeholder="Add note">
                    </textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Add
                  </button>
                </form>
              </div>
            </div>
        );
    },

    handleSubmit: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var title = this.refs.title.getDOMNode().value.trim(),
            text = this.refs.text.getDOMNode().value.trim();

        if( !text ) return;

        // TODO: optimistically add note
        socket.emit('add notes', [{
            title: title,
            text:  text,
        }]);
    },
});

module.exports = EditBox;
