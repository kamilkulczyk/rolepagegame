package main

import (
  "log"

  "github.com/gofiber/fiber/v2"
  "github.com/gofiber/contrib/websocket"
  "github.com/gofiber/fiber/v2/middleware/cors"
  "github.com/kamilkulczyk/rolepagegame/config"
  "github.com/kamilkulczyk/rolepagegame/routes"
)

func main() {
  config.ConnectDB()

  app := fiber.New()

  app.Use(cors.New(cors.Config{
    AllowOrigins: "https://rolepagegame.online/",
    AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    AllowHeaders: "Origin, Content-Type, Accept, Authorization",
    AllowCredentials: true,
  }))

  app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

  routes.SetupRoutes(app)

  log.Fatal(app.Listen(":3000"))
}