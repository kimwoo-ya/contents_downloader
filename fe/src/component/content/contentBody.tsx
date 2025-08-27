import { Card, Flex, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import ClearDialog from './clearDialog';
import { isValidUrlPath } from '../../utils/validator';
import ContentInputs from './contentInputs';
import SingleInput from './singleInput';
import MultiInput from './multiInput';
import { LocalHistory } from '../../types/format';

interface ContentBodyProps {
  //  localhistories: LocalHistory[];
  //  setLocalhistories: React.Dispatch<React.SetStateAction<LocalHistory[]>>;
}

const ContentBody = (props: ContentBodyProps) => {
  const SERVER_URL = 'ws://localhost:3333/ws/v1';
  const [lines, setLines] = useState<string[]>([
    'https://x.com/i/status/1952780142654181466',
    'https://x.com/i/status/1955631773942960177'
  ]);
  const [isAllClearDialogOpen, setIsAllClearDialogOpen] = useState<boolean>(false);
  const [validUrlCount, setValidUrlCount] = useState<number>(0);
  const [totalNonEmptyLines, setTotalNonEmptyLines] = useState<number>(0);
  const [selectedFormat, setSelectedFormat] = useState<string>('bestvideo+bestaudio');

  // TextArea의 내용을 업데이트하는 함수
  const updateTextArea = () => {
    const textarea = document.getElementById('expandedTextArea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = lines.join('\n');
    }
  };

  useEffect(() => {
    updateTextArea();
    setValidUrlCount(lines.filter((line) => line.trim().length > 0 && isValidUrlPath(line)).length);
    setTotalNonEmptyLines(lines.filter((line) => line.trim().length > 0).length);
  }, [lines]);

  return (
    <>
      <Flex justify="center" align="center" style={{ padding: 10 }}>
        <Card.Root width={'60%'}>
          <Card.Body gap="2">
            <Card.Title mt="2">🔗 URL Input</Card.Title>
            <Card.Description>Enter one or more URLs to download contents. Suppurts Youtube, Vimeo, Instagram</Card.Description>
            <ContentInputs
              lines={lines}
              setLines={setLines}
              setIsAllClearDialogOpen={setIsAllClearDialogOpen}
              validUrlCount={validUrlCount}
              totalNonEmptyLines={totalNonEmptyLines}
            />
          </Card.Body>
          <Card.Footer>
            <VStack width={'100%'}>
              {validUrlCount == 1 ? (
                <>
                  <SingleInput
                    lines={lines}
                    selectedFormat={selectedFormat}
                    setSelectedFormat={setSelectedFormat}
                    SERVER_URL={SERVER_URL}
                    validUrlCount={validUrlCount}
                    //localhistories={props.localhistories}
                    //setLocalhistories={props.setLocalhistories}
                  />
                </>
              ) : (
                <>
                  <MultiInput
                    lines={lines}
                    SERVER_URL={SERVER_URL}
                    validUrlCount={validUrlCount}
                    //localhistories={props.localhistories}
                    //setLocalhistories={props.setLocalhistories}
                  />
                </>
              )}
            </VStack>
          </Card.Footer>
        </Card.Root>

        <ClearDialog
          lines={lines}
          setLines={setLines}
          isAllClearDialogOpen={isAllClearDialogOpen}
          setIsAllClearDialogOpen={setIsAllClearDialogOpen}
        />
      </Flex>
    </>
  );
};

export default ContentBody;
