package main

import (
	"encoding/json"
	"strings"

	"gopkg.in/igm/sockjs-go.v2/sockjs"
)

func writeMessage(conn sockjs.Session, ty string, data interface{}) error {
	marshalled, err := json.Marshal(data)
	if err != nil {
		return err
	}

	msg := ty + "|" + string(marshalled)
	return conn.Send(msg)
}

func parseMessage(msg string) (ty string, data []byte) {
	// Parse the message
	split := strings.SplitN(msg, "|", 2)
	if len(split) != 2 {
		return
	}

	ty = split[0]
	data = []byte(split[1])
	return
}
