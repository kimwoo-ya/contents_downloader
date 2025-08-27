import { useState, useEffect, useRef } from 'react';
import { DownloadResponse } from '../types/request';
import api from '../utils/api';
import { useCommand } from './useCommandWebSocket';

export const useSingleDownloader = (serverUrl?: string) => {
  if (!serverUrl) {
    serverUrl = 'ws://localhost:3333/ws/v1';
  }
  const wsRef = useRef<WebSocket | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadResponse>();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { lastMessage, state, executeCommand } = useCommand(serverUrl + '/media');

  const execute = (requestUrl: string, selectedFormat: string) => {
    executeCommand(JSON.stringify({ uri: requestUrl, format_id: selectedFormat }));
  };

  const downloadSingleFile = async (filename: string) => {
    try {
      const response = await api.get(`/be/api/v1/download/${filename}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data as BlobPart]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('File download failed:', error);
    }
  };
  useEffect(() => {
    if (lastMessage) {
      setDownloadProgress(JSON.parse(lastMessage) as DownloadResponse);
    }
  }, [lastMessage]);
  useEffect(() => {
    if (downloadProgress && downloadProgress.filename) {
      downloadSingleFile(downloadProgress.filename);
      setIsProcessing(false);
    }
  }, [downloadProgress]);

  return { downloadProgress, isProcessing, execute, downloadSingleFile };
};
