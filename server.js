var express = require('express'),
    path    = require('path');
    util    = require('util');
    _       = require('underscore')._;

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000)
    app.set('host', '0.0.0.0');

    app.use(express.logger());
    app.use('/', express.static(path.join(__dirname, 'build')));
});


// TODO: database or something
var items = [
    {
        id: 1,
        type: 'note',
        title: 'Note Title',
        contents: 'foobar'
    },
    {
        id: 2,
        type: 'list',
        title: 'List Title',
        items: [
            {text: 'One', checked: false},
            {text: 'Two', checked: false},
            {text: 'Three', checked: true}
        ]
    },
    {
        id: 3,
        type: 'note',
        title: 'Item 3',
        contents: 'three'
    },
    {
        id: 4,
        type: 'note',
        title: 'Item 4',
        contents: 'four'
    },
    {
        id: 5,
        type: 'note',
        title: 'Item 5',
        contents: 'five'
    }
];

app.post('/items', function(req, resp) {
    // TODO: handle item creation
});
app.get('/items', function(req, resp) {
    // TODO: returning just a bare array is a bad idea - fix this
    resp.send(items);
});
app.get('/items/:id', function(req, resp) {
    // TODO: better parsing
    var itemId = +req.params.id;

    var item = _.find(items, function(i) {
        return i.id === itemId;
    });
    if( item !== undefined ) {
        resp.send(item);
    } else {
        resp.send(404, {error: 'not found'});
    }
});
app.put('/items/:id', function(req, resp) {
    // TODO: handle updating single item
});
app.del('/items/:id', function(req, resp) {
    // TODO: handle deleting single item
});

app.listen(app.get('port'), app.get('host'), function() {
    // Mimic the Python 'SimpleHTTPServer' status line.
    console.log('Serving HTTP on ' + app.get('host') +
                ' port ' + app.get('port') + ' ...');
});
