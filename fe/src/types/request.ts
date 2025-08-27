import { Thumbnail } from './format';

export interface MediaRequest {
  format_id: string;
  uri: string;
  thumbnails: Thumbnail[];
}

export interface DownloadResponse {
  _percent: number;
  downloaded_bytes: number;
  eta: number;
  status: string;
  filename: string;
  total_bytes: number;
}

export interface BulkDownloadResponse {
  _percent: number;
  downloaded_bytes: number;
  eta: number;
  originalUrl: string;
  requestedUri?: string;
  status: string;
  filename: string;
  fragment_count: number;
  fragment_index: number;
}
