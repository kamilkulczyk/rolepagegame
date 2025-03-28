package handlers

import (
	"strconv"
	"context"
	"fmt"

	"github.com/gofiber/fiber/v2"

	"github.com/kamilkulczyk/rolepagegame/config"
	"github.com/kamilkulczyk/rolepagegame/models"
)

func FetchMessages(c *fiber.Ctx) error {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		fmt.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	userID, ok := c.Locals("user_id").(int)
	if !ok {
		fmt.Println("ERROR: Failed to get user ID from context")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	recipientID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid recipient ID"})
	}

	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	offset, _ := strconv.Atoi(c.Query("offset", "0"))


	query := `
		SELECT id, sender_id, recipient_id, message, created_at
		FROM messages
		WHERE (sender_id = $1 AND recipient_id = $2)
		   OR (sender_id = $2 AND recipient_id = $1)
		ORDER BY created_at ASC
		LIMIT $3 OFFSET $4;
	`

	rows, err := conn.Query(context.Background(), query, userID, recipientID, limit, offset)
	if err != nil {
		fmt.Println("Error fetching messages:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Error fetching messages"})
	}
	defer rows.Close()

	var messages []models.Message

	for rows.Next() {
		var msg models.Message
		if err := rows.Scan(&msg.ID, &msg.SenderID, &msg.RecipientID, &msg.Message, &msg.CreatedAt); err != nil {
			fmt.Println("Error scanning row:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Error scanning messages"})
		}
		messages = append(messages, msg)
	}

	return c.JSON(messages)
}