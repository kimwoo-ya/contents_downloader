import { Card, Flex, Link, Text } from '@chakra-ui/react';
import { LocalHistory } from '../../types/format';
import { useEffect } from 'react';
import api from '../../utils/api';

interface HistoryProps {
  localhistories: LocalHistory[];
  setLocalhistories: React.Dispatch<React.SetStateAction<LocalHistory[]>>;
}

const History = (props: HistoryProps) => {
  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, filename: string) => {
    e.preventDefault(); // 기본 링크 이동 막기
    try {
      const response = await api.get(`/be/api/v1/download/${filename}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data as BlobPart]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('File download failed:', error);
    }
  };

  return (
    <>
      <Flex justify="center" align="center" style={{ padding: 10 }}>
        <Card.Root width={'60%'}>
          <Card.Body gap="2">
            <Card.Title mt="2">📜 Histories</Card.Title>
            <Card.Description>This informs you last download request history.</Card.Description>
            {props.localhistories.length > 0 ? (
              props.localhistories.map((elem, idx) => {
                var fileName = elem.filename;
                if (fileName.length > 40) {
                  fileName = fileName.substring(0, 35) + '.....mp4';
                }
                return (
                  <Text>
                    <Link
                      href="#"
                      onClick={(e) => {
                        handleDownload(e, elem.filename);
                      }}
                      variant="underline"
                      colorPalette="teal"
                    >
                      {fileName}
                    </Link>
                  </Text>
                );
              })
            ) : (
              <></>
            )}
          </Card.Body>
          <Card.Footer></Card.Footer>
        </Card.Root>
      </Flex>
    </>
  );
};
export default History;
