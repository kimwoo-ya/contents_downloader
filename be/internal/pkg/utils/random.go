package utils

import (
	"bytes"
	"math/rand"
	"time"
)

var alphaNumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func GetRandomAlphaNumeric(length int) string {
	rand.New(rand.NewSource(time.Now().UnixMilli()))
	var buffer bytes.Buffer
	for i := 0; i < length; i++ {
		buffer.WriteByte(alphaNumeric[rand.Intn(len(alphaNumeric))])
	}
	return buffer.String()
}
