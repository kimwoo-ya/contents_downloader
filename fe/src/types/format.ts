export interface Format {
  format_id: string;
  ext: string;
  protocol: string;
  vcodec: string;
  url: string;
  width: number;
  height: number;
  audio_ext: string;
  video_ext: string;
  vbr: number;
  abr: number;
  tbr: number;
  resolution: string;
  aspect_ratio: number;
  filesize_approx?: number;
  http_headers: HttpHeaders;
  format: string;
  dynamic_range: string;
  downloader_options: DownloaderOptions;
  acodec?: string;
  manifest_url?: string;
}

export interface HttpHeaders {
  'User-Agent': string;
  Accept: string;
  'Accept-Language': string;
  'Sec-Fetch-Mode': string;
}

export interface DownloaderOptions {
  http_chunk_size: number;
}

export interface Thumbnail {
  url: string;
  preference: number;
  id: string;
  height: number;
  width: number;
  resolution: string;
}

export interface MetaData {
  formats: Format[];
  thumbnails: Thumbnail[];
}

export interface LocalHistory {
  filename: string;
  format: string;
  reqeuestDate: number;
  originalUrl: string;
  thumbnailUrl: string;
  downloadUrl: string;
}
