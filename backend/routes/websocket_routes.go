package routes

import (
  "github.com/gofiber/fiber/v2"
  "github.com/kamilkulczyk/rolepagegame/handlers"
  "github.com/kamilkulczyk/rolepagegame/websocket"
)

func WebsocketRoutes(app *fiber.App) {
  app.Get("/ws", websocket.HandleConnection)
}