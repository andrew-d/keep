#!/usr/bin/env python

from __future__ import print_function

import os
import sys
import baker
import peewee

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
import server
import server.models
import server.util


DB_MODELS = [server.models.Item]


def init_db(conn_str, dbtype='sqlite'):
    if dbtype == 'sqlite':
        db = peewee.SqliteDatabase(conn_str)
    elif dbtype == 'postgres':
        # TODO: support me
        db = None

    server.models.db_proxy.initialize(db)


@baker.command
def syncdb():
    # TODO: get this from somewhere
    init_db('./keep.db')
    for model in DB_MODELS:
        model.create_table(fail_silently=True)


@baker.command
def dropdb():
    # TODO: get this from somewhere
    init_db('./keep.db')
    for model in DB_MODELS:
        model.drop_table()


@baker.command
def add_test_data():
    test_data = [
        {'title': 'Note 1', 'text': 'Text 1'},
        {'title': 'Note 2', 'text': 'Text 2'},
        {'title': 'Note 3', 'text': 'Text 3'},
        {'title': '', 'text': 'Note with no title'},
    ]

    init_db('./keep.db')
    for item in test_data:
        # Generate a timestamp for this item.
        item['timestamp'] = server.util.utctimestamp()

        # Create and save it.
        with server.models.db_proxy.transaction():
            new_item = server.models.Item.from_dict(item)
            new_item.save()


baker.run()
