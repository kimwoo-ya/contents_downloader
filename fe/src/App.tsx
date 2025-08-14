import { useState } from 'react';
import Health from './component/health/health';
import Content from './component/content/content';
import { Box } from '@chakra-ui/react';

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('Not checked yet');

  return (
    <div className="App">
      <header className="App-header">
        <Health />
      </header>
      <Content />
      <Box height={'125px'}>&nbsp;</Box>
    </div>
  );
}

export default App;
