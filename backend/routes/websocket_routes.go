package routes

import (
  "github.com/gofiber/fiber/v2"
  "github.com/gofiber/contrib/websocket"

  "github.com/kamilkulczyk/rolepagegame/handlers"
)

func WebsocketRoutes(app *fiber.App) {
  app.Get("/ws", websocket.New(handlers.HandleConnection))
}