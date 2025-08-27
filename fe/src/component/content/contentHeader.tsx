import { Text, Flex, Heading, Highlight } from '@chakra-ui/react';

const ContentHeader = () => {
  return (
    <>
      <Flex justify="center" align="center" style={{ padding: 10 }}>
        <Heading size={'3xl'}>Contents Downloader</Heading>
      </Flex>
      <Flex justify="center" align="center" style={{ padding: 10 }}>
        <Text>
          <Highlight query="Lorem Ipsum" styles={{ color: 'teal.600' }}>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry
          </Highlight>
        </Text>
      </Flex>
    </>
  );
};

export default ContentHeader;
