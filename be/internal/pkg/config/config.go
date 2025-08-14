package config

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

func init() {
	log.SetLevel(log.LevelInfo)
}

func NewFiberConfig() fiber.Config {
	return fiber.Config{
		EnablePrintRoutes: true,
		ProxyHeader:       "X-Forwarded-*",
		ErrorHandler: func(ctx *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			var e *fiber.Error
			if errors.As(err, &e) {
				code = e.Code
			}
			// Send custom error page
			err = ctx.Status(code).JSON(e)
			if err != nil {
				return err
			}
			return nil
		},
		//ErrorHandler: func(ctx *fiber.Ctx, err error) error {
		//	code := fiber.StatusInternalServerError

		//	// Retrieve the custom status code if it's a *fiber.Error
		//	var e *fiber.Error
		//	if errors.As(err, &e) {
		//		code = e.Code
		//	}

		//	// Send custom error page
		//	err = ctx.Status(code).SendFile(fmt.Sprintf("./%d.html", code))
		//	if err != nil {
		//		// In case the SendFile fails
		//		return ctx.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
		//	}

		//	// Return from handler
		//	return nil
		//},
	}
}
