//import { Box } from '@chakra-ui/react';
//import { Text } from '@chakra-ui/react';
//import { Image } from '@chakra-ui/react';
//import { useEffect, useState } from 'react';
//import { MediaRequest } from '../../types/request';

//interface ThumbnailProps {
//  data: MediaRequest;
//}

//const Thumbnail = (props: ThumbnailProps) => {
//  const [url, setUrl] = useState<string>('');

//  useEffect(() => {
//    if (props.data.thumbnails.length > 0) {
//      setUrl(props.data.thumbnails[props.data.thumbnails.length - 1].url);
//    }
//  }, [props.data.thumbnails]);
//  return (
//    <>
//      {/*<Box width={'100%'}>*/}
//      <Box backgroundColor={'gray.100'} width={'70%'} borderRadius={'lg'} padding={1.5}>
//        {props.data.thumbnails.length == 0 ? (
//          <>
//            <Box display="flex" alignItems="center" justifyContent="center" height={250}>
//              <Text fontSize="xl" fontWeight="bold">
//                Empty thumbnail
//              </Text>
//            </Box>
//          </>
//        ) : (
//          <>
//            <Box display="flex" alignItems="center" justifyContent="center">
//              <Image src={url} borderRadius="lg" fit="contain" alt={`thumbnail of media(${url})`} />
//            </Box>
//          </>
//        )}
//      </Box>
//      {/*</Box>*/}
//    </>
//  );
//};

const Thumbnail = () => {};
export default Thumbnail;
