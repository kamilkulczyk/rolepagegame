package websocket

import (
	"sync"

	"github.com/gofiber/contrib/websocket"
)

var clients = make(map[string]*websocket.Conn)
var mutex = sync.Mutex()

func AddClient(userID string, conn *websocket.Conn) {
	mutex.Lock()
	clients[userID] = conn
	mutex.Unlock()
}

func RemoveClient(userID string) {
	mutex.Lock()
	delete(clients, userID)
	mutex.Unlock()
}

func SendMessage(userID string, message string) {
	mutex.Lock()
	conn, exists := clients[userID]
	mutex.Unlock()
	if exists {
		conn.WriteMessage(websocket.TextMessage, []byte(message))
	}
}