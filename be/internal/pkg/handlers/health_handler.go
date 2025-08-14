package handlers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
//	"github.com/gofiber/fiber/v2/log"
)

func PreHealthHandler(c *fiber.Ctx) error {
	c.Locals("requested", time.Now().UnixMilli())
//	log.Infof("hello %v", time.Now().UnixMilli())
	return c.Next()
}
func HealthCheck(c *fiber.Ctx) error {
	val := c.Locals("requested")
	requested, _ := val.(int64)
	//requested, _ := strconv.ParseInt(c.GetReqHeaders()["Requested"][0], 10, 64)
	//time.Sleep(time.Second * time.Duration(rand.Intn(4)))
	elapsed := time.Now().UnixMilli() - requested
	status := "GREEN"
	if 1000*3 <= elapsed {
		status = "RED"
	}
	if 1000*1 <= elapsed && elapsed < 1000*3 {
		status = "YELLOW"
	}
	return c.JSON(map[string]interface{}{
		"status":  status,
		"elapsed": fmt.Sprintf("%v ms", elapsed),
		"time":    time.Now(),
	})
}
