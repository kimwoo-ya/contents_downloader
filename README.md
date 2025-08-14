# Content Downloader

This is a web application designed to download videos and audio from various online sources. It consists of a Go backend that handles the core downloading logic and a React frontend that provides a user-friendly interface for interacting with the service.

## ✨ Features

-   **Single & Bulk Downloads**: Supports downloading from a single URL or multiple URLs at once.
-   **Format Selection**: Fetches available media formats (video, audio, different resolutions) before downloading.
-   **Real-time Progress**: Uses WebSockets to provide real-time feedback on metadata fetching and download progress.
-   **Thumbnail Preview**: Displays a thumbnail of the media content for single downloads.
-   **Archive Downloads**: Can package multiple downloaded files into a single `.zip` archive.

## 🛠️ Tech Stack

-   **Backend**:
    -   [Go](https://golang.org/)
    -   [Fiber](https://gofiber.io/) (Web Framework)
    -   [yt-dlp](https://github.com/yt-dlp/yt-dlp) (for media downloading)
    -   WebSockets for real-time communication.
-   **Frontend**:
    -   [React](https://reactjs.org/)
    -   [TypeScript](https://www.typescriptlang.org/)
    -   [Chakra UI](https://chakra-ui.com/) (Component Library)
    -   [Axios](https://axios-http.com/) (for HTTP requests)

## 🚀 Getting Started

### Prerequisites

-   [Go](https://golang.org/doc/install) (version 1.21 or newer recommended)
-   [Node.js](https://nodejs.org/en/download/) (version 16 or newer recommended)
-   [yt-dlp](https://github.com/yt-dlp/yt-dlp#installation): This must be installed and available in your system's `PATH`. The application executes it as a command-line tool.

### Installation & Running

The project is split into two main directories: `be` (backend) and `fe` (frontend). You will need to run both simultaneously.

**1. Run the Backend Server:**

```bash
# Navigate to the backend directory
cd be

# Install dependencies
go mod tidy

# Run the server
go run cmd/toy_project/main.go
```

The Go server will start on `http://localhost:8080`.

**2. Run the Frontend Application:**

```bash
# Open a new terminal and navigate to the frontend directory
cd fe

# Install dependencies
npm install

# Start the React development server
npm start
```

The React application will be available at `http://localhost:3000`. The development server is configured to proxy API and WebSocket requests to the backend server at port `8080`.

## Project Structure

-   `be/`: Contains the Go backend source code.
    -   `cmd/toy_project/main.go`: The main entry point for the server.
    -   `internal/pkg/handlers/`: Request handlers for API and WebSocket endpoints.
    -   `internal/pkg/format/`: Logic for processing `yt-dlp` output.
    -   `downloads/`: Default directory where downloaded files are saved.
-   `fe/`: Contains the React frontend source code.
    -   `src/component/`: Main React components.
    -   `src/utils/api.ts`: Axios configuration.
    -   `setupProxy.js`: Proxy configuration for the development server.

## ⚙️ API Endpoints

The backend exposes both WebSocket and REST endpoints.

### WebSocket API

The WebSocket server is available at `ws://localhost:8080/ws/v1`. It is used for real-time, stateful communication.

-   **`ws://localhost:8080/ws/v1/metadata`**
    -   **Purpose**: Fetches available download formats for a given URL.
    -   **Client Message**: `{"uri": "https://<video_url>"}`
    -   **Server Response**: A JSON object containing arrays of available `formats` and `thumbnails`.

-   **`ws://localhost:8080/ws/v1/media`**
    -   **Purpose**: Initiates the download of a single media file and streams progress updates.
    -   **Client Message**: `{"uri": "https://<video_url>", "format_id": "<format_id>"}`
    -   **Server Response**: A stream of JSON objects indicating download progress (`_percent`, `status`, etc.), followed by a final message with the completed `filename`.

-   **`ws://localhost:8080/ws/v1/media/bulk`**
    -   **Purpose**: Initiates the download for multiple URLs and streams progress.
    -   **Client Message**: `{"uris": ["https://..."], "format_id": "bestvideo+bestaudio"}`
    -   **Server Response**: A stream of JSON objects indicating the status and progress for each URL.

### REST API

-   **`GET /api/v1/healthz`**
    -   **Purpose**: Health check endpoint. Returns a `200 OK` if the server is running.

-   **`POST /api/v1/download/bulk`**
    -   **Purpose**: Creates and returns a `.zip` archive of specified, already-downloaded files.
    -   **Request Body**: `{"file_names": ["file1.mp4", "file2.webm"]}`
    -   **Response**: A `download.zip` file.

-   **`GET /api/v1/download/:filename`**
    -   **Purpose**: Downloads a specific file that has already been saved to the `./downloads` directory on the server.