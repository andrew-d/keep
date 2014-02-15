from __future__ import print_function

import os
import json
import time
import uuid
import logging
from datetime import datetime

import peewee
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
from tornado.options import define, options


log = logging.getLogger("keep")
CURR_DIR = os.path.abspath(os.path.dirname(__file__))
db_proxy = peewee.Proxy()


def utctimestamp():
    return int((datetime.utcnow() - datetime(1970, 1, 1)).total_seconds())


class BaseModel(peewee.Model):
    class Meta:
        database = db_proxy


class Item(BaseModel):
    id = peewee.PrimaryKeyField()
    title = peewee.CharField(max_length=140, null=False)
    type = peewee.CharField(null=False)
    timestamp = peewee.IntegerField(null=False)

    # Can be null if type != 'note'
    text = peewee.TextField(null=True)

    @classmethod
    def from_dict(klass, d):
        """
        Creates a new Item from the given dictionary and returns it.
        Note that the item will not have been saved to the database.
        """
        ty = d['type']
        timestamp = utctimestamp()
        item = Item(title=d['title'], type=ty, timestamp=timestamp)

        if ty == 'note':
            item.text = d['text']

        elif ty == 'list':
            # TODO: add entries
            pass

        else:
            raise ValueError("Unknown type '%s'" % (ty,))

        return item

    def to_dict(self):
        """
        Serialize this model to a dictionary.
        """
        d = {
            'id': self.id,
            'type': self.type,
            'title': self.title,
            'timestamp': self.timestamp
        }

        if self.type == 'note':
            d['text'] = self.text

        elif self.type == 'list':
            items = [i.to_dict() for i in self.items]
            d['items'] = items

        else:
            raise ValueError("Unknown type '%s'" % (self.type,))

        return d


class ListEntry(BaseModel):
    item = peewee.ForeignKeyField(Item, null=False,
                                  related_name='items')
    id = peewee.IntegerField(null=False)
    text = peewee.TextField(null=False)
    checked = peewee.BooleanField(null=False)

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'checked': self.checked,
        }

    class Meta:
        primary_key = peewee.CompositeKey('item', 'id')


# ----------------------------------------------------------------------

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            # Convert to time tuple, then format.
            d = o.utctimetuple()

            # RFC1123 format.  Thanks to Werkzeug for this particular snippet.
            return '%s, %02d %s %s %02d:%02d:%02d GMT' % (
                ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun')[d.tm_wday],
                d.tm_mday,
                ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                 'Oct', 'Nov', 'Dec')[d.tm_mon - 1],
                str(d.tm_year), d.tm_hour, d.tm_min, d.tm_sec
            )

        elif isinstance(o, uuid.UUID):
            return str(o)

        return json.JSONEncoder.default(self, o)


class BaseHandler(tornado.web.RequestHandler):
    def write(self, chunk):
        # We do a couple of things that generally improve working with JSON:
        #   1. We always escape the characters: <>&'
        #   2. We use an additional encoder that handles datetimes and UUIDs
        #   3. If the application is in debug mode or the config flag is set,
        #      we sort the keys, and pretty-print the JSON output.  Otherwise,
        #      we just dump as-is.
        if not isinstance(chunk, (dict, list)):
            return tornado.web.RequestHandler.write(self, chunk)

        args = {
            'cls': JSONEncoder,
        }

        # Debug settings.
        # TODO: consider making this an explicit option, rather than (just?)
        # relying on debug mode
        isDebug = self.settings.get('debug', False)
        if isDebug:
            args['sort_keys'] = True
            args['indent'] = 4
            args['separators'] = (',', ': ')
        else:
            args['separators'] = (',', ':')

        # Do the real work
        s = json.dumps(chunk, **args)

        # Prepend "while(1);" to the response if it's a list, to prevent JSON
        # hijacking.  This gets stripped on the client-side.
        if isinstance(chunk, list):
            s = 'while(1);' + s

        # In debug mode, we append a newline so when you cURL the API (for
        # example), it looks nicer.
        if isDebug:
            s = s + "\n"

        # Escape the given characters.
        s = (s.replace(u'<', u'\\u003c') \
              .replace(u'>', u'\\u003e') \
              .replace(u'&', u'\\u0026') \
              .replace(u"'", u'\\u0027')
             )

        # Write the new string.  Also, mimic the original behavior of Tornado
        # and set the HTTP header.
        tornado.web.RequestHandler.write(self, s)
        self.set_header("Content-Type", "application/json; charset=UTF-8")

    def write_error(self, status_code, message='',
                    type="invalid_request", params=None, exc_info=None,
                    **kwargs):

        # Build basic error response
        resp = {'type': type}
        if len(message) > 0:
            resp['message'] = message
        if params is not None:
            resp['params'] = params

        log.info('foo')

        # If there's an error and we're in debug mode, we also return the
        # exception that caused it.
        if exc_info is not None and self.settings.get('debug', False):
            import traceback
            resp['exception'] = traceback.format_exception(*exc_info)

        self.set_status(status_code)
        self.set_header("Content-Type", "application/json; charset=UTF-8")
        self.write(resp)


