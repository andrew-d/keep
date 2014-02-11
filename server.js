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

                // The 'text' field is uses if type === 'note'
                t.text('text').nullable();

                // Otherwise, the items are found in the 'listItems' table.
            });
        } else {
            console.log("'items' table already exists");
        }
    });

    var listItems = knex.schema.hasTable('listItems').then(function(exists) {
        if( !exists ) {
            console.log("Creating 'listItems' table...");
            return knex.schema.createTable('listItems', function(t) {
                t.integer('item').references('id').inTable('items').notNullable();
                t.integer('id').notNullable();
                t.text('text').notNullable();
                t.boolean('checked').notNullable();

                t.primary(['item', 'id']);
            });
        } else {
            console.log("'listItems' table already exists");
        }
    });

    // Resolve only when all creations are finished.
    return Promise.all([
        items,
        listItems,
    ]);
};

var addNoteItem = function(item) {
    return knex('items').insert({
        type: 'note',
        title: item.title,
        text: item.text,
    }, 'id');
};

var addListItem = function(item) {
    // Add all components as a transaction.
    return knex.transaction(function(t) {
        // Insert main list item, and then only if that succeeds,
        // continue inserting all further items.
        knex('items')
            .transacting(t)
            .insert({
                type: 'list',
                title: item.title,
            }, 'id')
            .then(function(row) {
                // Get list of items to insert.
                var toInsert = _.map(item.items, function(val, i) {
                    return {
                        item: row[0],
                        id: i,
                        text: val.text,
                        checked: val.checked,
                    };
                });

                // Resolve when all items have been inserted.
                return Promise.all(_.map(toInsert, function(item) {
                    return knex('listItems')
                            .transacting(t)
                            .insert(item);
                }));
            })
            .then(t.commit, t.rollback);
    });
};

var addTestData = function() {
    return Promise.all(_.map([
        {type: 'note', title: 'Note 1', text: 'Text 1'},
        {type: 'note', title: 'Note 2', text: 'Text 2'},
        {type: 'note', title: 'Note 3', text: 'Text 3'},
        {type: 'note', title: 'Note 4', text: 'Text 4'},
        {type: 'list', title: 'List 1',
         items: [{text: 'foo', checked: false},
                 {text: 'bar', checked: true}],
        },
    ], function(info, i) {
        var prom;

        if( 'note' === info.type ) {
            prom = addNoteItem(info);
        } else if( 'list' === info.type ) {
            prom = addListItem(info);
        } else {
            throw new Error('invalid item type: ' + info.type);
        }

        prom.then(function(row) {
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
        text = validator.toString(req.body.text);
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
            text: text,
        }, 'id').then(function(row) {
            resp.send({
                id: row[0],
                type: type,
                title: title,
                text: text,
            });
        }, function(err) {
            resp.send(500, {error: 'error inserting item'});
        });
});
app.get('/items', function(req, resp) {
    // TODO: returning just a bare array is a bad idea - fix this
    var items = [];

    // Get all note items first...
    knex('items')
        .select()
        .then(function(row) {
            // For each item, we do one of two things:
            // 1. If it's a note item, we just append it to the output array.
            // 2. Otherwise, we create a promise that queries the entries for
            //    the list item and builds the final item, and then appends
            //    that to the output array.
            var promises = [];

            _.each(row, function(item, i) {
                if( item.type === 'note' ) {
                    items.push(item);
                    return;
                }

                var prom = knex('listItems')
                            .where({
                                'item': item.id,
                            })
                            .select()
                            .then(function(row) {
                                item.items = row;

                                // Will always be null for list items.
                                delete item.text;

                                // Convert to boolean (SQLite stores booleans
                                // as integers).
                                item.checked = Boolean(item.checked);

                                // Push on list.
                                items.push(item);
                            });
                promises.push(prom);
            });

            return Promise.all(promises);
        }).then(function() {
            resp.send(items);
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
