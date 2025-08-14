import { Box, Grid, GridItem, SimpleGrid } from '@chakra-ui/react';
import Thumbnail from './thumbnail';
import SearchInput from './searchInput';
import { useEffect, useState } from 'react';
import { MediaRequest } from './dto/request';
import { Tabs } from '@chakra-ui/react';
import MultipleInput from './multipleInput';

const Content = () => {
  const [data, setData] = useState<MediaRequest>({
    format_id: '',
    uri: '',
    thumbnails: []
  });

  useEffect(() => {
    console.log('data changed', data);
  }, [data]);
  return (
    <>
      <Box>
        <Grid templateColumns="repeat(10, 1fr)" gap="10">
          <GridItem colSpan={1} />
          <GridItem colSpan={8}>
            <Tabs.Root lazyMount unmountOnExit defaultValue="singleTab" variant={'subtle'}>
              <Tabs.List>
                <Tabs.Trigger value="singleTab">Single</Tabs.Trigger>
                <Tabs.Trigger value="mulitpleTab">Multiple</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="singleTab">
                <SimpleGrid columns={[1]} gap="10px">
                  <Thumbnail data={data} />
                  <SearchInput data={data} setData={setData} />
                </SimpleGrid>
              </Tabs.Content>
              <Tabs.Content value="mulitpleTab">
                <SimpleGrid columns={[1]} gap="10px">
                  <MultipleInput />
                </SimpleGrid>
              </Tabs.Content>
            </Tabs.Root>
          </GridItem>
          <GridItem colSpan={1} />
        </Grid>
      </Box>
    </>
  );
};

export default Content;
