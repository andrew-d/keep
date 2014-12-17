package main

import (
	"fmt"
	"mime"
	"net/http"
	"path"
	"time"

	"github.com/Sirupsen/logrus"
	"github.com/googollee/go-socket.io"
	"github.com/jinzhu/gorm"
	"github.com/julienschmidt/httprouter"
	flag "github.com/ogier/pflag"
	"github.com/stretchr/graceful"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
)

var (
	flagListenHost string
	flagListenPort uint16
	flagQuiet      bool
	flagVerbose    bool
	flagDbType     string
	flagDbConn     string

	log *logrus.Logger

	db         gorm.DB
	sockServer *socketio.Server

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
	var err error

	flag.Parse()

	if flagQuiet && flagVerbose {
		log.Fatalf("Cannot be both quiet and verbose")
	} else if flagQuiet {
		log.Level = logrus.WarnLevel
	} else if flagVerbose {
		log.Level = logrus.DebugLevel
	}

	log.WithFields(logrus.Fields{
		"dbtype": flagDbType,
		"dbconn": flagDbConn,
	}).Debug("Opening database")
	db, err = gorm.Open(flagDbType, flagDbConn)
	if err != nil {
		log.WithField("error", err).Fatal("Could not open database")
	}
	defer db.Close()

	// "nil" means we use the default transports
	sockServer, err = socketio.NewServer(nil)
	if err != nil {
		log.WithField("error", err).Fatal("Could not create Socket.IO server")
	}

	// Set up socket.io server
	sockServer.On("connection", socketConnected)
	sockServer.On("error", socketError)

	// Our mux
	router := httprouter.New()
	router.GET("/", Index)

	// This custom NotFound handler will try serving a static asset with the
	// given name.
	router.NotFound = http.HandlerFunc(NotFound)

	// Register Socket.IO handler
	for _, meth := range httpMethods {
		router.Handler(meth, "/socket.io/", sockServer)
	}

	addr := fmt.Sprintf("%s:%d", flagListenHost, flagListenPort)
	log.Infof("Listening on %s", addr)
	graceful.Run(addr, 10*time.Second, router)
}

func socketConnected(so socketio.Socket) {
	log.WithFields(logrus.Fields{
		"id": so.Id(),
	}).Info("Socket connected")

	// Join this socket to our main room.
	so.Join("keep")

	so.On("disconnection", func() {
		log.WithFields(logrus.Fields{
			"id": so.Id(),
		}).Info("Socket disconnected")
	})

	// TODO: broadcast existing posts
	so.BroadcastTo("keep", "new_posts", []string{
		"foo",
		"bar",
	})

	so.On("new_posts", func(d []map[string]interface{}) {
		fmt.Printf("%+v\n", d)
	})
}

func socketError(so socketio.Socket, err error) {
	log.WithFields(logrus.Fields{
		"error": err,
		"id":    so.Id(),
	}).Error("Socket.IO error")
}

func Index(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
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
