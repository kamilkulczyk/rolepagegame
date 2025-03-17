package routes

import (
  "github.com/gofiber/fiber/v2"

  "github.com/kamilkulczyk/rolepagegame/handlers"
  "github.com/kamilkulczyk/rolepagegame/middlewares"
)

func CharacterRoutes(app *fiber.App) {
  app.Post("/characters", middlewares.JWTMiddleware(), handlers.CreateCharacter)
  app.Post("/characters/:id/rpg-data", middlewares.JWTMiddleware(), handlers.CreateRpgData)
  app.Get("/characters", handlers.GetCharacters)
  app.Get("/characters/:id", handlers.GetCharacterByID)
  app.Get("/user-characters", middlewares.JWTMiddleware(), handlers.GetCharactersByUserID)
}