import { Button, Box, Progress, Flex, Text, SimpleGrid, HStack } from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { Format, MetaData } from './dto/format';
import { NativeSelect } from '@chakra-ui/react';
import { DownloadResponse } from './dto/request';
import api from '../../utils/api';

interface MediaDownloaderProps {
  metaData: MetaData;
  requestUrl: string;
}

const MediaDownloader = ({ metaData, requestUrl }: MediaDownloaderProps) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('bestvideo+bestaudio');
  const [downloadProgress, setDownloadProgress] = useState<DownloadResponse>();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  const SERVER_URL = 'ws://localhost:8080/ws/v1';

  useEffect(() => {
    // 메타데이터가 변경될 때 기본 포맷 설정
    if (metaData && metaData.formats.length > 0) {
      //setSelectedFormat(metaData.formats[0].format_id);
      setSelectedFormat('bestvideo+bestaudio');
      setDownloadProgress(undefined);
      setIsDownloading(false);
    }
  }, [metaData]);

  const handleDownload = () => {
    if (!selectedFormat || !requestUrl) {
      console.warn('포맷 또는 URL이 선택되지 않았습니다');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(undefined);

    // 기존 연결이 있으면 정리
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(SERVER_URL + '/media');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('다운로드 WebSocket 연결됨');
      ws.send(JSON.stringify({ uri: requestUrl, format_id: selectedFormat }));
    };

    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data) as DownloadResponse;
        setDownloadProgress(response);

        // 다운로드 완료 시 자동으로 파일 다운로드 시작
        console.log('ws.onmessage', response._percent, response.filename);
        if (response.filename) {
          //  setTimeout(() => {
          downloadFile(response.filename);
          //  }, 500);
        }
      } catch (error) {
        console.error('다운로드 응답 파싱 오류:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('다운로드 WebSocket 오류:', error);
      setIsDownloading(false);
    };

    ws.onclose = () => {
      console.log('다운로드 WebSocket 연결 종료');
      setIsDownloading(false);
    };
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

      console.log('파일 다운로드 완료:', filename);
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  if (!metaData) {
    return null;
  }

  return (
    <Box>
      {/*<Grid templateColumns="repeat(6, 1fr)" gap="10">
        <GridItem colSpan={1} />
        <GridItem colSpan={4}>
          <Box>*/}
      <Flex display="flex">
        <Box flex={7} display="flex" alignItems="center" justifyContent="center">
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              placeholder="Select formats"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              //disabled={isDownloading}
              borderRadius={'lg'}
              backgroundColor={'gray.100'}
            >
              <option key={'bestvideo+bestaudio'} value={'bestvideo+bestaudio'}>
                best
              </option>
              {metaData.formats.map((format: Format) => (
                <option key={format.format_id} value={format.format_id}>
                  {format.format}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>

        <Box flex={3} display="flex" alignItems="center" justifyContent="center">
          <Button
            onClick={handleDownload}
            background={!isDownloading ? 'green' : 'gray'}
            disabled={isDownloading}
            width={'70%'}
            borderRadius={'lg'}
          >
            {!isDownloading ? 'Download' : 'Downloading...'}
          </Button>
        </Box>
      </Flex>
      {/*</Box>*/}

      <Box display="flex" alignItems="center" justifyContent="center" padding={3}>
        <SimpleGrid columns={[1]} gap="10px" width="100%">
          {downloadProgress && downloadProgress._percent >= 0 && (
            <Box>
              <Progress.Root value={Math.floor(downloadProgress._percent)} defaultValue={0} maxW="lg">
                <HStack gap="5">
                  <Progress.Label>Progress</Progress.Label>
                  <Progress.Track flex="1">
                    <Progress.Range />
                  </Progress.Track>
                  <Progress.ValueText>{`${downloadProgress._percent.toFixed(0)}%`}</Progress.ValueText>
                </HStack>
              </Progress.Root>
            </Box>
          )}

          {downloadProgress && downloadProgress.filename && (
            <Box textAlign="center">
              <Text fontSize="md" color="green.500" fontWeight="bold">
                다운로드 완료! 파일이 자동으로 다운로드됩니다.
              </Text>
              <Text fontSize="sm" color="gray.500" mt="1">
                파일명: {downloadProgress.filename}
              </Text>
            </Box>
          )}
        </SimpleGrid>
      </Box>
      {/*</GridItem>
        <GridItem colSpan={1} />*/}
      {/*</Grid>*/}
    </Box>
  );
};

export default MediaDownloader;
