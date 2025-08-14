import { Box, Button, Field, Flex, Grid, GridItem, Progress, SimpleGrid, Spinner, Textarea, Checkbox } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { BulkDownloadResponse } from './dto/request';
import api from '../../utils/api';
import { count } from 'console';

const MultipleInput = () => {
  const SERVER_URL = 'ws://localhost:8080/ws/v1';
  const [downloadProgress, setDownloadProgress] = useState<BulkDownloadResponse>();
  const [isInProgress, setIsInProgress] = useState<boolean>(false);
  const [urls, setUrls] = useState<string[]>(['https://x.com/i/status/1952780142654181466', 'https://youtu.be/8PDDjCW5XWw']);
  const wsRef = useRef<WebSocket | null>(null);
  const [contents, setContents] = useState<Map<string, BulkDownloadResponse>>(new Map([]));
  const [isZipEnabled, setIsZipEnabled] = useState<boolean>(true);

  const handleDownload = () => {
    console.log('urls', urls);
    if (urls.length == 0) {
      console.warn('포맷 또는 URL이 선택되지 않았습니다');
      return;
    }

    // 기존 연결이 있으면 정리
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(SERVER_URL + '/media/bulk');
    wsRef.current = ws;

    ws.onopen = () => {
      setIsInProgress(true);
      console.log('다운로드 WebSocket 연결됨');
      ws.send(JSON.stringify({ uris: urls, format_id: 'bestvideo+bestaudio' }));
    };

    ws.onmessage = (event) => {
      try {
        setIsInProgress(true);
        const response = JSON.parse(event.data) as BulkDownloadResponse;
        setDownloadProgress(response);

        setContents((prev) => {
          const newMap = new Map(prev);
          newMap.set(response.filename, response);
          return newMap;
        });

        // 다운로드 완료 시 자동으로 파일 다운로드 시작
        if (response.filename) {
          //  setTimeout(() => {
          //  downloadFile(response.filename);
          //  }, 500);
        }
      } catch (error) {
        console.error('다운로드 응답 파싱 오류:', error);
        setIsInProgress(false);
      }
    };

    ws.onerror = (error) => {
      console.error('다운로드 WebSocket 오류:', error);
      setIsInProgress(false);
    };

    ws.onclose = () => {
      console.log('다운로드 WebSocket 연결 종료');
      setIsInProgress(false);
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

      console.log('파일 다운로드 완료:', 'download.zip');
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
    }
  };

  useEffect(() => {
    if (urls.length > 0) {
      console.log(urls);
    }
  }, [urls]);

  useEffect(() => {
    if (contents && contents.size == urls.length) {
      var isEverythingCompleted = true;
      var filenames: string[] = [];
      Array.from(contents.entries()).map(([key, value]) => {
        filenames.push(value.filename);
        if (!value.status.startsWith('complete')) {
          isEverythingCompleted = false;
          return;
        }
      });
      if (isEverythingCompleted && isZipEnabled) {
        downloadFileByZip([...new Set(filenames)]);
      }
    }
  }, [contents]);

  return (
    <>
      <Box width={'70%'}>
        <Field.Root>
          <Field.Label>Content URLs</Field.Label>
          <Textarea
            rows={15}
            placeholder={`https://x.com/i/status/1952780142654181466
https://youtu.be/8PDDjCW5XWw`}
            defaultValue={`https://x.com/i/status/1952780142654181466
https://youtu.be/8PDDjCW5XWw`}
            onChange={(e: any) => {
              const lines = (e.target.value as string)
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.length > 0);

              setUrls([...new Set(lines)]);
            }}
            borderRadius={'lg'}
          />
        </Field.Root>
      </Box>
      <Box width={'70%'}>
        <Flex display="flex">
          <Box flex={7} display="flex" alignItems="center" justifyContent="right">
            <Box padding={3}>
              <Checkbox.Root
                checked={isZipEnabled}
                onCheckedChange={(e: any) => {
                  setIsZipEnabled((prev) => !prev);
                }}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>Download by Zip</Checkbox.Label>
              </Checkbox.Root>
            </Box>
            <Box width={'15%'} padding={3}>
              <Button
                onClick={handleDownload}
                disabled={isInProgress}
                width={'100%'}
                background={!isInProgress ? 'blue' : 'gray'}
                borderRadius={'lg'}
              >
                {!isInProgress ? 'Start' : <Spinner />}
              </Button>
            </Box>
          </Box>
        </Flex>
      </Box>
      <Box width={'70%'}>
        <Flex display="flex" alignItems="center" justifyContent="center">
          <SimpleGrid columns={[1]} width={'100%'} gapY={7}>
            {contents.size > 0 ? (
              Array.from(contents.entries()).map(([key, value]) => {
                return (
                  <>
                    <Box
                      backgroundColor={'gray.100'}
                      borderRadius={'lg'}
                      alignItems="center"
                      justifyContent="center"
                      onClick={() => {
                        console.log('downloadbutton clicked', value.filename, 'status', value.status);
                        if (value.status.startsWith('complete')) {
                          downloadFile(value.filename);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                      _hover={{
                        backgroundColor: 'gray.300'
                      }}
                    >
                      <Progress.Root value={value._percent ? Math.floor(value._percent) : 100} defaultValue={0} height="40px" width="100%">
                        <Grid
                          templateColumns="repeat(6, 1fr)"
                          gap="10"
                          width={'100%'}
                          alignItems="center"
                          justifyContent="center"
                          height={'100%'}
                        >
                          <GridItem colSpan={2}>
                            <Progress.Label style={{ cursor: 'pointer' }}>
                              &nbsp;&nbsp;&nbsp;...{key.substring(key.length / 3, key.length)}
                            </Progress.Label>
                          </GridItem>
                          <GridItem colSpan={3}>
                            <Progress.Track flex="1">
                              <Progress.Range />
                            </Progress.Track>
                          </GridItem>
                          <GridItem colSpan={1}>
                            <Progress.ValueText>{`${value._percent ? Math.floor(value._percent) : 100}%`}</Progress.ValueText>
                          </GridItem>
                        </Grid>
                      </Progress.Root>
                    </Box>
                  </>
                );
              })
            ) : (
              <></>
            )}
            {/*</Box>*/}
          </SimpleGrid>
        </Flex>
      </Box>
    </>
  );
};
export default MultipleInput;
