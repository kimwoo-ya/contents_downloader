package main

import (
	"contents_downloader/internal/pkg/config"
	"contents_downloader/internal/pkg/handlers"
	"path/filepath"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

func main() {
	app := fiber.New(config.NewFiberConfig())
	ws := app.Group("/ws")
	wsV1 := ws.Group("v1")
	wsV1.Use("/", func(c *fiber.Ctx) error {
		// IsWebSocketUpgrade returns true if the client
		// requested upgrade to the WebSocket protocol.
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	wsV1.Use("/metadata", websocket.New(handlers.GetContentFormat))
	wsV1.Use("/media/bulk", websocket.New(handlers.GetBulkMediaDownloaded))
	wsV1.Use("/media", websocket.New(handlers.GetMediaDownloaded))
	api := app.Group("/api")
	v1 := api.Group("/v1")

	v1.Get("/healthz", handlers.PreHealthHandler, handlers.HealthCheck)

	v1.Post("/download/bulk", handlers.GetBulkMediaDownloadByZip)
	v1.Get("/download/:filename", func(c *fiber.Ctx) error {
		filename := c.Params("filename")
		filePath := filepath.Join("./downloads", filename)
		return c.SendFile(filePath, true)
	})

	if err := app.Listen(":8080"); err != nil {
		log.Info("Fiber server stopped: %v", err)
	}
}

/**
ws://localhost:3000/ws/v1/metadata
{
    "uri": "https://x.com/i/status/1952780142654181466"
}
ws://localhost:3000/ws/v1/media
{
    "uri": "https://x.com/i/status/1952780142654181466",
    "format_id": "http-256"
}
*/

/**
ws://localhost:3000/ws/v1/metadata
{
    "uri": "https://youtu.be/8PDDjCW5XWw"
}
ws://localhost:3000/ws/v1/media
{
    "uri": "https://youtu.be/8PDDjCW5XWw",
    "format_id": "269"
}
*/
