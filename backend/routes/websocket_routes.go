package routes

import (
  "github.com/gofiber/fiber/v2"
  "github.com/gofiber/contrib/websocket"
  ws "github.com/kamilkulczyk/rolepagegame/websocket"
)

func WebsocketRoutes(app *fiber.App) {
  app.Get("/ws", websocket.New(ws.HandleConnection))
}