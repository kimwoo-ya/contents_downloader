import { useEffect, useState } from 'react';
import Health from './component/health/health';
import { Box, Text } from '@chakra-ui/react';
import ContentHeader from './component/content/contentHeader';
import ContentBody from './component/content/contentBody';
import History from './component/content/history';
import { LocalHistory } from './types/format';

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('Not checked yet');
  //  const [localhistories, setLocalHistories] = useState<LocalHistory[]>([]);

  useEffect(() => {
    let stored = localStorage.getItem('localhistories');
    let retrievedHistory: LocalHistory[];

    if (stored) {
      retrievedHistory = JSON.parse(stored) as LocalHistory[];
    } else {
      retrievedHistory = [];
      localStorage.setItem('localhistories', JSON.stringify([]));
    }

    //setLocalHistories(retrievedHistory);
    //console.log('retrievedHistory', retrievedHistory);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Health />
      </header>
      <ContentHeader />
      <ContentBody //localhistories={localhistories} setLocalhistories={setLocalHistories}
      />
      {/*<History localhistories={localhistories} setLocalhistories={setLocalHistories} />*/}
      <Box height={'125px'}>&nbsp;</Box>
    </div>
  );
}

export default App;
