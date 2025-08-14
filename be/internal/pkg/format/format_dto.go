package format

import (
	"sort"
	"strings"
)

type Format struct {
	FormatID   string  `json:"format_id"`
	FormatNote string  `json:"format_note,omitempty"`
	Ext        string  `json:"ext"`
	Protocol   string  `json:"protocol"`
	Acodec     string  `json:"acodec,omitempty"`
	Vcodec     string  `json:"vcodec"`
	URL        string  `json:"url"`
	Width      int     `json:"width,omitempty"`
	Height     int     `json:"height,omitempty"`
	Fps        float64 `json:"fps,omitempty"`
	Rows       int     `json:"rows,omitempty"`
	Columns    int     `json:"columns,omitempty"`
	Fragments  []struct {
		URL      string `json:"url"`
		Duration int    `json:"duration"`
	} `json:"fragments,omitempty"`
	AudioExt       string      `json:"audio_ext"`
	VideoExt       string      `json:"video_ext"`
	Vbr            int         `json:"vbr"`
	Abr            int         `json:"abr"`
	Tbr            interface{} `json:"tbr"`
	Resolution     string      `json:"resolution"`
	AspectRatio    float64     `json:"aspect_ratio"`
	FilesizeApprox interface{} `json:"filesize_approx,omitempty"`
	HTTPHeaders    struct {
		UserAgent      string `json:"User-Agent"`
		Accept         string `json:"Accept"`
		AcceptLanguage string `json:"Accept-Language"`
		SecFetchMode   string `json:"Sec-Fetch-Mode"`
	} `json:"http_headers"`
	Format string `json:"format"`

	FormatIndex        interface{} `json:"format_index,omitempty"`
	ManifestURL        string      `json:"manifest_url,omitempty"`
	Language           string      `json:"language,omitempty"`
	Preference         interface{} `json:"preference,omitempty"`
	Quality            int         `json:"quality,omitempty"`
	HasDrm             bool        `json:"has_drm,omitempty"`
	SourcePreference   int         `json:"source_preference,omitempty"`
	NeedsTesting       bool        `json:"__needs_testing,omitempty"`
	Asr                int         `json:"asr,omitempty"`
	Filesize           int         `json:"filesize,omitempty"`
	AudioChannels      int         `json:"audio_channels,omitempty"`
	LanguagePreference int         `json:"language_preference,omitempty"`
	DynamicRange       interface{} `json:"dynamic_range,omitempty"`
	Container          string      `json:"container,omitempty"`
	DownloaderOptions  struct {
		HTTPChunkSize int `json:"http_chunk_size"`
	} `json:"downloader_options,omitempty"`
}

func (contentFormat *ContentFormat) FilterFormats(condition string) {
	filtered := make([]Format, 0, len(contentFormat.Formats))
	for _, elem := range contentFormat.Formats {
		if !strings.Contains(elem.Format, condition) {
			filtered = append(filtered, elem)
		}
	}
	contentFormat.Formats = filtered
}

func (contentFormat *ContentFormat) Sort() {
	sort.Slice(contentFormat.Formats, func(i, j int) bool {
		a := contentFormat.Formats[i]
		b := contentFormat.Formats[j]

		if a.Width*a.Height != b.Width*b.Height {
			return a.Width*a.Height > b.Width*b.Height
		}

		if a.Fps != 0 && b.Fps != 0 && a.Fps != b.Fps {
			return a.Fps > b.Fps
		}

		if a.Vbr != 0 && b.Vbr != 0 && a.Vbr != b.Vbr {
			return a.Vbr > b.Vbr
		}

		return a.Filesize > b.Filesize
	})
}

type Thumbnails struct {
	URL        string `json:"url"`
	Preference int    `json:"preference"`
	ID         string `json:"id"`
	Height     int    `json:"height,omitempty"`
	Width      int    `json:"width,omitempty"`
	Resolution string `json:"resolution,omitempty"`
}

