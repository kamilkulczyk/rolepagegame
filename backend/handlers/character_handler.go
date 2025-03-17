package handlers

import (
	"context"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5"

	"github.com/kamilkulczyk/rolepagegame/config"
	"github.com/kamilkulczyk/rolepagegame/models"
)

func InsertImage(tx pgx.Tx, imageURL string, objectTypeID int, objectID int, purposeID int) error {
	if imageURL == "" {
		return nil
	}

	var imageID int
	err := tx.QueryRow(context.Background(), "SELECT id FROM images WHERE url = $1", imageURL).Scan(&imageID)

	if err != nil {
		err = tx.QueryRow(context.Background(),
			"INSERT INTO images (url) VALUES ($1) ON CONFLICT (url) DO UPDATE SET url = EXCLUDED.url RETURNING id",
			imageURL,
		).Scan(&imageID)

		if err != nil {
			fmt.Println("ERROR: Failed to insert or retrieve image ID:", err)
			return err
		}
	}

	_, err = tx.Exec(context.Background(),
		"INSERT INTO image_assignments (image_id, object_type_id, object_id, purpose_id) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
		imageID, objectTypeID, objectID, purposeID)

	if err != nil {
		fmt.Println("ERROR: Failed to assign image:", err)
		return err
	}

	return nil
}


func CreateCharacter(c *fiber.Ctx) error {
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

	var character models.CharacterDetails
	if err := c.BodyParser(&character); err != nil {
		fmt.Println("ERROR: Invalid request body:", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	tx, err := db.Begin(context.Background())
	if err != nil {
		fmt.Println("ERROR: Failed to start transaction:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Transaction error"})
	}
	defer tx.Rollback(context.Background())

	var characterID int
	err = tx.QueryRow(context.Background(),
		"INSERT INTO characters (name, description, user_id) VALUES ($1, $2, $3) RETURNING id",
		character.Name, character.Description, userID,
	).Scan(&characterID)

	if err != nil {
		fmt.Println("ERROR: Failed to insert character:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to insert character"})
	}

	if err := InsertImage(tx, character.ProfileImage, config.ObjectTypeIDs["Character"], characterID, config.PurposeIDs["Profile"]); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to assign profile image"})
	}

	if err := tx.Commit(context.Background()); err != nil {
		fmt.Println("ERROR: Failed to commit transaction:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Transaction commit failed"})
	}

	return c.JSON(fiber.Map{"message": "Character created successfully", "character_id": characterID})
}

func CreateRpgData(c *fiber.Ctx) error {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		fmt.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	characterID := c.Params("id")
	if err != nil {
		fmt.Println("ERROR: Invalid character ID:", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid character ID"})
	}

	var rpgData models.RpgData
	if err := c.BodyParser(&rpgData); err != nil {
		fmt.Println("ERROR: Invalid RPG data:", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid RPG data"})
	}

	_, err = conn.Exec(context.Background(),
		"INSERT INTO rpg_data (character_id, race, class, lore, stats) VALUES ($1, $2, $3, $4, $5)",
		characterID, rpgData.Race, rpgData.Class, rpgData.Lore, rpgData.Stats)

	if err != nil {
		fmt.Println("ERROR: Failed to insert RPG data:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to insert RPG data"})
	}

	return c.JSON(fiber.Map{"message": "RPG Data stored successfully"})
}

func GetCharacters(c *fiber.Ctx) error {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		fmt.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	rows, err := conn.Query(context.Background(), `
		SELECT 
			c.id, c.name, c.description,
			pi.url AS profile_image
		FROM characters c
		LEFT JOIN image_assignments ia_profile 
			ON c.id = ia_profile.object_id 
			AND ia_profile.object_type_id = $1
			AND ia_profile.purpose_id = $2
		LEFT JOIN images pi ON ia_profile.image_id = pi.id
	`, config.ObjectTypeIDs["Character"], config.PurposeIDs["Profile"])

	if err != nil {
		fmt.Println("ERROR: Failed to fetch characters:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch characters"})
	}
	defer rows.Close()

	var characters []models.CharacterDetails

	for rows.Next() {
		var character models.CharacterDetails
		var profileImage *string

		if err := rows.Scan(&character.ID, &character.Name, &character.Description, &profileImage); err != nil {
			fmt.Println("ERROR: Failed to scan character:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to scan character"})
		}

		if profileImage != nil {
			character.ProfileImage = *profileImage
		}

		characters = append(characters, character)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("ERROR: Rows iteration failed:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to process characters"})
	}

	return c.JSON(characters)
}


func GetCharacterByID(c *fiber.Ctx) error {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		fmt.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	characterID := c.Params("id")

	row := conn.QueryRow(context.Background(), `
		SELECT c.id, c.name, c.description,
			COALESCE(pi.url, '') AS profile_image
		FROM characters c
		LEFT JOIN image_assignments ia_profile ON c.id = ia_profile.object_id 
			AND ia_profile.object_type_id = $2
			AND ia_profile.purpose_id = $3
		LEFT JOIN images pi ON ia_profile.image_id = pi.id
		WHERE c.id = $1
	`, characterID, config.ObjectTypeIDs["Character"], config.PurposeIDs["Profile"])

	var character models.CharacterDetails

	if err := row.Scan(&character.ID, &character.Name, &character.Description, &character.ProfileImage); err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "Character not found"})
		}
		fmt.Println("ERROR: Failed to scan character:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to scan character"})
	}

	return c.JSON(character)
}


func GetCharactersByUserID(c *fiber.Ctx) error {
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
		SELECT c.id, c.name, c.description,
			COALESCE(pi.url, '') AS profile_image
		FROM characters c
		LEFT JOIN image_assignments ia_profile 
			ON c.id = ia_profile.object_id 
			AND ia_profile.object_type_id = $2
			AND ia_profile.purpose_id = $3
		LEFT JOIN images pi ON ia_profile.image_id = pi.id
		WHERE c.user_id = $1
	`, userID, config.ObjectTypeIDs["Character"], config.PurposeIDs["Profile"])

	if err != nil {
		fmt.Println("ERROR: Failed to fetch characters:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch characters"})
	}
	defer rows.Close()

	characters := make(map[int]*models.CharacterDetails)

	for rows.Next() {
		var character models.CharacterDetails

		if err := rows.Scan(&character.ID, &character.Name, &character.Description, &character.ProfileImage); err != nil {
			fmt.Println("ERROR: Failed to scan character:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to scan character"})
		}

		characters[character.ID] = &character
	}

	if err := rows.Err(); err != nil {
		fmt.Println("ERROR: Rows iteration failed:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to process characters"})
	}

	var characterList []models.CharacterDetails
	for _, char := range characters {
		characterList = append(characterList, *char)
	}

	return c.JSON(characterList)
}

