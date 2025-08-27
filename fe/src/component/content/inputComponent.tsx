import { Box, Flex, Input, Button } from '@chakra-ui/react';
import { isValidUrlPath } from '../../utils/validator';

interface InputComponent {
  lines: string[];
  setLines: React.Dispatch<React.SetStateAction<string[]>>;
}

const InputComponent = (props: InputComponent) => {
  const handleInputChange = (index: number, value: string) => {
    props.setLines((prev) => {
      const newLines = [...prev];
      newLines[index] = value;

      // TextArea도 실시간으로 업데이트
      setTimeout(() => {
        const textarea = document.getElementById('expandedTextArea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.value = newLines.join('\n');
        }
      }, 0);
      return newLines;
    });
  };

  const removeInput = (index: number) => {
    props.setLines((prev) => {
      const newLines = prev.filter((_, i) => i !== index);
      // TextArea도 업데이트
      setTimeout(() => {
        const textarea = document.getElementById('expandedTextArea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.value = newLines.join('\n');
        }
      }, 0);
      return newLines;
    });
  };
  return (
    <>
      <Box width={'85%'}>
        {props.lines.length > 0 ? (
          <>
            {props.lines.map((elem, idx) => {
              const isValid = elem.trim().length === 0 || isValidUrlPath(elem);
              const isEmpty = elem.trim().length === 0;

              return (
                <Flex key={idx} justify={'space-between'} padding={1.5}>
                  <Input
                    variant="subtle"
                    value={elem}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    width={'85%'}
                    borderColor={!isValid && !isEmpty ? 'red.300' : undefined}
                    placeholder={`URL ${idx + 1}: https://example.com/video`}
                    _placeholder={{
                      color: isEmpty ? 'gray.400' : 'gray.300',
                      fontSize: 'sm'
                    }}
                  />
                  &nbsp;
                  <Button
                    variant={'ghost'}
                    onClick={() => removeInput(idx)}
                    colorScheme="red"
                    size="sm"
                    opacity={isEmpty ? 0.5 : 1}
                    _hover={{ opacity: 1 }}
                  >
                    ❌
                  </Button>
                </Flex>
              );
            })}
          </>
        ) : (
          //<Text color="gray.500" textAlign="center" padding={4}>
          //  아래 텍스트 영역에 URL을 입력하거나 "Add another URL" 버튼을 클릭하세요
          //</Text>
          <>
            <Box height={'20px'}>&nbsp;</Box>
          </>
        )}
      </Box>
    </>
  );
};

export default InputComponent;
