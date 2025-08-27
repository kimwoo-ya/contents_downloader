import { useState, useEffect } from 'react';
import { BulkDownloadResponse } from '../types/request';
import api from '../utils/api';
import { useCommand } from './useCommandWebSocket';

export const useBulkDownloader = (serverUrl: string) => {
  const [contents, setContents] = useState<Map<string, BulkDownloadResponse>>(new Map());
  const [isDownloading, setIsDownloading] = useState(false);
  const { lastMessage, state, executeCommand } = useCommand(serverUrl);

  useEffect(() => {
    if (lastMessage) {
      const response = JSON.parse(lastMessage) as BulkDownloadResponse;
      setContents((prev) => {
        const newMap = new Map(prev);
        newMap.set(response.filename, response);
        return newMap;
      });

      if (response.status === 'complete' || response.status === 'error') {
        // handle completion, maybe check if all are done
      }
    }
  }, [lastMessage]);

  const executeCommandBulk = (urls: string[], formatId: string) => {
    if (urls.length === 0) {
      return;
    }
    setContents(new Map());
    setIsDownloading(true);
    executeCommand(JSON.stringify({ uris: urls, format_id: 'bestvideo+bestaudio' }));
  };

  const downloadFile = async (filename: string) => {
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

  const downloadFileByZip = async (filenames: string[]) => {
    try {
      const response = await api.post(
        `/be/api/v1/download/bulk`,
        { filenames: filenames },
        {
          responseType: 'blob'
        }
      );
      const blob = new Blob([response.data as BlobPart], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'download.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('File download failed:', error);
    }
  };

  return { contents, isDownloading, executeCommandBulk, downloadFile, downloadFileByZip };
};
