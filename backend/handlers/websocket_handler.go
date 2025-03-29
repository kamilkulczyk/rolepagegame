package handlers

import (
	"encoding/json"
	"sync"
	"fmt"
	"strconv"

	"github.com/gofiber/contrib/websocket"

	// "github.com/kamilkulczyk/rolepagegame/models"
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
		byteMessage, err := json.Marshal(message)
		if err != nil {
			fmt.Println("❌ Error marshalling message:", err)
			return
		}

		err = conn.WriteMessage(websocket.TextMessage, byteMessage)
		if err != nil {
			fmt.Println("❌ Error sending message:", err)
		}
	}
}

func HandleConnection(c *websocket.Conn) {
	userIDStr := c.Query("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		fmt.Println("❌ ERROR: Invalid user_id")
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

		var chatMessage ChatMessage
		err = json.Unmarshal(msg, &chatMessage)
		if err != nil {
			fmt.Println("❌ Error: Invalid JSON format:", err)
			continue
		}

		// err = database.StoreMessage(chatMessage.SenderID, chatMessage.RecipientID, chatMessage.Message)
		// if err != nil {
		// 	fmt.Println("❌ Error storing message in database:", err)
		// }

		SendMessage(chatMessage.RecipientID, chatMessage)
	}
}