package main

import (
  "log"

  "github.com/gofiber/fiber/v2"
  "github.com/gofiber/fiber/v2/middleware/cors"
  "github.com/kamilkulczyk/rolepagegame/config"
  "github.com/kamilkulczyk/rolepagegame/routes"
)

func main() {
  config.ConnectDB()
  
  if err := config.CacheIDs(conn.Conn()); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to cache object type IDs"})
	}

  app := fiber.New()

  app.Use(cors.New(cors.Config{
    AllowOrigins: "https://rolepagegame.online/",
    AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    AllowHeaders: "Origin, Content-Type, Accept, Authorization",
    AllowCredentials: true,
  }))

  routes.SetupRoutes(app)

  log.Fatal(app.Listen(":3000"))
}