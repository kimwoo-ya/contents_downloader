
# Toy Project API Documentation

This document provides the specification for the Toy Project API, designed to be used by front-end developers or other LLM models for UI implementation.

## 1. Health Check API

This endpoint is used to check the health of the server.

- **Endpoint:** `GET /api/v1/healthz`
- **Method:** `GET`
- **Description:** Checks the server's operational status and response time.
- **Success Response (200 OK):**
  ```json
  {
    "status": "GREEN",
    "elapsed": "1 ms",
    "time": "2023-10-27T10:00:00.123456+09:00"
  }
  ```
  - `status`: Indicates the server status. Can be `GREEN`, `YELLOW`, or `RED`.
  - `elapsed`: The time taken for the server to respond, in milliseconds.
  - `time`: The server's current time.

## 2. WebSocket API

The WebSocket API provides real-time communication for fetching media metadata and downloading media files.

### 2.1. Get Content Format (Metadata)

This WebSocket endpoint retrieves available formats and metadata for a given media URL.

- **Endpoint:** `ws://{host}/ws/v1/metadata`
- **Description:** After establishing a connection, the client sends a JSON message with the media URI to fetch its metadata. The server will respond with the available formats.

- **Client to Server Message:**
  ```json
  {
    "uri": "https://example.com/media.mp4"
  }
  ```
  - `uri` (string, required): The URL of the media content (e.g., YouTube, Twitter video).

- **Server to Client Message (Success):**
  A JSON array of `Format` objects.
  ```json
  [
    {
      "format_id": "269",
      "format_note": "1080p",
      "ext": "mp4",
      "protocol": "https",
      "vcodec": "avc1.640028",
      "url": "https://...",
      "width": 1920,
      "height": 1080,
      "fps": 30,
      "vbr": 5120,
      "filesize_approx": 12345678,
      "resolution": "1920x1080",
      ...
    },
    ...
  ]
  ```
  Each object in the array contains detailed information about an available media format. See the `Format` object definition below for all fields.

### 2.2. Get Media Downloaded

This WebSocket endpoint initiates a media download and streams progress updates.

- **Endpoint:** `ws://{host}/ws/v1/media`
- **Description:** After connecting, the client sends a JSON message with the media URI and a specific `format_id` to start the download. The server will send progress updates and a final confirmation message.

- **Client to Server Message:**
  ```json
  {
    "uri": "https://example.com/media.mp4",
    "format_id": "269"
  }
  ```
  - `uri` (string, required): The URL of the media.
  - `format_id` (string, required): The ID of the format to download, obtained from the "Get Content Format" endpoint.

- **Server to Client Messages (Streaming Progress):**
  A series of JSON objects indicating the download progress.
  ```json
  {
    "status": "downloading",
    "_percent": 50.5,
    "downloaded_bytes": 6234567,
    "total_bytes": 12345678,
    "eta": 15
  }
  ```
  - `status`: "downloading"
  - `_percent`: Download progress percentage.
  - `downloaded_bytes`: Number of bytes downloaded so far.
  - `total_bytes`: Total size of the file in bytes.
  - `eta`: Estimated time remaining in seconds.

- **Server to Client Message (Download Complete):**
  A final JSON object confirming the download is complete.
  ```json
  {
    "response": "download completed.",
    "fulltitle": "Example Media Title",
    "filename": "media_id.mp4",
    ...
  }
  ```

## 3. Data Transfer Objects (DTOs)

### `Format` Object

This object contains detailed information about a specific media format.

```json
{
  "format_id": "string",
  "format_note": "string",
  "ext": "string",
  "protocol": "string",
  "acodec": "string",
  "vcodec": "string",
  "url": "string",
  "width": "integer",
  "height": "integer",
  "fps": "float",
  "vbr": "integer",
  "abr": "integer",
  "filesize_approx": "integer",
  "resolution": "string",
  "aspect_ratio": "float"
}
```
