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

func GetUsernameByID(c *fiber.Ctx) error {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		fmt.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	userID := c.Params("id")

	row := conn.QueryRow(context.Background(), "SELECT username FROM users WHERE id = $1", userID)
	if err != nil {
		fmt.Println("ERROR: Failed to fetch username:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch username"})
	}
	defer rows.Close()

	var users []User

	if err := row.Scan(&user.Username); err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}
		fmt.Println("ERROR: Failed to scan user:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Error processing users"})
	}

	return c.JSON(users)
}

func GetItemByID(c *fiber.Ctx) error {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		fmt.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	itemID := c.Params("id")

	row := conn.QueryRow(context.Background(), `
		SELECT i.id, i.name, i.description, i.user_id,
			COALESCE(pi.url, '') AS profile_image
		FROM items i
		LEFT JOIN image_assignments ia_profile ON c.id = ia_profile.object_id 
			AND ia_profile.object_type_id = $2
			AND ia_profile.purpose_id = $3
		LEFT JOIN images pi ON ia_profile.image_id = pi.id
		WHERE i.id = $1
	`, itemID, config.ObjectTypeIDs["Item"], config.PurposeIDs["Profile"])

	var item models.ItemDetails

	if err := row.Scan(&item.ID, &item.Name, &item.Description, &item.UserID, &item.ProfileImage); err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "Item not found"})
		}
		fmt.Println("ERROR: Failed to scan item:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to scan item"})
	}

	return c.JSON(item)
}