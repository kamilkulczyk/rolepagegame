package handlers

import (
	"context"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/kamilkulczyk/rolepagegame/config"
)

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
}

func GetUsers(c *fiber.Ctx) error {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		fmt.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	rows, err := conn.Query(context.Background(), "SELECT id, username FROM users")
	if err != nil {
		fmt.Println("ERROR: Failed to fetch users:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch users"})
	}
	defer rows.Close()

	var users []User

	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Username); err != nil {
			fmt.Println("ERROR: Failed to scan user:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Error processing users"})
		}
		users = append(users, user)
	}

	return c.JSON(users)
}
