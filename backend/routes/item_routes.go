package routes

import (
  "github.com/gofiber/fiber/v2"

  "github.com/kamilkulczyk/rolepagegame/handlers"
  "github.com/kamilkulczyk/rolepagegame/middlewares"
)

func ItemRoutes(app *fiber.App) {
  app.Post("/items", middlewares.JWTMiddleware(), handlers.CreateItem)
  app.Post("/items/:id/rpg-data", middlewares.JWTMiddleware(), handlers.CreateItemRpgData)
  app.Get("/items/:id/rpg-data", handlers.GetRpgDataByItemID)=
  app.Get("/items/:id", handlers.GetItemByID)
  app.Get("/user-items", middlewares.JWTMiddleware(), handlers.GetItemsByUserID)
}