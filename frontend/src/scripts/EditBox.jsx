var React = require('react'),
    component = require('omniscient');


var EditBox = component('EditBox', function() {
    var handleSubmit = (e) => {
        e.preventDefault();

        var title = this.refs.title.getDOMNode().value.trim(),
            text = this.refs.text.getDOMNode().value.trim();

        console.log("Would submit new note", title, text);
    };

    return (
        <div className="row">
          <div className="col-lg-6 col-lg-offset-3">
            <form role="form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input type="text" className="form-control"
                       placeholder="Title" ref="title" />
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
});


module.exports = EditBox;
