import peewee
from .util import utctimestamp


db_proxy = peewee.Proxy()


class BaseModel(peewee.Model):
    class Meta:
        database = db_proxy


class Item(BaseModel):
    id = peewee.PrimaryKeyField()
    title = peewee.CharField(max_length=140, null=False)
    timestamp = peewee.IntegerField(null=False)
    text = peewee.TextField(null=False)

    @classmethod
    def from_dict(klass, d):
        """
        Creates a new Item from the given dictionary and returns it.
        Note: will not save the model to the database.
        """

        timestamp = utctimestamp()

        args = {
            'title': d['title'],
            'timestamp': timestamp,
            'text': d['text']
        }

        item = Item.create(**args)
        return item

    def to_dict(self):
        """
        Serialize this model to a dictionary.
        """
        d = {
            'id': self.id,
            'title': self.title,
            'timestamp': self.timestamp,
            'text': self.text,
        }

        return d
