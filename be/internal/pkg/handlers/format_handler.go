package handlers

import (
	"archive/zip"
	"bufio"
	"bytes"
	clientrequest "contents_downloader/internal/pkg/client_request"
	"contents_downloader/internal/pkg/format"
	"contents_downloader/internal/pkg/utils"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strings"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

func GetContentFormat(c *websocket.Conn) {
	defer c.Close()

	_, jsonInput, err := c.ReadMessage()
	if err != nil {
		msg := fmt.Sprintf("Failed to read message: %v", err)
		_ = c.WriteMessage(websocket.TextMessage, []byte(msg))
		return
	}

	var metadataRequest clientrequest.MetadataRequest
	if err := json.Unmarshal(jsonInput, &metadataRequest); err != nil {
		msg := fmt.Sprintf("Invalid JSON received: %v", err)
		_ = c.WriteMessage(websocket.TextMessage, []byte(msg))
		return
	}

	if !utils.IsSafeUrl(metadataRequest.URI) {
		c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("it's not valid url:\"%v\"", metadataRequest.URI)))
	}
	////////////////////////////////////////////////////
	//if len(uri) == 0 {
	//	uri = "https://youtu.be/8PDDjCW5XWw"
	//}
	////////////////////////////////////////////////////
	//c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("command(purpose: get meta-data, url:%v) started", metadataRequest.URI)))
	cmd := exec.Command("/opt/homebrew/bin/yt-dlp", "--dump-json", metadataRequest.URI)
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Errorf("yt-dlp stdout pipe error:%v", err)
		return
	}
	if err := cmd.Start(); err != nil {
		log.Errorf("yt-dlp 실행 오류:%v", err)
		return
	}
	output, err := io.ReadAll(stdout)
	if err != nil {
		log.Fatalf("%v", err)
		return
	}
	var contentFormat format.ContentFormat
	json.Unmarshal(output, &contentFormat)
	sortedAvailableFormats, thumbnails := format.GetAvailableFormats(contentFormat)

	//var serverResponse map[string]interface{}
	serverResponse := make(map[string]interface{})
	serverResponse["formats"] = sortedAvailableFormats
	serverResponse["thumbnails"] = thumbnails

	formatBytes, _ := json.Marshal(serverResponse)
	log.Infof("server sent %v.....", string(formatBytes)[:50])
	if err := c.WriteMessage(websocket.TextMessage, formatBytes); err != nil {
		log.Info("웹소켓 전송 실패:%v", err)
		return
	}
	cmd.Wait()
}

func getFileName(url string) (string, error) {
	cmd := exec.Command("/opt/homebrew/bin/yt-dlp", "-o", "%(id)s.%(ext)s", "--get-filename", url)
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Errorf("yt-dlp stdout pipe error:%v", err)
		return "", fmt.Errorf("yt-dlp stdout pipe error:%v", err)
	}
	if err := cmd.Start(); err != nil {
		log.Errorf("yt-dlp 실행 오류:%v", err)
		return "", fmt.Errorf("yt-dlp 실행 오류:%v", err)
	}
	output, err := io.ReadAll(stdout)
	if err != nil {
		log.Fatalf("%v", err)
		return "", fmt.Errorf("%v", err)
	}
	return strings.ReplaceAll(strings.ReplaceAll(string(output), "\n", ""), " ", ""), nil
}
func isAlreadyExist(filename string) bool {
	files, _ := os.ReadDir("./downloads")
	for _, file := range files {
		if !file.IsDir() && file.Name() == filename {
			return true
		}
	}
	return false
}

