import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Badge, Box, Button, Flex } from '@chakra-ui/react';

const Health = () => {
  const [healthStatus, setHealthStatus] = useState<string>('Not checked yet');

  const handleHealthCheck = async () => {
    setHealthStatus('Checking...');
    try {
      const response = await api.get('/be/api/v1/healthz');
      if (response.status / 100 == 2) {
        setHealthStatus(`Success`);
      } else if (response.status / 100 == 4 || response.status / 100 == 5) {
        setHealthStatus(`Failed`);
      }
    } catch (error: any) {
      let errorMessage = 'An unknown error occurred';
      if (error.response) {
        errorMessage = `Error: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Error: No response received from server.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      setHealthStatus(errorMessage);
      console.error('API Call failed', error);
    }
  };
  useEffect(() => {
    handleHealthCheck();
  }, []);

  return (
    <>
      {/*<Flex gap="4" justify="center">*/}
      <Box height="10">
        <>
          <Flex justify="right" align="center" style={{ padding: 10 }}>
            <Box padding={1.5}>
              {healthStatus == 'Not checked yet' ? (
                <>
                  <Badge size={'lg'}>Default</Badge>
                </>
              ) : healthStatus == 'Success' ? (
                <>
                  <Badge size={'lg'} colorPalette="green" borderRadius={'lg'}>
                    {healthStatus}
                  </Badge>
                </>
              ) : (
                <>
                  <Badge size={'lg'} colorPalette="red" borderRadius={'lg'}>
                    {healthStatus}
                  </Badge>
                </>
              )}
            </Box>
            <Box padding={1.5}>
              <Button background={'teal'} color={'white'} variant="subtle" onClick={handleHealthCheck} size={'xs'} borderRadius={'lg'}>
                Health Check
              </Button>
            </Box>
          </Flex>
        </>
      </Box>
      <Box height="10" />
      {/*</Flex>*/}
    </>
  );
};

export default Health;
