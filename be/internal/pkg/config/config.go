package config

import (
	"os"

	"github.com/gofiber/fiber/v2"
)

type Config struct {
	YtdlpPath string
}

var Cfg Config

// init runs automatically when the package is imported, loading the config.
func init() {
	// Read the YTDLP_PATH environment variable
	ytdlpPath := os.Getenv("YTDLP_PATH")

	// If the env var is not set, use "yt-dlp" as the default.
	// This assumes yt-dlp is in the system's PATH.
	if ytdlpPath == "" {
		ytdlpPath = "yt-dlp"
	}

	Cfg = Config{
		YtdlpPath: ytdlpPath,
	}
}

func NewFiberConfig() fiber.Config {
	return fiber.Config{
		AppName: "contents_downloader",
	}
}
