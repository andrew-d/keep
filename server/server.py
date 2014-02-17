from __future__ import print_function

import os
import json
import time
import logging

import peewee
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
from tornado.options import define, options

from .util import utctimestamp, JSONEncoder
from .models import db_proxy, Item, ListEntry


log = logging.getLogger("keep")
CURR_DIR = os.path.abspath(os.path.dirname(__file__))


class BaseHandler(tornado.web.RequestHandler):
    def write(self, chunk):
        # We do a couple of things that generally improve working with JSON:
        #   1. We always escape the characters: <>&'
        #   2. We use an additional encoder that handles datetimes and UUIDs
        #   3. If the application is in debug mode or the config flag is set,
        #      we sort the keys, and pretty-print the JSON output.  Otherwise,
        #      we just dump as-is.
        #   4. If the value we're passed is a list, we prepend the string
        #      'while(1);' to it, to prevent JSON hijacking.  This gets
        #      stripped on the client side.
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
        # and set the Content-Type header.
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

        # TODO: validate the timestamp too?  can use to ensure that this item
        # wasn't trashed by a concurrent update.
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

    def patch(self, id):
        # TODO: support this?  if so, can refactor some of the code from
        # PUT handler out into a new function...
        return self.send_error(405, message='PATCH not currently supported',
                               type='server_error')


class IndexHandler(BaseHandler):
    def get(self):
        with open(os.path.join(CURR_DIR, '..', 'build', 'index.html'), 'rb') as f:
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


define("debug", default=False, help="Run in debug mode")
define("address", default='0.0.0.0', help="Address to listen on")
define("port", default=8888, type=int, help="Listen on the given port")
define("dbtype", default="sqlite", help="Type of DB to use " +
                                        "('sqlite' or 'postgres')")
define("dbpath", default="./keep.db", help="Path to database for SQLite")


def main():
    tornado.options.parse_command_line()

    if options.dbtype == 'sqlite':
        db = peewee.SqliteDatabase(options.dbpath)
    elif options.dbtype == 'postgres':
        # TODO: support me
        db = None

    db_proxy.initialize(db)

    app = tornado.web.Application([
            (r'/', IndexHandler),
            (r'/api/ws', SocketHandler),
            (r'/api/items/?', ItemsHandler),
            (r'/api/items/([0-9]+)', ItemHandler),
        ],
        static_path=os.path.join(CURR_DIR, '..', 'build'),
        debug=options.debug,
        default_handler_class=ErrorHandler,
        default_handler_args={}
    )

    # Mimic the SimpleHTTPServer status line
    msg = 'Serving HTTP on %s port %d' % (options.address, options.port)
    if options.debug:
        msg = msg + ' (debug)'
    log.info(msg + ' ...')

    # Actually kick off listening
    app.listen(options.port, address=options.address)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