func GetMediaDownloaded(c *websocket.Conn) {
	defer c.Close()

	_, jsonInput, err := c.ReadMessage()
	if err != nil {
		msg := fmt.Sprintf("Failed to read message: %v", err)
		_ = c.WriteMessage(websocket.TextMessage, []byte(msg))
		return
	}

	var mediaRequest clientrequest.MediaRequest
	if err := json.Unmarshal(jsonInput, &mediaRequest); err != nil {
		msg := fmt.Sprintf("Invalid JSON received: %v", err)
		_ = c.WriteMessage(websocket.TextMessage, []byte(msg))
		return
	}
	if !utils.IsSafeUrl(mediaRequest.URI) {
		c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("it's not valid url:\"%v\"", mediaRequest.URI)))
	}

	filename, err := getFileName(mediaRequest.URI)
	if err != nil {
		log.Fatalf("%v", err)
		return
	}
	filename = fmt.Sprintf("%v_%v", mediaRequest.FORMAT_ID, filename)
	log.Infof("filename: \"%v\", err : %v", filename, err)
	if isExist := isAlreadyExist(filename); isExist {
		formatBytes, _ := json.Marshal(map[string]interface{}{
			"filename": filename,
		})
		c.WriteMessage(websocket.TextMessage, formatBytes)
		return
	}

	destination := fmt.Sprintf(`./downloads/%v_%v.%v`, mediaRequest.FORMAT_ID, "%(id)s", "%(ext)s")
	//cmd := exec.Command("/opt/homebrew/bin/yt-dlp", "-f", mediaRequest.FORMAT_ID, "--newline", "--progress-template", "%(progress)j", mediaRequest.URI, "-o", "./downloads/%(id)s.%(ext)s")
	cmd := exec.Command("/opt/homebrew/bin/yt-dlp", "-f", mediaRequest.FORMAT_ID, "--newline", "--progress-template", "%(progress)j", mediaRequest.URI, "-o", destination)
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Errorf("yt-dlp stdout pipe error:%v", err)
		return
	}
	if err := cmd.Start(); err != nil {
		log.Errorf("yt-dlp 실행 오류:%v", err)
		return
	}

	scanner := bufio.NewScanner(stdout)
	previousPercentage := 0.0
	i := 0
	var serverResponse map[string]interface{}
	for scanner.Scan() {
		line := scanner.Text()
		serverResponse := make(map[string]interface{})
		if err := json.Unmarshal([]byte(line), &serverResponse); err == nil {
			// 필요한 필드만 체크
			keysToMaintained := []string{"status", "fragment_index", "fragment_count", "_percent", "downloaded_bytes", "eta", "total_bytes"}
			isDownloadProcess := false
			for key := range serverResponse {
				if slices.Contains(keysToMaintained, key) {
					isDownloadProcess = true
				} else {
					delete(serverResponse, key)
				}
			}
			currentPercentage, isExist := serverResponse["_percent"].(float64)
			if isDownloadProcess && isExist {
				diff := math.Abs(currentPercentage - previousPercentage)
				if diff > 0.3 || previousPercentage == 0.0 {
					previousPercentage = currentPercentage
					formatBytes, _ := json.Marshal(serverResponse)
					//log.Infof("server sent %v.....", string(formatBytes))
					if err := c.WriteMessage(websocket.TextMessage, formatBytes); err != nil {
						log.Infof("웹소켓 전송 실패: %v", err)
						return
					}
					fmt.Printf("%v-%v\n", i, serverResponse)
					i += 1
				}
			}
		} else {
			log.Debug("비정상 출력 or JSON 아님: %s", line)
		}
	}
	files, _ := os.ReadDir("./downloads")
	serverResponse = make(map[string]interface{})
	for _, file := range files {
		if !file.IsDir() && file.Name() == filename {
			serverResponse["filename"] = file.Name()
			formatBytes, _ := json.Marshal(serverResponse)
			c.WriteMessage(websocket.TextMessage, formatBytes)
			break
		}
	}

	if err := scanner.Err(); err != nil {
		log.Errorf("stdout 읽기 오류: %v", err)
	}

	cmd.Wait()
}

