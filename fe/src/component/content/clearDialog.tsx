import { Dialog, Portal, Button } from '@chakra-ui/react';

interface ClearDialogComponent {
  lines: string[];
  setLines: React.Dispatch<React.SetStateAction<string[]>>;
  isAllClearDialogOpen: boolean;
  setIsAllClearDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ClearDialog = (props: ClearDialogComponent) => {
  return (
    <>
      {props.isAllClearDialogOpen ? (
        <>
          <Dialog.Root placement={'top'} motionPreset="slide-in-bottom" role="alertdialog" open={props.isAllClearDialogOpen}>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>🚨 Alert</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <p>Every Input will be cleared.</p>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Dialog.ActionTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => {
                          props.setIsAllClearDialogOpen(false);
                        }}
                      >
                        No
                      </Button>
                    </Dialog.ActionTrigger>
                    <Button
                      onClick={() => {
                        props.setIsAllClearDialogOpen(false);
                        props.setLines([]);
                      }}
                    >
                      Ok
                    </Button>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default ClearDialog;
