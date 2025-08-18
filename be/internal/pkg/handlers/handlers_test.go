package handlers

import (
	clientrequest "contents_downloader/internal/pkg/client_request"
	"contents_downloader/internal/pkg/config"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	gws "github.com/gorilla/websocket"
)

// The downloads directory is relative to the module root (`be` directory)
const downloadsDir = "./downloads"

// --- Test Suite Setup & Teardown ---

func TestMain(m *testing.M) {
	// Ensure the downloads directory exists relative to the `be` module root.
	_ = os.MkdirAll(downloadsDir, 0755)
	cleanupDownloads(downloadsDir) // Clean up before tests, just in case

	exitCode := m.Run()

	fmt.Println("\n--- Cleaning up downloads directory ---")
	cleanupDownloads(downloadsDir)

	os.Exit(exitCode)
}

func cleanupDownloads(dir string) {
	files, err := filepath.Glob(filepath.Join(dir, "*"))
	if err != nil {
		fmt.Printf("Could not glob downloads directory: %v\n", err)
		return
	}
	for _, f := range files {
		if info, err := os.Stat(f); err == nil && !info.IsDir() {
			_ = os.Remove(f)
		}
	}
}

func startTestServer(t *testing.T, app *fiber.App) string {
	t.Helper()
	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err)

	go func() {
		if err := app.Listener(ln); err != nil && !strings.Contains(err.Error(), "Listener closed") {
			t.Logf("app.Listener error: %v", err)
		}
	}()

	t.Cleanup(func() { _ = app.Shutdown() })

	return ln.Addr().String()
}

func setupApp() *fiber.App {
	app := fiber.New(config.NewFiberConfig())

	api := app.Group("/api")
	v1 := api.Group("/v1")
	v1.Get("/healthz", PreHealthHandler, HealthCheck)
	v1.Post("/download/bulk", GetBulkMediaDownloadByZip)
	v1.Get("/download/:filename", func(c *fiber.Ctx) error {
		// The handler in main.go uses a relative path, so the test should too.
		return c.SendFile(filepath.Join(downloadsDir, c.Params("filename")), true)
	})

	ws := app.Group("/ws")
	wsV1 := ws.Group("/v1")
	wsV1.Use("/", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	wsV1.Use("/metadata", websocket.New(GetContentFormat))
	wsV1.Use("/media/bulk", websocket.New(GetBulkMediaDownloaded))
	wsV1.Use("/media", websocket.New(GetMediaDownloaded))

	return app
}

// --- REST API Endpoint Tests ---

func TestAPI_GetHealthz(t *testing.T) {
	app := setupApp()
	req := httptest.NewRequest("GET", "/api/v1/healthz", nil)
	resp, err := app.Test(req, -1)
	require.NoError(t, err)
	assert.Equal(t, fiber.StatusOK, resp.StatusCode)
}

func TestAPI_GetDownloadFile(t *testing.T) {
	app := setupApp()
	dummyFilename := "test_get_download.txt"
	dummyFilepath := filepath.Join(downloadsDir, dummyFilename)
	require.NoError(t, os.WriteFile(dummyFilepath, []byte("content"), 0644))

	t.Run("should download existing file", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/download/"+dummyFilename, nil)
		resp, err := app.Test(req, -1)
		require.NoError(t, err)
		defer resp.Body.Close()
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
		body, _ := io.ReadAll(resp.Body)
		assert.Equal(t, "content", string(body))
	})

	t.Run("should return 404 for non-existent file", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/download/not_found.txt", nil)
		resp, err := app.Test(req, -1)
		require.NoError(t, err)
		assert.Equal(t, fiber.StatusNotFound, resp.StatusCode)
	})
}

