package handlers

import (
	"context"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5"

	"github.com/kamilkulczyk/rolepagegame/config"
	"github.com/kamilkulczyk/rolepagegame/models"
)

func InsertImage(tx pgx.Tx, imageURL string, objectType string, objectID int, purpose string) error {
	if imageURL == "" {
		return nil
	}

	var imageID int
	err := tx.QueryRow(context.Background(), "SELECT id FROM images WHERE url = $1", imageURL).Scan(&imageID)
	if err != nil { 
		err = tx.QueryRow(context.Background(),
			"INSERT INTO images (url) VALUES ($1) ON CONFLICT (url) DO NOTHING RETURNING id", imageURL,
		).Scan(&imageID)
		if err != nil {
			fmt.Println("ERROR: Failed to insert image:", err)
			return err
		}
	}

	var objectTypeID int
	err = tx.QueryRow(context.Background(), "SELECT id FROM object_types WHERE name = $1", objectType).Scan(&objectTypeID)
	if err != nil {
		fmt.Println("ERROR: Failed to get object_type_id:", err)
		return err
	}

	var purposeID int
	err = tx.QueryRow(context.Background(), "SELECT id FROM purposes WHERE name = $1", purpose).Scan(&purposeID)
	if err != nil {
		fmt.Println("ERROR: Failed to get purpose_id:", err)
		return err
	}

	_, err = tx.Exec(context.Background(),
		"INSERT INTO image_assignments (image_id, object_type_id, object_id, purpose_id) VALUES ($1, $2, $3, $4)",
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

	var character models.Character
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

	if err := InsertImage(tx, character.ProfileImage, "Character", characterID, "Profile"); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to assign profile image"})
	}
	if err := InsertImage(tx, character.BackgroundImage, "Character", characterID, "Background"); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to assign background image"})
	}

	if err := tx.Commit(context.Background()); err != nil {
		fmt.Println("ERROR: Failed to commit transaction:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Transaction commit failed"})
	}

	return c.JSON(fiber.Map{"message": "Character created successfully", "character_id": characterID})
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
			pi.url AS profile_image,
			bi.url AS background_image
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

	var characters []models.Character

	for rows.Next() {
		var character models.Character
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
			COALESCE(pi.url, '') AS profile_image,
			COALESCE(bi.url, '') AS background_image
		FROM characters c
		LEFT JOIN image_assignments ia_profile ON c.id = ia_profile.object_id 
			AND ia_profile.object_type_id = (SELECT id FROM object_types WHERE name = 'Character')
			AND ia_profile.purpose_id = (SELECT id FROM purposes WHERE name = 'Profile')
		LEFT JOIN images pi ON ia_profile.image_id = pi.id
		LEFT JOIN image_assignments ia_bg ON c.id = ia_bg.object_id 
			AND ia_bg.object_type_id = (SELECT id FROM object_types WHERE name = 'Character')
			AND ia_bg.purpose_id = (SELECT id FROM purposes WHERE name = 'Background')
		LEFT JOIN images bi ON ia_bg.image_id = bi.id
		WHERE c.id = $1
	`, characterID)

	var character models.Character

	if err := row.Scan(&character.ID, &character.Name, &character.Description, &character.ProfileImage, &character.BackgroundImage); err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "Character not found"})
		}
		fmt.Println("ERROR: Failed to scan character:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to scan character"})
	}

	imageRows, err := conn.Query(context.Background(), `
		SELECT i.url 
		FROM image_assignments ia
		JOIN images i ON ia.image_id = i.id
		WHERE ia.object_id = $1
			AND ia.object_type_id = (SELECT id FROM object_types WHERE name = 'Character')
			AND ia.purpose_id NOT IN (
				SELECT id FROM purposes WHERE name IN ('Profile', 'Background')
			)
	`, characterID)
	if err != nil {
		fmt.Println("ERROR: Failed to fetch additional images:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch images"})
	}
	defer imageRows.Close()

	for imageRows.Next() {
		var imageURL string
		if err := imageRows.Scan(&imageURL); err != nil {
			fmt.Println("ERROR: Failed to scan image:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to scan images"})
		}
		character.Images = append(character.Images, imageURL)
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
			COALESCE(pi.url, '') AS profile_image,
			COALESCE(bi.url, '') AS background_image
		FROM characters c
		LEFT JOIN image_assignments ia_profile ON c.id = ia_profile.object_id 
			AND ia_profile.object_type_id = (SELECT id FROM object_types WHERE name = 'Character')
			AND ia_profile.purpose_id = (SELECT id FROM purposes WHERE name = 'Profile')
		LEFT JOIN images pi ON ia_profile.image_id = pi.id
		LEFT JOIN image_assignments ia_bg ON c.id = ia_bg.object_id 
			AND ia_bg.object_type_id = (SELECT id FROM object_types WHERE name = 'Character')
			AND ia_bg.purpose_id = (SELECT id FROM purposes WHERE name = 'Background')
		LEFT JOIN images bi ON ia_bg.image_id = bi.id
		WHERE c.user_id = $1
	`, userID)
	if err != nil {
		fmt.Println("ERROR: Failed to fetch characters:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch characters"})
	}
	defer rows.Close()

	characters := make(map[int]*models.Character)

	for rows.Next() {
		var character models.Character

		if err := rows.Scan(&character.ID, &character.Name, &character.Description, &character.ProfileImage, &character.BackgroundImage); err != nil {
			fmt.Println("ERROR: Failed to scan character:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to scan character"})
		}

		character.Images = []string{}
		characters[character.ID] = &character
	}

	if err := rows.Err(); err != nil {
		fmt.Println("ERROR: Rows iteration failed:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to process characters"})
	}

	imageRows, err := conn.Query(context.Background(), `
		SELECT ia.object_id, i.url 
		FROM image_assignments ia
		JOIN images i ON ia.image_id = i.id
		WHERE ia.object_id IN (SELECT id FROM characters WHERE user_id = $1)
			AND ia.object_type_id = (SELECT id FROM object_types WHERE name = 'Character')
			AND ia.purpose_id NOT IN (
				SELECT id FROM purposes WHERE name IN ('Profile', 'Background')
			)
	`, userID)
	if err != nil {
		fmt.Println("ERROR: Failed to fetch additional images:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch images"})
	}
	defer imageRows.Close()

	for imageRows.Next() {
		var characterID int
		var imageURL string

		if err := imageRows.Scan(&characterID, &imageURL); err != nil {
			fmt.Println("ERROR: Failed to scan image:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to scan images"})
		}

		if character, exists := characters[characterID]; exists {
			character.Images = append(character.Images, imageURL)
		}
	}

	var characterList []models.Character
	for _, char := range characters {
		characterList = append(characterList, *char)
	}

	return c.JSON(characterList)
}
