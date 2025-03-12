package routes

import (
  "github.com/gofiber/fiber/v2"

  "github.com/kamilkulczyk/rolepagegame/handlers"
  "github.com/kamilkulczyk/rolepagegame/middlewares"
)

func CharacterRoutes(app *fiber.App) {
  app.Post("/create-character", middlewares.JWTMiddleware(), handlers.CreateCharacter)
  app.Get("/characters", handlers.GetCharacters)
  app.Get("/characters/:id", handlers.GetCharacterByID)
  app.Get("/user-characters", middlewares.JWTMiddleware(), handlers.GetCharactersByuserID)
}