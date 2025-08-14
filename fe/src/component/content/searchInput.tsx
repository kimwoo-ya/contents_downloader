import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { MetaData } from './dto/format';
import { MediaRequest } from './dto/request';
import FormatSelector from './formatSelector';
import MediaDownloader from './mediaDownloader';

interface SearchInputProps {
  data?: MediaRequest;
  setData: React.Dispatch<React.SetStateAction<MediaRequest>>;
}

const SearchInput = ({ data, setData }: SearchInputProps) => {
  const [metaData, setMetaData] = useState<MetaData>();
  const [currentUrl, setCurrentUrl] = useState<string>('');

  const handleFormatSelected = (selectedMetaData: MetaData, url: string) => {
    setMetaData(selectedMetaData);
    setCurrentUrl(url);

    setData((prev) => ({
      ...prev,
      format_id: selectedMetaData.formats[0]?.format_id || '',
      uri: url,
      thumbnails: selectedMetaData.thumbnails
    }));
  };

  return (
    <Box>
      <Box width={'70%'}>
        <FormatSelector onFormatSelected={handleFormatSelected} />
      </Box>
      <Box width={'70%'}>
        {metaData && currentUrl && (
          <Box mt="6">
            <MediaDownloader metaData={metaData} requestUrl={currentUrl} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SearchInput;