func TestAPI_PostBulkDownloadZip(t *testing.T) {
	app := setupApp()
	dummyFilename := "test_zip_download.txt"
	dummyFilepath := filepath.Join(downloadsDir, dummyFilename)
	require.NoError(t, os.WriteFile(dummyFilepath, []byte("zip content"), 0644))

	requestBody := clientrequest.MediaBulkDownloadRequest{FILE_NAMES: []string{dummyFilename}}
	jsonBytes, _ := json.Marshal(requestBody)
	bodyReader := strings.NewReader(string(jsonBytes))

	req := httptest.NewRequest("POST", "/api/v1/download/bulk", bodyReader)
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req, -1)
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	assert.Equal(t, "application/zip", resp.Header.Get("Content-Type"))
}

// --- WebSocket API Endpoint Tests ---

func TestWS_GetMetadata(t *testing.T) {
	app := setupApp()
	addr := startTestServer(t, app)
	wsURL := "ws://" + addr + "/ws/v1/metadata"
	conn, _, err := gws.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer conn.Close()

	require.NoError(t, conn.WriteJSON(map[string]string{"uri": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}))

	var response map[string]interface{}
	conn.SetReadDeadline(time.Now().Add(20 * time.Second))
	require.NoError(t, conn.ReadJSON(&response))
	assert.NotEmpty(t, response["formats"])
}

func TestWS_GetBulkMedia(t *testing.T) {
	app := setupApp()
	addr := startTestServer(t, app)
	wsURL := "ws://" + addr + "/ws/v1/media/bulk"
	conn, _, err := gws.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer conn.Close()

	// Test with multiple URLs
	urls := []string{
		"https://www.youtube.com/watch?v=krDWc30PAGg",
		"https://x.com/i/status/1952780142654181466",
		"https://www.youtube.com/watch?v=xrRDlOWR1OU",
	}
	require.NoError(t, conn.WriteJSON(map[string]interface{}{"uris": urls, "format_id": "bestvideo+bestaudio"}))

	completed := make(map[string]bool)
	timeout := time.After(5 * time.Minute) // Increased timeout for two files
Loop:
	for len(completed) < len(urls) {
		select {
		case <-timeout:
			t.Fatal("Test timed out waiting for bulk downloads to complete")
		default:
			var response map[string]interface{}
			conn.SetReadDeadline(time.Now().Add(45 * time.Second))
			if err := conn.ReadJSON(&response); err != nil {
				break Loop
			}
			if s, ok := response["status"]; ok && (s == "complete" || s == "completed") {
				if f, ok := response["filename"].(string); ok {
					completed[f] = true
				}
			}
		}
	}
	assert.Equal(t, len(urls), len(completed), "The number of completed files should match the number of requested URLs")
}

// --- Integration Test ---

func TestE2E_WsMediaToApiDownload(t *testing.T) {
	app := setupApp()
	addr := startTestServer(t, app)

	// Step 1: Download via WebSocket
	wsURL := "ws://" + addr + "/ws/v1/media"
	conn, _, err := gws.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer conn.Close()

	// Test with multiple URLs
	require.NoError(t, conn.WriteJSON(map[string]interface{}{"uri": "https://www.youtube.com/watch?v=xrRDlOWR1OU", "format_id": "bestvideo+bestaudio"}))

	var downloadedFilename string
Loop:
	for {
		var response map[string]interface{}
		conn.SetReadDeadline(time.Now().Add(45 * time.Second))
		if err := conn.ReadJSON(&response); err != nil {
			break Loop
		}
		if f, ok := response["filename"]; ok {
			downloadedFilename = f.(string)
			break Loop
		}
	}
	require.NotEmpty(t, downloadedFilename, "Failed to get filename from WebSocket")

	// Step 2: Verify file exists
	filePath := filepath.Join(downloadsDir, downloadedFilename)
	fileInfo, err := os.Stat(filePath)
	require.NoError(t, err, "File was not created on filesystem")

	// Step 3: Download via REST API
	restURL := "http://" + addr + "/api/v1/download/" + downloadedFilename
	resp, err := http.Get(restURL)
	require.NoError(t, err)
	defer resp.Body.Close()

	// Step 4: Assert response
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	body, err := io.ReadAll(resp.Body)
	require.NoError(t, err)
	assert.Equal(t, fileInfo.Size(), int64(len(body)))
}
