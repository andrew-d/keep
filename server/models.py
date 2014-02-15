import peewee
from .util import utctimestamp


db_proxy = peewee.Proxy()


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

        # TODO: if this is a list, we have multiple items that should be saved,
        # so perhaps return a list of models?  or a transaction?
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
