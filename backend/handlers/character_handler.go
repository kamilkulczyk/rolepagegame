package handlers

import (
	"context"
	"fmt"
	"strconv"

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

	err = tx.QueryRow(context.Background(),
		"INSERT INTO characters (name, description, user_id) VALUES ($1, $2, $3) RETURNING id",
		character.Name, character.Description, userID,
	).Scan(&character.ID)

	if err != nil {
		fmt.Println("ERROR: Failed to insert character:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to insert character"})
	}

	if err := InsertImage(tx, character.ProfileImage, config.ObjectTypeIDs["Character"], character.ID, config.PurposeIDs["Profile"]); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to assign profile image"})
	}

	if err := tx.Commit(context.Background()); err != nil {
		fmt.Println("ERROR: Failed to commit transaction:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Transaction commit failed"})
	}

	return c.JSON(fiber.Map{"message": "Character created successfully", "character_id": character.ID})
}

func UpdateCharacter(c *fiber.Ctx) error {
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

	characterIDStr := c.Params("id") // This is a string
	if characterIDStr == "" {
		fmt.Println("ERROR: Character ID not provided")
		return c.Status(400).JSON(fiber.Map{"error": "Character ID is required"})
	}
	characterID, err := strconv.Atoi(characterIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid character ID"})
	}

	var character models.CharacterDetails
	if err := c.BodyParser(&character); err != nil {
		fmt.Println("ERROR: Invalid request body:", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var ownerID int
	err = conn.QueryRow(context.Background(), "SELECT user_id FROM characters WHERE id = $1", characterID).Scan(&ownerID)
	if err != nil {
		fmt.Println("ERROR: Character not found or DB error:", err)
		return c.Status(404).JSON(fiber.Map{"error": "Character not found"})
	}

	if ownerID != userID {
		fmt.Println("ERROR: User does not own this character")
		return c.Status(403).JSON(fiber.Map{"error": "You are not allowed to edit this character"})
	}

	tx, err := db.Begin(context.Background())
	if err != nil {
		fmt.Println("ERROR: Failed to start transaction:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Transaction error"})
	}
	defer tx.Rollback(context.Background())

	_, err = tx.Exec(context.Background(),
		"UPDATE characters SET name = $1, description = $2 WHERE id = $3",
		character.Name, character.Description, characterID)

	if err != nil {
		fmt.Println("ERROR: Failed to update character:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update character"})
	}

	if err := InsertImage(tx, character.ProfileImage, config.ObjectTypeIDs["Character"], characterID, config.PurposeIDs["Profile"]); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update profile image"})
	}

	if err := tx.Commit(context.Background()); err != nil {
		fmt.Println("ERROR: Failed to commit transaction:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Transaction commit failed"})
	}

	return c.JSON(fiber.Map{"message": "Character updated successfully"})
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
		characterID, rpgData.Race, rpgData.CharacterClass, rpgData.Lore, rpgData.Stats)

	if err != nil {
		fmt.Println("ERROR: Failed to insert RPG data:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to insert RPG data"})
	}

	return c.JSON(fiber.Map{"message": "RPG Data stored successfully"})
}

func UpdateRpgData(c *fiber.Ctx) error {
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

	characterID := c.Params("id")
	if characterID == "" {
		fmt.Println("ERROR: Character ID not provided")
		return c.Status(400).JSON(fiber.Map{"error": "Character ID is required"})
	}

	var ownerID int
	err = conn.QueryRow(context.Background(), "SELECT user_id FROM characters WHERE id = $1", characterID).Scan(&ownerID)
	if err != nil {
		fmt.Println("ERROR: Character not found or DB error:", err)
		return c.Status(404).JSON(fiber.Map{"error": "Character not found"})
	}

	if ownerID != userID {
		fmt.Println("ERROR: User does not own this character")
		return c.Status(403).JSON(fiber.Map{"error": "You are not allowed to edit this character"})
	}

	var rpgData models.RpgData
	if err := c.BodyParser(&rpgData); err != nil {
		fmt.Println("ERROR: Invalid RPG data:", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid RPG data"})
	}

	_, err = conn.Exec(context.Background(),
		`INSERT INTO rpg_data (character_id, race, class, lore, stats) 
		 VALUES ($1, $2, $3, $4, $5) 
		 ON CONFLICT (character_id) 
		 DO UPDATE SET race = $2, class = $3, lore = $4, stats = $5`,
		characterID, rpgData.Race, rpgData.CharacterClass, rpgData.Lore, rpgData.Stats)

	if err != nil {
		fmt.Println("ERROR: Failed to update RPG data:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update RPG data"})
	}

	return c.JSON(fiber.Map{"message": "RPG Data updated successfully"})
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
			c.id, c.name, c.description, c.user_id,
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

		if err := rows.Scan(&character.ID, &character.Name, &character.Description, &character.UserID, &profileImage); err != nil {
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
		SELECT c.id, c.name, c.description, c.user_id,
			COALESCE(pi.url, '') AS profile_image
		FROM characters c
		LEFT JOIN image_assignments ia_profile ON c.id = ia_profile.object_id 
			AND ia_profile.object_type_id = $2
			AND ia_profile.purpose_id = $3
		LEFT JOIN images pi ON ia_profile.image_id = pi.id
		WHERE c.id = $1
	`, characterID, config.ObjectTypeIDs["Character"], config.PurposeIDs["Profile"])

	var character models.CharacterDetails

	if err := row.Scan(&character.ID, &character.Name, &character.Description, &character.UserID, &character.ProfileImage); err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "Character not found"})
		}
		fmt.Println("ERROR: Failed to scan character:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to scan character"})
	}

	return c.JSON(character)
}

func GetRpgDataByCharacterID(c *fiber.Ctx) error {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		fmt.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	characterID := c.Params("id")

	row := conn.QueryRow(context.Background(), `
		SELECT id, character_id, class, race, lore, stats
		FROM rpg_data
		WHERE character_id = $1
	`, characterID)

	var rpgData models.RpgData

	if err := row.Scan(&rpgData.ID, &rpgData.CharacterID, &rpgData.CharacterClass, &rpgData.Race, &rpgData.Lore, &rpgData.Stats); err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "RPG data not found"})
		}
		fmt.Println("ERROR: Failed to scan RPG data:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to scan RPG data"})
	}

	return c.JSON(rpgData)
}

func GetCharactersByUserID(c *fiber.Ctx) error {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		fmt.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	userIDParam := c.Params("id")
	userID, err := strconv.Atoi(userIDParam)
	if err != nil {
		fmt.Println("ERROR: Invalid user ID:", userIDParam)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	rows, err := conn.Query(context.Background(), `
		SELECT c.id, c.name, c.description, c.user_id,
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

		if err := rows.Scan(&character.ID, &character.Name, &character.Description, &character.UserID, &character.ProfileImage); err != nil {
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

