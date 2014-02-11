var express   = require('express'),
    Knex      = require('knex'),
    path      = require('path'),
    Promise   = require('bluebird'),
    util      = require('util'),
    validator = require('validator'),
    _         = require('underscore')._;

// Set up DB.
var knex = Knex.initialize({
    client: 'sqlite3',
    connection: {
        filename: './keep.db',
    }
});

var setupDatabase = function() {
    var items = knex.schema.hasTable('items').then(function(exists) {
        if( !exists ) {
            console.log("Creating 'items' table...");
            return knex.schema.createTable('items', function(t) {
                t.increments('id').primary();
                t.string('title', 100).notNullable();
                t.enu('type', ['note', 'list']).notNullable();
                t.text('contents').notNullable();
                // TODO: contents for list?
            });
        } else {
            console.log("'items' table already exists");
        }
    });

    // Resolve only when all creations are finished.
    return Promise.all([
        items,
    ]);
};

var addTestData = function() {
    return Promise.all(_.map([
        {title: 'Note 1', contents: 'Contents 1'},
        {title: 'Note 2', contents: 'Contents 2'},
        {title: 'Note 3', contents: 'Contents 3'},
        {title: 'Note 4', contents: 'Contents 4'},
    ], function(info) {
        return knex('items')
                .insert({
                    type: 'note',
                    title: info.title,
                    contents: info.contents,
                }, 'id').then(function(row) {
                    console.log('inserted item with id: ' + row[0]);
                }, function(err) {
                    console.log("error inserting item " + i + ": " + err);
                });
    }));
};

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000)
    app.set('host', '0.0.0.0');

    app.use(express.logger());
    app.use(express.json());
    app.use('/', express.static(path.join(__dirname, 'build')));

    // TODO: move to management script or something.
    setupDatabase().then(function() {
        return addTestData();
    }).then(function() {
        console.log("DB init done");
    }, function(err) {
        console.error("error initializing DB: " + err);
    });
});


app.post('/items', function(req, resp) {
    // Validate input parameters.
    var type = validator.toString(req.body.type),
        title = validator.toString(req.body.title),
        contents = validator.toString(req.body.contents);
    if( !validator.isLength(title, 0, 100) ) {
        resp.send(400, {error: 'invalid title length'});
        return;
    }
    if( !validator.isIn(type, ['note', 'list']) ) {
        resp.send(400, {error: 'invalid type: ' + type});
        return;
    }

    knex('items')
        .insert({
            type: type,
            title: title,
            contents: contents,
        }, 'id').then(function(row) {
            resp.send({
                id: row[0],
                type: type,
                title: title,
                contents: contents,
            });
        }, function(err) {
            resp.send(500, {error: 'error inserting item'});
        });
});
app.get('/items', function(req, resp) {
    // TODO: returning just a bare array is a bad idea - fix this
    knex('items').select().then(function(row) {
        resp.send(row);
        //resp.send(404, {error: 'not found'});
    });
});
app.get('/items/:id', function(req, resp) {
    if( !validator.isNumeric(req.params.id) ) {
        resp.send(400, {error: 'invalid id, must be numeric'});
        return;
    }

    var itemId = validator.toInt(req.params.id, 10);
    knex('items')
        .where({id: itemId})
        .select()
        .then(function(row) {
            if( row.length === 0 ) {
                resp.send(404, {error: 'not found'});
            } else {
                resp.send(row[0]);
            }
        }, function(err) {
            resp.send(500, 'error getting item');
            // TODO: log error somehow
        });
});
app.put('/items/:id', function(req, resp) {
    // TODO: handle updating single item
    resp.send(500, {error: 'not implemented'});
});
app.del('/items/:id', function(req, resp) {
    // TODO: handle deleting single item
    resp.send(500, {error: 'not implemented'});
});

app.listen(app.get('port'), app.get('host'), function() {
    // Mimic the Python 'SimpleHTTPServer' status line.
    console.log('Serving HTTP on ' + app.get('host') +
                ' port ' + app.get('port') + ' ...');
});
