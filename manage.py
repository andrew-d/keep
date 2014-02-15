#!/usr/bin/env python

from __future__ import print_function

import os
import sys
import baker

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
import server
import server.models
import server.util


DB_MODELS = [server.models.Item, server.models.ListEntry]


@baker.command
def syncdb():
    for model in DB_MODELS:
        model.create_table(fail_silently=True)


@baker.command
def dropdb():
    for model in DB_MODELS:
        model.drop_table()


@baker.command
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
        item['timestamp'] = server.util.utctimestamp()

        # Create and save it.
        model = server.models.Item.from_dict(item)
        model.save()


baker.run()