func GetBulkMediaDownloaded(c *websocket.Conn) {
	defer c.Close()

	_, jsonInput, err := c.ReadMessage()
	if err != nil {
		msg := fmt.Sprintf("Failed to read message: %v", err)
		_ = c.WriteMessage(websocket.TextMessage, []byte(msg))
		return
	}

	var mediaRequest clientrequest.MediaBulkRequest
	if err := json.Unmarshal(jsonInput, &mediaRequest); err != nil {
		msg := fmt.Sprintf("Invalid JSON received: %v", err)
		_ = c.WriteMessage(websocket.TextMessage, []byte(msg))
		return
	}

	if mediaRequest.FORMAT_ID == "" {
		mediaRequest.FORMAT_ID = "bestvideo+bestaudio"
	}
	fmt.Printf("%v\n", mediaRequest)
	var availableUrls []string
	for _, requestedUri := range mediaRequest.URIs {
		if !utils.IsSafeUrl(requestedUri) {
			formatBytes, _ := json.Marshal(map[string]interface{}{
				"requestedUri": requestedUri,
				"status":       "failed",
				"reason":       "invalid_url",
			})
			c.WriteMessage(websocket.TextMessage, formatBytes)
		} else {
			availableUrls = append(availableUrls, requestedUri)
		}
	}

	var filteredUrls []string
	for _, availableUrl := range availableUrls {
		filename, _ := getFileName(availableUrl)
		filename = fmt.Sprintf("%v_%v", mediaRequest.FORMAT_ID, filename)

		if isAlreadyExist(filename) {
			formatBytes, _ := json.Marshal(map[string]interface{}{
				"requestedUri": availableUrl,
				"status":       "completed",
				"filename":     filename,
			})
			c.WriteMessage(websocket.TextMessage, formatBytes)
			// 존재하면 배열에 추가하지 않음 → 제거 효과
			continue
		}
		// 존재하지 않는 경우만 새 배열에 추가
		filteredUrls = append(filteredUrls, availableUrl)
	}
	availableUrls = filteredUrls
	////////////////////////////////////////////////////////////////////////////////
	// go routine
	numWorkers := 5
	jobs := make(chan string, len(availableUrls))
	var wg sync.WaitGroup
	var mu sync.Mutex // WebSocket 메시지 전송을 위한 뮤텍스

	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			// 채널에서 작업을 받아서 처리
			for availableUrl := range jobs {
				filename, _ := getFileName(availableUrl)
				filename = fmt.Sprintf("%v_%v", mediaRequest.FORMAT_ID, filename)
				destination := fmt.Sprintf(`./downloads/%v_%v.%v`, mediaRequest.FORMAT_ID, "%(id)s", "%(ext)s")

				cmd := exec.Command("/opt/homebrew/bin/yt-dlp", "-f", mediaRequest.FORMAT_ID, "--newline", "--progress-template", "%(progress)j", availableUrl, "-o", destination)
				stdout, err := cmd.StdoutPipe()
				if err != nil {
					fmt.Printf("StdoutPipe 에러: %v\n", err)
					continue
				}

				if err := cmd.Start(); err != nil {
					fmt.Printf("Command Start 에러: %v\n", err)
					continue
				}

				scanner := bufio.NewScanner(stdout)
				previousPercentage := 0.0

				for scanner.Scan() {
					line := scanner.Text()
					serverResponse := make(map[string]interface{}) // 루프 내부에서 새로 생성

					if err := json.Unmarshal([]byte(line), &serverResponse); err == nil {
						keysToMaintained := []string{"status", "fragment_index", "fragment_count", "_percent", "downloaded_bytes", "eta", "total_bytes"}
						isDownloadProcess := false

						// 필요한 키만 유지
						for key := range serverResponse {
							if slices.Contains(keysToMaintained, key) {
								isDownloadProcess = true
							} else {
								delete(serverResponse, key)
							}
						}

						if currentPercentage, isExist := serverResponse["_percent"].(float64); isDownloadProcess && isExist {
							diff := math.Abs(currentPercentage - previousPercentage)
							if diff > 0.3 || previousPercentage == 0.0 {
								previousPercentage = currentPercentage
								serverResponse["filename"] = filename

								if formatBytes, err := json.Marshal(serverResponse); err == nil {
									// WebSocket 메시지 전송을 뮤텍스로 보호
									mu.Lock()
									if err := c.WriteMessage(websocket.TextMessage, formatBytes); err != nil {
										fmt.Printf("WebSocket 메시지 전송 에러: %v\n", err)
									}
									mu.Unlock()
								}

								fmt.Printf("[%v]-%v\n", filename, serverResponse)
							}
						}
					} else {
						//fmt.Printf("JSON Unmarshal 에러: %v, 라인: %s\n", err, line)
					}
				}

				// 스캐너 에러 체크
				if err := scanner.Err(); err != nil {
					fmt.Printf("Scanner 에러: %v\n", err)
				}

				// 명령어 완료 대기
				if err := cmd.Wait(); err != nil {
					fmt.Printf("Command Wait 에러: %v\n", err)
				}

				// 완료된 파일 확인
				if files, err := os.ReadDir("./downloads"); err == nil {
					serverResponse := make(map[string]interface{})
					for _, file := range files {
						if !file.IsDir() && strings.Contains(file.Name(), filename) {
							serverResponse["filename"] = file.Name()
							serverResponse["status"] = "complete"
							if formatBytes, err := json.Marshal(serverResponse); err == nil {
								mu.Lock()
								if err := c.WriteMessage(websocket.TextMessage, formatBytes); err != nil {
									fmt.Printf("WebSocket 메시지 전송 에러: %v\n", err)
								}
								mu.Unlock()
							}
							break
						}
					}
				}
			}
		}()
	}

	// 작업들을 채널에 추가
	for _, availableUrl := range availableUrls {
		jobs <- availableUrl
	}
	close(jobs) // 모든 작업을 넣었으면 채널 닫기

	wg.Wait() // 모든 고루틴 종료 대기

}