type ContentFormat struct {
	ID                string   `json:"id"`
	Title             string   `json:"title"`
	Formats           []Format `json:"formats"`
	Thumbnails        []Thumbnails
	Thumbnail         string        `json:"thumbnail"`
	Description       string        `json:"description"`
	ChannelID         string        `json:"channel_id"`
	ChannelURL        string        `json:"channel_url"`
	Duration          int           `json:"duration"`
	ViewCount         int           `json:"view_count"`
	AverageRating     interface{}   `json:"average_rating"`
	AgeLimit          int           `json:"age_limit"`
	WebpageURL        string        `json:"webpage_url"`
	Categories        []string      `json:"categories"`
	Tags              []string      `json:"tags"`
	PlayableInEmbed   bool          `json:"playable_in_embed"`
	LiveStatus        string        `json:"live_status"`
	MediaType         string        `json:"media_type"`
	ReleaseTimestamp  interface{}   `json:"release_timestamp"`
	FormatSortFields  []string      `json:"_format_sort_fields"`
	AutomaticCaptions []interface{} `json:"automatic_captions"`
	Subtitles         interface{}   `json:"subtitles"`
	CommentCount      int           `json:"comment_count"`
	Chapters          []struct {
		StartTime int    `json:"start_time"`
		Title     string `json:"title"`
		EndTime   int    `json:"end_time"`
	} `json:"chapters"`
	Heatmap []struct {
		StartTime int     `json:"start_time"`
		EndTime   float64 `json:"end_time"`
		Value     float64 `json:"value"`
	} `json:"heatmap"`
	LikeCount            int         `json:"like_count"`
	Channel              string      `json:"channel"`
	ChannelFollowerCount int         `json:"channel_follower_count"`
	Uploader             string      `json:"uploader"`
	UploaderID           string      `json:"uploader_id"`
	UploaderURL          string      `json:"uploader_url"`
	UploadDate           string      `json:"upload_date"`
	Timestamp            int         `json:"timestamp"`
	Availability         string      `json:"availability"`
	OriginalURL          string      `json:"original_url"`
	WebpageURLBasename   string      `json:"webpage_url_basename"`
	WebpageURLDomain     string      `json:"webpage_url_domain"`
	Extractor            string      `json:"extractor"`
	ExtractorKey         string      `json:"extractor_key"`
	Playlist             interface{} `json:"playlist"`
	PlaylistIndex        interface{} `json:"playlist_index"`
	DisplayID            string      `json:"display_id"`
	Fulltitle            string      `json:"fulltitle"`
	DurationString       string      `json:"duration_string"`
	ReleaseYear          interface{} `json:"release_year"`
	IsLive               bool        `json:"is_live"`
	WasLive              bool        `json:"was_live"`
	RequestedSubtitles   interface{} `json:"requested_subtitles"`
	HasDrm               interface{} `json:"_has_drm"`
	Epoch                int         `json:"epoch"`
	RequestedFormats     []struct {
		Asr                interface{} `json:"asr"`
		Filesize           int         `json:"filesize"`
		FormatID           string      `json:"format_id"`
		FormatNote         string      `json:"format_note"`
		SourcePreference   int         `json:"source_preference"`
		Fps                int         `json:"fps"`
		AudioChannels      interface{} `json:"audio_channels"`
		Height             int         `json:"height"`
		Quality            int         `json:"quality"`
		HasDrm             bool        `json:"has_drm"`
		Tbr                float64     `json:"tbr"`
		FilesizeApprox     int         `json:"filesize_approx"`
		URL                string      `json:"url"`
		Width              int         `json:"width"`
		Language           interface{} `json:"language"`
		LanguagePreference int         `json:"language_preference"`
		Preference         interface{} `json:"preference"`
		Ext                string      `json:"ext"`
		Vcodec             string      `json:"vcodec"`
		Acodec             string      `json:"acodec"`
		DynamicRange       string      `json:"dynamic_range"`
		Container          string      `json:"container"`
		DownloaderOptions  struct {
			HTTPChunkSize int `json:"http_chunk_size"`
		} `json:"downloader_options"`
		Protocol    string  `json:"protocol"`
		VideoExt    string  `json:"video_ext"`
		AudioExt    string  `json:"audio_ext"`
		Abr         int     `json:"abr"`
		Vbr         float64 `json:"vbr"`
		Resolution  string  `json:"resolution"`
		AspectRatio float64 `json:"aspect_ratio"`
		HTTPHeaders struct {
			UserAgent      string `json:"User-Agent"`
			Accept         string `json:"Accept"`
			AcceptLanguage string `json:"Accept-Language"`
			SecFetchMode   string `json:"Sec-Fetch-Mode"`
		} `json:"http_headers"`
		Format string `json:"format"`
	} `json:"requested_formats"`
	Format         string      `json:"format"`
	FormatID       string      `json:"format_id"`
	Ext            string      `json:"ext"`
	Protocol       string      `json:"protocol"`
	Language       string      `json:"language"`
	FormatNote     string      `json:"format_note"`
	FilesizeApprox int         `json:"filesize_approx"`
	Tbr            float64     `json:"tbr"`
	Width          int         `json:"width"`
	Height         int         `json:"height"`
	Resolution     string      `json:"resolution"`
	Fps            int         `json:"fps"`
	DynamicRange   string      `json:"dynamic_range"`
	Vcodec         string      `json:"vcodec"`
	Vbr            float64     `json:"vbr"`
	StretchedRatio interface{} `json:"stretched_ratio"`
	AspectRatio    float64     `json:"aspect_ratio"`
	Acodec         string      `json:"acodec"`
	Abr            float64     `json:"abr"`
	Asr            int         `json:"asr"`
	AudioChannels  int         `json:"audio_channels"`
	_Filename      string      `json:"_filename"`
	Filename       string      `json:"filename"`
	Type           string      `json:"_type"`
	Version        struct {
		Version        string      `json:"version"`
		CurrentGitHead interface{} `json:"current_git_head"`
		ReleaseGitHead string      `json:"release_git_head"`
		Repository     string      `json:"repository"`
	} `json:"_version"`
}
