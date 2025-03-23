package handlers

import (
	"context"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5"

	"github.com/kamilkulczyk/rolepagegame/config"
	"github.com/kamilkulczyk/rolepagegame/models"
)

func CreateItem(c *fiber.Ctx) error {
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

	var item models.ItemDetails
	if err := c.BodyParser(&item); err != nil {
		fmt.Println("ERROR: Invalid request body:", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	tx, err := db.Begin(context.Background())
	if err != nil {
		fmt.Println("ERROR: Failed to start transaction:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Transaction error"})
	}
	defer tx.Rollback(context.Background())

	err = tx.QueryRow(context.Background(),
		"INSERT INTO items (name, description, user_id) VALUES ($1, $2, $3) RETURNING id",
		item.Name, item.Description, userID,
	).Scan(&item.ID)

	if err != nil {
		fmt.Println("ERROR: Failed to insert item:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to insert item"})
	}

	if err := InsertImage(tx, item.ProfileImage, config.ObjectTypeIDs["Item"], item.ID, config.PurposeIDs["Profile"]); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to assign profile image"})
	}

	_, err = tx.Exec(context.Background(),
		"INSERT INTO item_ownership (item_id, character_id, equipment_slot) VALUES ($1, NULL, 1)",
		item.ID,
	)
	if err != nil {
		fmt.Println("ERROR: Failed to insert item ownership:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to assign default ownership"})
	}

	if err := tx.Commit(context.Background()); err != nil {
		fmt.Println("ERROR: Failed to commit transaction:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Transaction commit failed"})
	}

	return c.JSON(fiber.Map{"message": "Item created successfully", "item_id": item.ID})
}

func CreateItemRpgData(c *fiber.Ctx) error {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		fmt.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	itemID := c.Params("id")
	if err != nil {
		fmt.Println("ERROR: Invalid item ID:", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid item ID"})
	}

	var itemRpgData models.ItemRpgData
	if err := c.BodyParser(&itemRpgData); err != nil {
		fmt.Println("ERROR: Invalid Item RPG data:", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid Item RPG data"})
	}

	_, err = conn.Exec(context.Background(),
		"INSERT INTO items_rpg_data (item_id, type, lore, stats) VALUES ($1, $2, $3, $4)",
		itemID, itemRpgData.Type, itemRpgData.Lore, itemRpgData.Stats)

	if err != nil {
		fmt.Println("ERROR: Failed to insert Item RPG data:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to insert Item RPG data"})
	}

	return c.JSON(fiber.Map{"message": "Item RPG Data stored successfully"})
}

func GetRpgDataByItemID(c *fiber.Ctx) error {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		fmt.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	itemID := c.Params("id")

	row := conn.QueryRow(context.Background(), `
		SELECT id, item_id, type, lore, stats
		FROM items_rpg_data
		WHERE item_id = $1
	`, itemID)

	var itemRpgData models.ItemRpgData

	if err := row.Scan(
			&itemRpgData.ID,
			&itemRpgData.ItemID,
			&itemRpgData.Type,
			&itemRpgData.Lore,
			&itemRpgData.Stats); err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "Item RPG data not found"})
		}
		fmt.Println("ERROR: Failed to scan Item RPG data:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to scan Item RPG data"})
	}

	return c.JSON(itemRpgData)
}

func GetItemsByUserID(c *fiber.Ctx) error {
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

	rows, err := conn.Query(context.Background(), `
		SELECT i.id, i.name, i.description, i.user_id,
			COALESCE(pi.url, '') AS profile_image
		FROM items i
		LEFT JOIN image_assignments ia_profile 
			ON i.id = ia_profile.object_id 
			AND ia_profile.object_type_id = $2
			AND ia_profile.purpose_id = $3
		LEFT JOIN images pi ON ia_profile.image_id = pi.id
		WHERE i.user_id = $1
	`, userID, config.ObjectTypeIDs["Item"], config.PurposeIDs["Profile"])

	if err != nil {
		fmt.Println("ERROR: Failed to fetch items:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch items"})
	}
	defer rows.Close()

	items := make(map[int]*models.ItemDetails)

	for rows.Next() {
		var item models.ItemDetails

		if err := rows.Scan(&item.ID, &item.Name, &item.Description, &item.UserID, &item.ProfileImage); err != nil {
			fmt.Println("ERROR: Failed to scan item:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to scan item"})
		}

		items[item.ID] = &item
	}

	if err := rows.Err(); err != nil {
		fmt.Println("ERROR: Rows iteration failed:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to process items"})
	}

	var itemList []models.ItemDetails
	for _, char := range items {
		itemList = append(itemList, *char)
	}

	return c.JSON(itemList)
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

func TransferItem(c *fiber.Ctx) error {
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

    itemID := c.Params("id")

    var transferData struct {
        ReceiverID int `json:"receiver_id"`
    }

    if err := c.BodyParser(&transferData); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    result, err := conn.Exec(context.Background(), `
        WITH updated AS (
            UPDATE items
            SET user_id = $3
            WHERE id = $2 AND user_id = $1
            RETURNING id
        )
        UPDATE item_ownership
        SET character_id = NULL, equipment_slot = 1
        WHERE item_id = (SELECT id FROM updated)
    `, userID, itemID, transferData.ReceiverID)

    if err != nil {
        fmt.Println("ERROR: Failed to transfer item:", err)
        return c.Status(500).JSON(fiber.Map{"error": "Failed to transfer item"})
    }

    if result.RowsAffected() == 0 {
        return c.Status(403).JSON(fiber.Map{"error": "You do not own this item or item not found"})
    }

    return c.JSON(fiber.Map{"message": "Item transferred successfully"})
}
