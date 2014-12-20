//  Copyright (c) 2014 Couchbase, Inc.
//  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
//  except in compliance with the License. You may obtain a copy of the License at
//    http://www.apache.org/licenses/LICENSE-2.0
//  Unless required by applicable law or agreed to in writing, software distributed under the
//  License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
//  either express or implied. See the License for the specific language governing permissions
//  and limitations under the License.

package upside_down

import (
	"testing"

	"github.com/blevesearch/bleve/index/store/inmem"
)

func BenchmarkInMemIndexing1Workers(b *testing.B) {
	s, err := inmem.Open()
	if err != nil {
		b.Fatal(err)
	}
	defer s.Close()

	CommonBenchmarkIndex(b, s, 1)
}

func BenchmarkInMemIndexing2Workers(b *testing.B) {
	s, err := inmem.Open()
	if err != nil {
		b.Fatal(err)
	}
	defer s.Close()

	CommonBenchmarkIndex(b, s, 2)
}

func BenchmarkInMemIndexing4Workers(b *testing.B) {
	s, err := inmem.Open()
	if err != nil {
		b.Fatal(err)
	}
	defer s.Close()

	CommonBenchmarkIndex(b, s, 4)
}

// batches

func BenchmarkInMemIndexing1Workers10Batch(b *testing.B) {
	s, err := inmem.Open()
	if err != nil {
		b.Fatal(err)
	}
	defer s.Close()

	CommonBenchmarkIndexBatch(b, s, 1, 10)
}

func BenchmarkInMemIndexing2Workers10Batch(b *testing.B) {
	s, err := inmem.Open()
	if err != nil {
		b.Fatal(err)
	}
	defer s.Close()

	CommonBenchmarkIndexBatch(b, s, 2, 10)
}

func BenchmarkInMemIndexing4Workers10Batch(b *testing.B) {
	s, err := inmem.Open()
	if err != nil {
		b.Fatal(err)
	}
	defer s.Close()

	CommonBenchmarkIndexBatch(b, s, 4, 10)
}

func BenchmarkInMemIndexing1Workers100Batch(b *testing.B) {
	s, err := inmem.Open()
	if err != nil {
		b.Fatal(err)
	}
	defer s.Close()

	CommonBenchmarkIndexBatch(b, s, 1, 100)
}

func BenchmarkInMemIndexing2Workers100Batch(b *testing.B) {
	s, err := inmem.Open()
	if err != nil {
		b.Fatal(err)
	}
	defer s.Close()

	CommonBenchmarkIndexBatch(b, s, 2, 100)
}

func BenchmarkInMemIndexing4Workers100Batch(b *testing.B) {
	s, err := inmem.Open()
	if err != nil {
		b.Fatal(err)
	}
	defer s.Close()

	CommonBenchmarkIndexBatch(b, s, 4, 100)
}
