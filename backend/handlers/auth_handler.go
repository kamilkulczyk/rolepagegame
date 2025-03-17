package handlers

import (
  "context"
  "log"
  "os"
  "time"
  "fmt"

  "github.com/gofiber/fiber/v2"
  "github.com/golang-jwt/jwt/v5"
  "golang.org/x/crypto/bcrypt"
  "github.com/joho/godotenv"

  "github.com/kamilkulczyk/rolepagegame/config"
  "github.com/kamilkulczyk/rolepagegame/models"
)

var (
  secretKey          string
  failedAttempts     map[string]int
  recaptchaSecretKey string
  maxFailedAttempts  int
)

func init() {
  // Load environment variables from .env file
  _ = godotenv.Load() // Ignore error in case it's running on a cloud platform

  secretKey = os.Getenv("JWT_SECRET")
  if secretKey == "" {
    log.Fatal("❌ JWT_SECRET is not set in environment variables")
  }
}

func Register(c *fiber.Ctx) error {
  db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		fmt.Println("ERROR: Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

  var user models.User
  if err := c.BodyParser(&user); err != nil {
    return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
  }

  passwordBytes := make([]byte, len(user.Password))
  for i, v := range user.Password {
      passwordBytes[i] = byte(v)
  }

  defer func() {
      for i := range passwordBytes {
          passwordBytes[i] = 0
      }
      for i := range user.Password {
          user.Password[i] = 0
      }
  }()

  hashedPassword, err := bcrypt.GenerateFromPassword(passwordBytes, bcrypt.DefaultCost)
  if err != nil {
    return c.Status(500).JSON(fiber.Map{"error": "Failed to hash password"})
  }

  createdAt := time.Now()

  _, err = conn.Exec(context.Background(),
    "INSERT INTO users (username, email, password, created_at) VALUES ($1, $2, $3, $4)",
    user.Username, user.Email, string(hashedPassword), createdAt)

  if err != nil {
    log.Println("Insert failed:", err)
    return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
  }

  return c.JSON(fiber.Map{"message": "User registered successfully"})
}

func Login(c *fiber.Ctx) error {
    db := config.GetDB()
    conn, err := db.Acquire(context.Background())
    if err != nil {
      fmt.Println("ERROR: Failed to acquire DB connection:", err)
      return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
    }
    defer conn.Release()

    var req struct {
        Email    string `json:"email"`
        Password []int `json:"password"`
    }

    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    var user models.User
    var storedPassword string

    if err := conn.QueryRow(context.Background(),
        "SELECT id, username, email, password, is_admin FROM users WHERE email ILIKE $1", req.Email).
        Scan(&user.ID, &user.Username, &user.Email, &storedPassword, &user.IsAdmin); err != nil {
          return c.Status(401).JSON(fiber.Map{
            "error":          "Invalid credentials",
        })
    }

    passwordBytes := make([]byte, len(req.Password))
    for i, v := range req.Password {
        passwordBytes[i] = byte(v)
    }

    defer func() {
        for i := range passwordBytes {
            passwordBytes[i] = 0
        }
        for i := range req.Password {
            req.Password[i] = 0
        }
    }()

    if err := bcrypt.CompareHashAndPassword([]byte(storedPassword), passwordBytes); err != nil {
        return c.Status(401).JSON(fiber.Map{
          "error":          "Invalid credentials",
      })
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id":  user.ID,
        "is_admin": user.IsAdmin,
        "exp":      time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24h
    })
    tokenString, err := token.SignedString([]byte(secretKey))

    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
    }

    return c.JSON(fiber.Map{
        "token": tokenString,
        "user": fiber.Map{
            "id":       user.ID,
            "username": user.Username,
            "email":    user.Email,
            "is_admin": user.IsAdmin,
        },
    })
}