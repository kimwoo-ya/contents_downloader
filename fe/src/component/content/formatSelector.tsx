import { InputGroup, Input, Button, Grid, GridItem, Spinner, Box, Flex } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { MetaData } from './dto/format';

interface FormatSelectorProps {
  onFormatSelected: (metaData: MetaData, selectedUrl: string) => void;
}

const FormatSelector = ({ onFormatSelected }: FormatSelectorProps) => {
  const [requestUrl, setRequestUrl] = useState<string>('https://x.com/i/status/1952780142654181466');
  const [metaData, setMetaData] = useState<MetaData>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);

  const SERVER_URL = 'ws://localhost:8080/ws/v1';

  const connectWebSocket = () => {
    // 기존 연결이 있으면 정리
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(SERVER_URL + '/metadata');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('메타데이터 WebSocket 연결됨');
      setIsLoading(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as MetaData;
        setMetaData(data);
        setIsLoading(false);
        // 부모 컴포넌트에 메타데이터와 URL 전달
        onFormatSelected(data, requestUrl);
      } catch (error) {
        console.error('메타데이터 파싱 오류:', error);
        setIsLoading(false);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
      setIsLoading(false);
    };

    ws.onclose = () => {
      console.log('메타데이터 WebSocket 연결 종료');
      setIsLoading(false);
    };
  };

  const normalizeUrl = (value: string) => {
    return value.startsWith('https://') ? value : `https://${value}`;
  };

  const handleSearch = () => {
    setCounter((prev) => prev + 1);
    if (!requestUrl.trim()) {
      console.warn('URL이 비어있습니다');
      return;
    }

    setMetaData(undefined);

    // 연결 상태 확인 및 재연결
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('WebSocket 재연결 시도 중...');
      connectWebSocket();

      // 연결 후 메시지 전송을 위해 잠시 대기
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ uri: requestUrl }));
        } else {
          console.error('재연결 실패');
          setIsLoading(false);
        }
      }, 1000);
      return;
    }

    // 이미 연결된 상태면 바로 전송
    wsRef.current.send(JSON.stringify({ uri: requestUrl }));
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <Box>
      <Flex display="flex">
        <Box flex={7} display="flex" alignItems="center" justifyContent="center">
          <InputGroup startElement="https://" startElementProps={{ color: 'fg.muted' }}>
            <Input
              ps="7ch"
              placeholder="youtube.com"
              variant={'subtle'}
              value={requestUrl.replace('https://', '')}
              onChange={(e) => setRequestUrl(normalizeUrl(e.target.value))}
              disabled={isLoading && counter != 0}
              backgroundColor={'gray.100'}
              borderRadius={'lg'}
            />
          </InputGroup>
        </Box>
        <Box flex={3} display="flex" alignItems="center" justifyContent="center">
          <Button
            onClick={handleSearch}
            background={!isLoading || counter == 0 ? 'blue' : 'gray'}
            disabled={isLoading && counter != 0}
            width={'70%'}
            borderRadius={'lg'}
          >
            {!isLoading || counter == 0 ? 'Search' : <Spinner />}
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default FormatSelector;
