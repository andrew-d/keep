package main

import (
	"github.com/blevesearch/bleve"
)

// TODO: actually index things
// https://github.com/piger/spock/blob/26c6044c4f239794532d2ec10499c645779c5d39/index.go

func buildIndexMapping() *bleve.IndexMapping {
	stdTextMapping := bleve.NewTextFieldMapping()
	stdTextMapping.Analyzer = "standard"

	dtMapping := bleve.NewDateTimeFieldMapping()

	noteMapping := bleve.NewDocumentMapping()
	noteMapping.AddSubDocumentMapping("id", bleve.NewDocumentDisabledMapping())
	noteMapping.AddFieldMappingsAt("title", stdTextMapping)
	noteMapping.AddFieldMappingsAt("text", stdTextMapping)
	noteMapping.AddFieldMappingsAt("createdat", dtMapping)
	noteMapping.AddFieldMappingsAt("updatedat", dtMapping)

	mapping := bleve.NewIndexMapping()
	mapping.DefaultAnalyzer = "standard"
	mapping.AddDocumentMapping("note", noteMapping)

	return mapping
}
