package routes

import (
  "github.com/gofiber/fiber/v2"
  "github.com/kamilkulczyk/rolepagegame/handlers"
)

func UserRoutes(app *fiber.App) {
  app.Get("/users", handlers.GetUsers)
  app.Get("/users/:id", handlers, GetUsernameByID)
}