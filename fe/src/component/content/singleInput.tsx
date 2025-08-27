import { NativeSelect, Button, Box, HStack, Progress } from '@chakra-ui/react';
import { Format, LocalHistory, MetaData } from '../../types/format';
import { useSingleDownloader } from '../../hooks/useSingleDownloadWebSocket';
import { useEffect, useState } from 'react';
import { useCommand } from '../../hooks/useCommandWebSocket';
import { isValidUrlPath } from '../../utils/validator';
import { addHistoryUnique } from '../../utils/storage';

interface SingleInputProps {
  lines: string[];
  selectedFormat: string;
  setSelectedFormat: React.Dispatch<React.SetStateAction<string>>;
  SERVER_URL: string;
  validUrlCount: number;
  //  localhistories: LocalHistory[];
  //  setLocalhistories: React.Dispatch<React.SetStateAction<LocalHistory[]>>;
}

const SingleInput = (props: SingleInputProps) => {
  const [mediaMetaData, setMediaMetaData] = useState<MetaData>();
  const { downloadProgress, isProcessing, execute, downloadSingleFile } = useSingleDownloader(props.SERVER_URL);
  const { lastMessage, state, executeCommand } = useCommand(props.SERVER_URL + '/metadata');
  const [currentHistory, setCurrentHistory] = useState<LocalHistory>({
    filename: '',
    format: props.selectedFormat,
    reqeuestDate: Date.now(),
    originalUrl: props.lines[0],
    thumbnailUrl: '',
    downloadUrl: ''
  });

  const handleMetadataSubmit = () => {
    if (props.lines.length == 1) {
      console.log('request', JSON.stringify({ uri: props.lines[0] }));
      var filteredSingleUrl = props.lines.filter((line) => line.trim().length > 0 && isValidUrlPath(line))[0];
      executeCommand(JSON.stringify({ uri: filteredSingleUrl }));
      setCurrentHistory((prev) => ({
        ...prev,
        reqeuestDate: Date.now()
      }));
      return;
    }
  };

  useEffect(() => {
    if (downloadProgress) {
      console.log('downloadProgress', downloadProgress);
      setCurrentHistory((prev) => ({
        ...prev,
        filename: downloadProgress.filename,
        downloadUrl: `/be/api/v1/download/${downloadProgress.filename}`
      }));
    }
  }, [downloadProgress]);

  useEffect(() => {
    if (lastMessage) {
      setMediaMetaData(JSON.parse(lastMessage) as MetaData);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (mediaMetaData) {
      var sortedThumbnails = mediaMetaData.thumbnails.sort((o1, o2) => {
        return o2.height - o1.height;
      });
      setCurrentHistory((prev) => ({
        ...prev,
        thumbnailUrl: sortedThumbnails[0].url
      }));
    }
  }, [mediaMetaData]);

  useEffect(() => {
    if (currentHistory) {
      console.log('currentHistory', currentHistory);
      if (isFullyFilled(currentHistory)) {
        addHistoryUnique(currentHistory);
        //props.setLocalhistories((prev) => {
        //  const exists = prev.some((item) => item.filename === currentHistory.filename);
        //  if (exists) {
        //    return prev;
        //  }
        //  return [...prev, currentHistory];
        //});
      }
    }
  }, [currentHistory]);

  const isFullyFilled = (history: LocalHistory) => {
    return Object.values(history).every((v) => v !== undefined && v !== null && v !== '');
  };

  return (
    <>
      <Button
        variant="outline"
        size={'lg'}
        width={'100%'}
        colorScheme={props.validUrlCount > 0 ? 'green' : 'gray'}
        disabled={props.validUrlCount === 0}
        onClick={handleMetadataSubmit}
      >
        {props.validUrlCount > 0 ? `Request (${props.validUrlCount} URLs)` : 'No valid URLs to process'}
      </Button>
      {mediaMetaData && mediaMetaData.formats.length > 0 ? (
        <>
          <HStack width={'100%'} align={'center'} justify={'space-between'}>
            <NativeSelect.Root size="lg" width={'70%'}>
              <NativeSelect.Field
                placeholder="Select formats"
                value={props.selectedFormat}
                onChange={(e) => {
                  props.setSelectedFormat(e.target.value);
                  setCurrentHistory((prev) => ({
                    ...prev,
                    format: e.target.value
                  }));
                }}
                borderRadius={'lg'}
                backgroundColor={'gray.100'}
              >
                <option key={'bestvideo+bestaudio'} value={'bestvideo+bestaudio'}>
                  best
                </option>
                {mediaMetaData.formats.map((format: Format) => (
                  <option key={format.format_id} value={format.format_id}>
                    {format.format}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <Button
              width={'30%'}
              onClick={() => {
                console.log('selectedFormat', props.selectedFormat, 'urls', props.lines[0]);
                execute(props.lines[0], props.selectedFormat);
              }}
              disabled={isProcessing}
            >
              Download
            </Button>
          </HStack>
        </>
      ) : (
        <></>
      )}
      {downloadProgress && downloadProgress._percent ? (
        <>
          <Box width="100%" margin={1.5}>
            <Progress.Root
              value={Math.floor(downloadProgress._percent)}
              defaultValue={0}
              maxW="lg"
              onClick={() => {
                console.log('hi');
              }}
            >
              <HStack gap="5">
                <Progress.Label>Progress</Progress.Label>
                <Progress.Track flex="1">
                  <Progress.Range />
                </Progress.Track>
                <Progress.ValueText>{`${downloadProgress._percent.toFixed(0)}%`}</Progress.ValueText>
              </HStack>
            </Progress.Root>
          </Box>
        </>
      ) : (
        <></>
      )}
    </>
  );
};
export default SingleInput;