func GetBulkMediaDownloadByZip(c *fiber.Ctx) error {
	var requestBody clientrequest.MediaBulkDownloadRequest

	if err := c.BodyParser(&requestBody); err != nil {
		return c.Status(400).SendString("Invalid request body")
	}
	buf := new(bytes.Buffer)
	zipWriter := zip.NewWriter(buf)
	// 디렉토리 순회
	err := filepath.Walk("./downloads", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}

		// 확장자 필터링
		shouldInclude := false
		log.Infof("target %v -> %v", info.Name(), slices.Contains(requestBody.FILE_NAMES, info.Name()))
		if slices.Contains(requestBody.FILE_NAMES, info.Name()) {
			shouldInclude = true
		}
		if !shouldInclude {
			return nil
		}

		file, err := os.Open(path)
		if err != nil {
			return err
		}

		w, err := zipWriter.Create(info.Name())
		if err != nil {
			return err
		}
		_, err = io.Copy(w, file)
		return err
	})
	if err != nil {
		log.Errorf("%+v", err)
		return err
	}

	if err := zipWriter.Close(); err != nil {
		log.Errorf("%+v", err)
		return err
	}

	c.Set("Content-Type", "application/zip")
	c.Attachment("download.zip")
	return c.SendStream(bytes.NewReader(buf.Bytes()))
}

//func GetMediaDownloaded(c *websocket.Conn) {
//	defer c.Close()
//	_, jsonInput, err := c.ReadMessage()
//	if err != nil {
//		msg := fmt.Sprintf("Failed to read message: %v", err)
//		_ = c.WriteMessage(websocket.TextMessage, []byte(msg))
//		return
//	}

//	var mediaRequest clientrequest.MediaRequest
//	if err := json.Unmarshal(jsonInput, &mediaRequest); err != nil {
//		msg := fmt.Sprintf("Invalid JSON received: %v", err)
//		_ = c.WriteMessage(websocket.TextMessage, []byte(msg))
//		return
//	}
//	if !utils.IsSafeUrl(mediaRequest.URI) {
//		c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("it's not valid url:\"%v\"", mediaRequest.URI)))
//	}

//	c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("command(purpose: get media downloaded, url:%v, formatId:%v) started", mediaRequest.URI, mediaRequest.FORMAT_ID)))
//	cmd := exec.Command("/opt/homebrew/bin/yt-dlp", "-f", mediaRequest.FORMAT_ID, "--quiet", "--print-json", mediaRequest.URI, "-o", "%(id)s.%(ext)s")
//	stdout, err := cmd.StdoutPipe()
//	if err != nil {
//		log.Info("yt-dlp stdout pipe error:%v", err)
//		return
//	}
//	if err := cmd.Start(); err != nil {
//		log.Info("yt-dlp 실행 오류:%v", err)
//		return
//	}
//	output, err := io.ReadAll(stdout) // block....
//	if err != nil {
//		log.Fatalf("%v", err)
//		return
//	}
//	var serverResponse map[string]interface{}
//	json.Unmarshal(output, &serverResponse)

//	keysToMaintained := []string{"fulltitle", "description", "duration", "ext", "filename", "format_id", "height", "width", "original_url", "resolution", "thumbnail"}
//	for key, _ := range serverResponse {
//		if !slices.Contains(keysToMaintained, key) {
//			delete(serverResponse, key)
//		}
//	}

//	serverResponse["response"] = "download completed."
//	formatBytes, _ := json.Marshal(serverResponse)
//	log.Infof("server sent %v.....", string(formatBytes)[:50])

//	if err := c.WriteMessage(websocket.TextMessage, formatBytes); err != nil {
//		log.Info("웹소켓 전송 실패:%v", err)
//		return
//	}
//	cmd.Wait()
//}
