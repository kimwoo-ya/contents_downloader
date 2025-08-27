import { HStack, Button, Box, Progress } from '@chakra-ui/react';
import { LocalHistory } from '../../types/format';
import { useBulkDownloader } from '../../hooks/useBulkDownloadWebSocket';
import { isValidUrlPath } from '../../utils/validator';
import { useEffect, useState } from 'react';
import { BulkDownloadResponse } from '../../types/request';
import { addHistoryUnique } from '../../utils/storage';

interface MultiInputProps {
  lines: string[];
  SERVER_URL: string;
  validUrlCount: number;
  //  localhistories: LocalHistory[];
  //  setLocalhistories: React.Dispatch<React.SetStateAction<LocalHistory[]>>;
}

const MultiInput = (props: MultiInputProps) => {
  //  const [currentLocalHistories, setCurrentLocalHistories] = useState<LocalHistory[]>([]);
  const { contents, isDownloading, executeCommandBulk, downloadFile, downloadFileByZip } = useBulkDownloader(
    props.SERVER_URL + '/media/bulk'
  );

  const handleSubmit = () => {
    const requestMessage = {
      urls: [...new Set(props.lines)],
      format_id: 'bestvideo+bestaudio'
    };
    //console.log('bulk-request', JSON.stringify(requestMessage));
    //var tmp: LocalHistory[] = [];
    //for (var line of new Set(props.lines)) {
    //  tmp.push({
    //    filename: '',
    //    format: requestMessage.format_id,
    //    reqeuestDate: Date.now(),
    //    originalUrl: line,
    //    thumbnailUrl: '',
    //    downloadUrl: ''
    //  });
    //}
    //setCurrentLocalHistories(tmp);

    executeCommandBulk(
      props.lines.filter((line) => line.trim().length > 0 && isValidUrlPath(line)),
      'bestvideo+bestaudio'
    );
  };
  //  const refreshCurrentLocalHistories = (contents: Map<string, BulkDownloadResponse>) => {
  //    for (var value of Array.from(contents.values())) {
  //      var tmp: LocalHistory[] = currentLocalHistories;
  //      for (var currentLocalHistory of tmp) {
  //        if (currentLocalHistory.originalUrl == value.originalUrl || currentLocalHistory.originalUrl == value.requestedUri) {
  //          if (value.filename != '') {
  //            currentLocalHistory.filename = value.filename;
  //            currentLocalHistory.downloadUrl = `/be/api/v1/download/${value.filename}`;
  //          }
  //          break;
  //        }
  //      }
  //      setCurrentLocalHistories(tmp);
  //    }
  //  };

  useEffect(() => {
    if (contents?.size && contents.size >= props.lines.filter((line) => line.trim().length > 0 && isValidUrlPath(line)).length) {
      //  refreshCurrentLocalHistories(contents);
      const completed = Array.from(contents.values()).every((v) => v.status.startsWith('complete'));
      if (completed) {
        downloadFileByZip(Array.from(contents.keys()));
        console.log('bulk-download(complete-step)....', contents);

        return;
      }

      console.log('bulk-download....', contents);
    }
  }, [contents]);

  //  useEffect(() => {
  //    if (currentLocalHistories) {
  //      console.log('bulk-currentLocalHistories', currentLocalHistories);
  //      for (var currentLocalHistory of currentLocalHistories) {
  //        addHistoryUnique(currentLocalHistory);
  //      }
  //    }
  //  }, [currentLocalHistories]);

  return (
    <>
      <Button
        variant="outline"
        size={'lg'}
        width={'100%'}
        colorScheme={props.validUrlCount > 0 ? 'green' : 'gray'}
        disabled={props.validUrlCount === 0}
        onClick={handleSubmit}
      >
        {props.validUrlCount > 0 ? `Request (${props.validUrlCount} URLs)` : 'No valid URLs to process'}
      </Button>

      {isDownloading &&
        Array.from(contents.values()).map((elem, idx) => {
          if (!elem._percent) {
            elem._percent = 100;
          }
          return (
            <>
              <Box width="100%" margin={1.5}>
                <Progress.Root
                  value={Math.floor(elem._percent)}
                  defaultValue={0}
                  maxW="lg"
                  onClick={() => {
                    console.log('hi multi');
                  }}
                >
                  <HStack gap="5">
                    <Progress.Label>{elem.filename.split('_')[1]}</Progress.Label>
                    <Progress.Track flex="1">
                      <Progress.Range />
                    </Progress.Track>
                    <Progress.ValueText>{`${elem._percent.toFixed(0)}%`}</Progress.ValueText>
                  </HStack>
                </Progress.Root>
              </Box>
            </>
          );
        })}
    </>
  );
};
export default MultiInput;
