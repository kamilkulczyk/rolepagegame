package routes

import (
  "github.com/gofiber/fiber/v2"
  "github.com/kamilkulczyk/rolepagegame/handlers"
)

func AuthRoutes(app *fiber.App) {
  app.Post("/login", handlers.Login)
  app.Post("/register", handlers.Register)
}