package routes

import (
  "github.com/gofiber/fiber/v2"

  "github.com/kamilkulczyk/rolepagegame/handlers"
  "github.com/kamilkulczyk/rolepagegame/middlewares"
)

func ChatRoutes(app *fiber.App) {
  app.Post("/connect-ws", handlers.ConnectWS)
  app.Get("/messages/:id", middlewares.JWTMiddleware(), handlers.FetchMessages)
}