package utils

import (
	"net/url"
	"strings"
)

func IsSafeUrl(uri string) bool {
	if !validateUrl(uri) {
		return false
	}
	if strings.ContainsAny(uri, ";|&$`<>") {
		return false
	}
	return true
}

func validateUrl(uri string) bool {
	u, err := url.Parse(uri)
	return err == nil && strings.HasPrefix(u.Scheme, "http") && u.Host != ""
}