class ErrorHandler(BaseHandler):
    def prepare(self):
        # This is reached when we have an error from the Application - here,
        # it means that we've reached a route that doesn't match.  We just
        # return a 404.
        self.send_error(404, message='endpoint not found')


class ItemsHandler(BaseHandler):
    @tornado.web.removeslash
    def get(self):
        items = list(x.to_dict() for x in Item.select())
        self.write(items)

    @tornado.web.removeslash
    def post(self):
        try:
            new_item = json.loads(self.request.body)
        except ValueError:
            return self.send_error(400, message='invalid JSON')

        # Create from dictionary.
        # TODO: catch errors here and at the .save()
        new_model = Item.from_dict(new_item)

        # Save
        new_model.save()
        self.write(new_model.to_dict())


class ItemHandler(BaseHandler):
    def get(self, id):
        try:
            id = int(id)
        except ValueError:
            return self.send_error(400, message='invalid id')

        try:
            item = Item.select().where(Item.id == id).get()
        except Item.DoesNotExist:
            return self.send_error(404, message='item not found')

        self.write(item.to_dict())

    def put(self, id):
        try:
            id = int(id)
        except ValueError:
            return self.send_error(400, message='invalid id')

        try:
            new_item = json.loads(self.request.body)
        except ValueError:
            return self.send_error(400, message='invalid JSON')

        try:
            item = Item.select().where(Item.id == id).get()
        except Item.DoesNotExist:
            return self.send_error(404, message='item not found')

        # Generate a new timestamp
        timestamp = utctimestamp()

        # Validate input params.
        if 'title' not in new_item:
            return self.send_error(400, message='missing parameter "title"')
        if 'type' not in new_item:
            return self.send_error(400, message='missing parameter "type"')
        if 'type' not in new_item:
            return self.send_error(400, message='missing parameter "type"')

        ty = new_item['type']

        if ty not in ['note', 'list']:
            return self.send_error(400, message='invalid parameter "type"')

        if ty == 'note' and 'text' not in new_item:
            return self.send_error(400, message='missing parameter "text"')
        elif ty == 'list':
            # TODO: some sort of check here
            pass

        # Update the item.
        item.type = ty
        item.timestamp = timestamp
        item.title = new_item['title']

        if ty == 'note':
            item.text = new_item['text']
        elif ty == 'list':
            # TODO: update here
            pass

        # TODO: validate the timestamp too?
        item.save()

        # Return item.
        self.write(item.to_dict())

    def delete(self, id):
        try:
            id = int(id)
        except ValueError:
            return self.send_error(400, message='invalid id')

        dq = Item.delete().where(Item.id == id)
        rows_deleted = dq.execute()

        if rows_deleted == 0:
            self.send_error(404, message='item not found')
        else:
            self.write({'status': 'deleted'})


class IndexHandler(BaseHandler):
    def get(self):
        with open(os.path.join(CURR_DIR, 'build', 'index.html'), 'rb') as f:
            data = f.read()
        self.write(data)


# TODO: Use this to broadcast real-time updates
class SocketHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        pass

    def on_message(self):
        pass

    def on_close(self):
        pass


def add_test_data():
    test_data = [
        {'type': 'note', 'title': 'Note 1', 'text': 'Text 1'},
        {'type': 'note', 'title': 'Note 2', 'text': 'Text 2'},
        {'type': 'note', 'title': 'Note 3', 'text': 'Text 3'},
        {'type': 'note', 'title': '', 'text': 'Note with no title'},
        {'type': 'list', 'title': 'List 1',
         'items': [{'text': 'foo', 'checked': False},
                 {'text': 'bar', 'checked': True}],
        },
        {'type': 'list', 'title': 'List 2', 'items': []},
    ]

    for item in test_data:
        # Generate a timestamp for this item.
        item['timestamp'] = int(time.time())

        # Create and save it.
        model = Item.from_dict(item)
        model.save()


define("debug", default=False, help="Run in debug mode")
define("address", default='0.0.0.0', help="Address to listen on")
define("port", default=8888, type=int, help="Listen on the given port")


if __name__ == "__main__":
    tornado.options.parse_command_line()

    db = peewee.SqliteDatabase('./keep.db')
    db_proxy.initialize(db)

    app = tornado.web.Application([
            (r'/', IndexHandler),
            (r'/api/ws', SocketHandler),
            (r'/api/items/?', ItemsHandler),
            (r'/api/items/([0-9]+)', ItemHandler),
        ],
        static_path=os.path.join(CURR_DIR, 'build'),
        debug=options.debug,
        default_handler_class=ErrorHandler,
        default_handler_args={}
    )

    Item.create_table(fail_silently=True)
    ListEntry.create_table(fail_silently=True)

    #add_test_data()

    # Mimic the SimpleHTTPServer status line
    msg = 'Serving HTTP on %s port %d' % (options.address, options.port)
    if options.debug:
        msg = msg + ' (debug)'
    log.info(msg + ' ...')

    # Actually kick off listening
    app.listen(options.port, address=options.address)

    try:
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        pass
