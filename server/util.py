import json
import uuid
from datetime import datetime


def utctimestamp():
    """Returns the Unix time, as in integer, in UTC"""
    return int((datetime.utcnow() - datetime(1970, 1, 1)).total_seconds())


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
