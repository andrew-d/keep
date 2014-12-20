//  Copyright (c) 2014 Couchbase, Inc.
//  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
//  except in compliance with the License. You may obtain a copy of the License at
//    http://www.apache.org/licenses/LICENSE-2.0
//  Unless required by applicable law or agreed to in writing, software distributed under the
//  License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
//  either express or implied. See the License for the specific language governing permissions
//  and limitations under the License.

// +build leveldb full

package leveldb

import (
	"fmt"
	"sync"

	"github.com/blevesearch/bleve/index/store"
	"github.com/blevesearch/bleve/registry"
	"github.com/jmhodges/levigo"
)

const Name = "leveldb"

type Store struct {
	path   string
	opts   *levigo.Options
	db     *levigo.DB
	writer sync.Mutex
}

func Open(path string, createIfMissing bool, errorIfExists bool) (*Store, error) {
	rv := Store{
		path: path,
	}

	opts := levigo.NewOptions()
	opts.SetCreateIfMissing(createIfMissing)
	opts.SetErrorIfExists(errorIfExists)
	rv.opts = opts

	var err error
	rv.db, err = levigo.Open(rv.path, rv.opts)
	if err != nil {
		return nil, err
	}

	return &rv, nil
}

func (ldbs *Store) get(key []byte) ([]byte, error) {
	return ldbs.db.Get(defaultReadOptions(), key)
}

func (ldbs *Store) getWithSnapshot(key []byte, snapshot *levigo.Snapshot) ([]byte, error) {
	options := defaultReadOptions()
	options.SetSnapshot(snapshot)
	return ldbs.db.Get(options, key)
}

func (ldbs *Store) set(key, val []byte) error {
	ldbs.writer.Lock()
	defer ldbs.writer.Unlock()
	return ldbs.setlocked(key, val)
}

func (ldbs *Store) setlocked(key, val []byte) error {
	return ldbs.db.Put(defaultWriteOptions(), key, val)
}

func (ldbs *Store) delete(key []byte) error {
	ldbs.writer.Lock()
	defer ldbs.writer.Unlock()
	return ldbs.deletelocked(key)
}

func (ldbs *Store) deletelocked(key []byte) error {
	return ldbs.db.Delete(defaultWriteOptions(), key)
}

func (ldbs *Store) Close() error {
	ldbs.db.Close()
	return nil
}

func (ldbs *Store) iterator(key []byte) store.KVIterator {
	rv := newIterator(ldbs)
	rv.Seek(key)
	return rv
}

func (ldbs *Store) Reader() (store.KVReader, error) {
	return newReader(ldbs)
}

func (ldbs *Store) Writer() (store.KVWriter, error) {
	return newWriter(ldbs)
}

func (ldbs *Store) newBatch() store.KVBatch {
	return newBatch(ldbs)
}

func StoreConstructor(config map[string]interface{}) (store.KVStore, error) {
	path, ok := config["path"].(string)
	if !ok {
		return nil, fmt.Errorf("must specify path")
	}
	createIfMissing := false
	cim, ok := config["create_if_missing"].(bool)
	if ok {
		createIfMissing = cim
	}
	errorIfExists := true
	eie, ok := config["error_if_exists"].(bool)
	if ok {
		errorIfExists = eie
	}
	return Open(path, createIfMissing, errorIfExists)
}

func init() {
	registry.RegisterKVStore(Name, StoreConstructor)
}
