package websocket

import (
	"sync"

	"github.com/gofiber/contrib/websocket"
)

type SafeClients struct {
	mu      sync.Mutex
	clients map[string]*websocket.Conn
}

var safeClients = SafeClients{
	clients: make(map[string]*websocket.Conn),
}

func AddClient(userID string, conn *websocket.Conn) {
	safeClients.mu.Lock()
	safeClients.clients[userID] = conn
	safeClients.mu.Unlock()
}

func RemoveClient(userID string) {
	safeClients.mu.Lock()
	delete(safeClients.clients, userID)
	safeClients.mu.Unlock()
}

func SendMessage(userID string, message string) {
	safeClients.mu.Lock()
	conn, exists := safeClients.clients[userID]
	safeClients.mu.Unlock()
	if exists {
		conn.WriteMessage(websocket.TextMessage, []byte(message))
	}
}