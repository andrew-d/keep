package main

import (
	"fmt"
	"mime"
	"net/http"
	"path"
	"time"

	"github.com/Sirupsen/logrus"
	flag "github.com/ogier/pflag"
	"github.com/stretchr/graceful"
	"github.com/zenazn/goji/web"

	// Imported for side effects
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
)

type Note struct {
	Id        int64     `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Title     string    `json:"title"`
	Text      string    `json:"text"`
}

var (
	flagListenHost string
	flagListenPort uint16
	flagQuiet      bool
	flagVerbose    bool
	flagDbType     string
	flagDbConn     string

	log *logrus.Logger

	httpMethods = []string{"GET", "POST", "PUT", "DELETE", "HEAD", "PATCH", "OPTIONS"}
)

func init() {
	flag.Uint16VarP(&flagListenPort, "port", "p", 3001, "port to listen on")
	flag.StringVarP(&flagListenHost, "host", "h", "", "host to listen on")
	flag.BoolVarP(&flagQuiet, "quiet", "q", false, "be more quiet")
	flag.BoolVarP(&flagVerbose, "verbose", "v", false, "be more verbose")
	flag.StringVar(&flagDbType, "dbtype", "sqlite3", "type of database")
	flag.StringVar(&flagDbConn, "dbconn", ":memory:", "database connection string")

	log = logrus.New()
	log.Level = logrus.InfoLevel
}

func main() {
	flag.Parse()
	if flagQuiet && flagVerbose {
		log.Fatalf("Cannot be both quiet and verbose")
	} else if flagQuiet {
		log.Level = logrus.WarnLevel
	} else if flagVerbose {
		log.Level = logrus.DebugLevel
	}

	mgr, err := NewNoteManager(flagDbType, flagDbConn)
	if err != nil {
		log.WithField("error", err).Fatal("Could not create manager")
	}

	// Our mux
	router := web.New()
	router.Get("/", Index)

	// Dispatch to our manager's SockJS implementation
	router.Handle("/api/sockjs", mgr.Handler())
	router.Handle("/api/sockjs/*", mgr.Handler())

	// This custom NotFound handler will try serving a static asset with the
	// given name.
	router.NotFound(http.HandlerFunc(NotFound))

	addr := fmt.Sprintf("%s:%d", flagListenHost, flagListenPort)
	log.Infof("Listening on %s", addr)
	graceful.Run(addr, 10*time.Second, router)
}

func Index(w http.ResponseWriter, r *http.Request) {
	// Send our index page
	sendAsset(w, "index.html")
}

func NotFound(w http.ResponseWriter, r *http.Request) {
	p := r.URL.Path
	if len(p) > 0 && p[0] == '/' {
		p = p[1:]
	}
	sendAsset(w, p)
}

func sendAsset(w http.ResponseWriter, assetPath string) {
	// Try and find an asset with this name.
	asset, err := Asset(assetPath)
	if err != nil {
		http.Error(w, "404 page not found", http.StatusNotFound)
		return
	}

	// Guess the MIME type of this asset and set it
	ty := mime.TypeByExtension(path.Ext(assetPath))
	if len(ty) > 0 {
		w.Header().Set("Content-Type", ty)
	}

	// Send the asset
	n, err := w.Write(asset)
	if err != nil {
		log.WithFields(logrus.Fields{
			"error": err,
			"n":     n,
			"asset": assetPath,
		}).Error("Error sending asset")
		return
	}
}
