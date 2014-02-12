import os
import json
import time

import peewee
import tornado.ioloop
import tornado.web


db = peewee.SqliteDatabase('./keep.db')


class Item(peewee.Model):
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
        item = Item(title=d['title'], type=ty, timestamp=d['timestamp'])

        if ty == 'note':
            item.text = d['text']

        elif ty == 'list':
            # TODO: add entries
            pass

        else:
            # TODO: error
            pass

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
            # TODO: error
            pass

        return d

    # TODO: bind this later
    class Meta:
        database = db


class ListEntry(peewee.Model):
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

    # TODO: compound private key?
    # TODO: bind this later
    class Meta:
        database = db


class ItemsHandler(tornado.web.RequestHandler):
    def get(self):
        items = list(x.to_dict() for x in Item.select())

        # TODO: make browser-safe by encoding / escaping certain
        # things
        self.write(json.dumps(items))

    def post(self):
        self.write('add new item')


curr_dir = os.path.abspath(os.path.dirname(__file__))
app = tornado.web.Application([
    (r'/items', ItemsHandler)
], static_path=os.path.join(curr_dir, 'build'))


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


if __name__ == "__main__":
    Item.create_table()
    ListEntry.create_table()

    add_test_data()

    app.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
