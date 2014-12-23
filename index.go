package main

import (
	"strconv"
	"time"

	"github.com/Sirupsen/logrus"
	"github.com/blevesearch/bleve"
)

// TODO: actually index things
//	https://github.com/piger/spock/blob/26c6044c4f239794532d2ec10499c645779c5d39/index.go
//	https://github.com/peterhellberg/tpb-search/blob/51d287cbd6fb61887b640a065e23789ae69aebc0/index.go

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

func (mgr *NoteManager) periodicIndex() {
	defer mgr.wg.Done()

	// TODO: should make this configurable?
	ticker := time.Tick(30 * time.Second)

	for {
		// TODO: handle errors here
		mgr.doIndex()

		// Either wait for the ticker, or finish everything.
		select {
		case <-ticker:
		case <-mgr.finish:
			return
		}
	}
}

func (mgr *NoteManager) doIndex() error {
	mgr.indexLock.Lock()
	defer mgr.indexLock.Unlock()

	startTime := time.Now()
	log.WithField("startTime", startTime).Debug("Starting index")

	// Run the indexing process
	batch := bleve.NewBatch()
	batchCount := 0
	count := 0

	// Find all notes.
	rows, err := (mgr.db.Model(Note{}).
		Select("id, title, text, created_at, updated_at").
		Rows())
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var curr Note
		rows.Scan(&curr.Id, &curr.Title, &curr.Text, &curr.CreatedAt, &curr.UpdatedAt)

		// TODO: render markdown in note text?

		batch.Index(strconv.FormatInt(curr.Id, 10), curr)
		batchCount++

		// We only index 1000 items at a time.
		if batchCount > 1000 {
			err := mgr.index.Batch(batch)
			if err != nil {
				log.WithFields(logrus.Fields{
					"error": err,
					"count": count,
				}).Error("Could not write batch")
				return err
			}

			batch = bleve.NewBatch()
			batchCount = 0
		}

		count++
	}

	// Flush the last batch
	if batchCount > 0 {
		err := mgr.index.Batch(batch)
		if err != nil {
			log.WithFields(logrus.Fields{
				"error": err,
				"count": count,
			}).Error("Could not write final batch")
			return err
		}
	}

	timeElapsed := time.Since(startTime)
	log.WithFields(logrus.Fields{
		"count":       count,
		"timeElapsed": timeElapsed,
	}).Debug("Finished indexing")

	return nil
}
