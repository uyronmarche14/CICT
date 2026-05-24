import { useConfirmationDialog } from '@/lib/store/confirmationDialogStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';

const ConfirmationDialog = () => {
  const title = useConfirmationDialog(state => state.title);
  const description = useConfirmationDialog(state => state.description);
  const cancelButtonTxt = useConfirmationDialog(
    state => state.buttonText?.cancel
  );
  const confirmButtonTxt = useConfirmationDialog(
    state => state.buttonText?.confirm
  );
  const open = useConfirmationDialog(state => state.open);
  const setOpen = useConfirmationDialog(state => state.setOpen);
  const onConfirm = useConfirmationDialog(state => state.onConfirm);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelButtonTxt}</AlertDialogCancel>

          <Button asChild>
            <AlertDialogAction onClick={onConfirm}>
              {confirmButtonTxt}
            </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
