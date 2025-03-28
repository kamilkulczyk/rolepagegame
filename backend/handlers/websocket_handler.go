package handlers

import (
	"encoding/json"
	"sync"
	"fmt"
	"strconv"

	"github.com/gofiber/contrib/websocket"

	"github.com/kamilkulczyk/rolepagegame/models"
)

type SafeClients struct {
	mu      sync.Mutex
	clients map[int]*websocket.Conn
}

var safeClients = SafeClients{
	clients: make(map[int]*websocket.Conn),
}

func AddClient(userID int, conn *websocket.Conn) {
	safeClients.mu.Lock()
	safeClients.clients[userID] = conn
	safeClients.mu.Unlock()
}

func RemoveClient(userID int) {
	safeClients.mu.Lock()
	delete(safeClients.clients, userID)
	safeClients.mu.Unlock()
}

func SendMessage(recipientID int, message string) {
	safeClients.mu.Lock()
	conn, exists := safeClients.clients[recipientID]
	safeClients.mu.Unlock()
	if exists {
		err := conn.WriteMessage(websocket.TextMessage, []byte(message))
		if err != nil {
			fmt.Println("Error sending message:", err)
		}
	}
}

func HandleConnection(c *websocket.Conn) {
	userID, ok := c.Locals("user_id").(int)
	if !ok {
		fmt.Println("❌ ERROR: Failed to get user ID from JWT")
		c.Close()
		return
	}

	recipientIDStr := c.Query("recipient_id")
	recipientID, err := strconv.Atoi(recipientIDStr)
	if err != nil {
		fmt.Println("❌ ERROR: Invalid recipient_id")
		c.Close()
		return
	}

	AddClient(userID, c)
	defer RemoveClient(userID)

	for {
		_, msg, err := c.ReadMessage()
		if err != nil {
			fmt.Println("❌ WebSocket read error:", err)
			break
		}

		var message models.Message
		err = json.Unmarshal(msg, &message)
		if err != nil {
			fmt.Println("❌ Error: Invalid JSON format")
			continue
		}

		SendMessage(message.RecipientID, message.Message)
	}
}