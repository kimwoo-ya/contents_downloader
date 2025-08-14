package clientrequest

type MetadataRequest struct {
	URI string `json:"uri"`
}
type MediaRequest struct {
	URI       string `json:"uri"`
	FORMAT_ID string `json:"format_id"`
}

type MediaBulkRequest struct {
	URIs      []string `json:"uris"`
	FORMAT_ID string   `json:"format_id"`
}
type MediaBulkDownloadRequest struct {
	FILE_NAMES []string `json:"filenames"`
}
