import { Box, VStack, Collapsible, Textarea, Flex, Button, Tag, Text } from '@chakra-ui/react';
import InputComponent from './inputComponent';
import { isValidUrlPath } from '../../utils/validator';

interface ContentInputsProps {
  lines: string[];
  setLines: React.Dispatch<React.SetStateAction<string[]>>;
  setIsAllClearDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  validUrlCount: number;
  totalNonEmptyLines: number;
}

const ContentInputs = (props: ContentInputsProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const splitLines = value.split('\n');
    // 빈 줄도 포함하여 실시간으로 input 생성 (사용자가 타이핑 중일 수 있음)
    const filtered = splitLines.map((line) => line.trim().toLowerCase());

    props.setLines(filtered);
  };
  return (
    <>
      <Box gap={3} paddingTop={1.5} display="flex" alignItems="center" justifyContent="center">
        <VStack width={'100%'}>
          <InputComponent lines={props.lines} setLines={props.setLines} />

          <Box width={'85%'}>
            <Collapsible.Root>
              <Collapsible.Trigger
                width="100%"
                _hover={{
                  backgroundColor: 'gray.300'
                }}
                padding={2}
                borderRadius="md"
              >
                <Text>Expand for multi-line input</Text>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <Textarea
                  placeholder="여기에 URL을 입력하세요 (각 줄마다 하나씩)&#10;&#10;예시:&#10;https://x.com/i/status/1952780142654181466&#10;https://x.com/i/status/1955631773942960177"
                  onChange={handleChange}
                  rows={6}
                  id="expandedTextArea"
                  marginTop={2}
                  resize="vertical"
                  width={'100%'}
                />
                {/*<Text fontSize="sm" color="gray.600" marginTop={1}>
                          💡 <strong>실시간 동기화:</strong> 여기에 입력하면 위쪽에 개별 입력창이 자동으로 생성됩니다
                        </Text>*/}
              </Collapsible.Content>
            </Collapsible.Root>
          </Box>
        </VStack>
      </Box>
      <Box>
        <Flex width={'100%'} align={'center'} justify={'space-between'}>
          <Flex gap={1.5} width={'100%'} align={'center'} justify={'flex-start'} maxWidth="70%">
            <Button
              variant="outline"
              size={'lg'}
              onClick={() => {
                props.setLines((prev) => [...prev, '']);
              }}
              colorScheme="blue"
            >
              ➕ Add another URL
            </Button>
            <Button
              variant="outline"
              size={'lg'}
              onClick={() => {
                var beforeClearLinesLen = props.lines.length;
                var afterClearLinesLin = props.lines.filter((elem, i) => isValidUrlPath(elem)).length;
                if (beforeClearLinesLen == afterClearLinesLin) {
                  props.setIsAllClearDialogOpen(true);
                  return;
                }
                props.setLines(props.lines.filter((elem, i) => isValidUrlPath(elem)));
              }}
              colorScheme="blue"
            >
              Clear
            </Button>
          </Flex>
          <Flex>
            <Tag.Root size="lg" colorPalette={props.validUrlCount > 0 ? 'green' : 'gray'}>
              <Tag.Label>{props.validUrlCount} Valid URLs</Tag.Label>
            </Tag.Root>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};

export default ContentInputs;
