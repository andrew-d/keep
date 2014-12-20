package main

import (
	"github.com/blevesearch/bleve"
)

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
