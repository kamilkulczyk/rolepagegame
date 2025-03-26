package websocket

import (
	"fmt"
	"log"

	"github.com/gofiber/contrib/websocket"
)

func HandleConnection(c *websocket.Conn) {
	userID := c.Query("userID")
	if userID == "" {
		log.Println("❌ No user ID provided")
		c.Close()
		return
	}

	AddClient(userID, c)

	defer func() {
		RemoveClient(userID)
		c.Close()
	}()

	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			fmt.Println("❌ Error reading message:", err)
			break
		}
		fmt.Println("📩 Received from", userID, ":", string(message)) //only for now
	}
}