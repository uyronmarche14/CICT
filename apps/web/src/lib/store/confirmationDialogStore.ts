import { create } from 'zustand';

type ConfirmationDialogState = {
  open: boolean;
  title: string;
  description: string;
  buttonText?: {
    cancel?: string;
    confirm?: string;
  };
  onConfirm: () => void;
  setOpen: (open: boolean) => void;
  show: (config: {
    title: string;
    description: string;
    buttonText?: {
      cancel?: string;
      confirm?: string;
    };
    onConfirm: () => void;
  }) => void;
  reset: () => void;
};

const defaultButtonText = {
  cancel: 'Cancel',
  confirm: 'Confirm',
};

export const useConfirmationDialog = create<ConfirmationDialogState>((set) => ({
  open: false,
  title: '',
  description: '',
  buttonText: defaultButtonText,
  onConfirm: () => undefined,
  setOpen: (open) => set({ open }),
  show: ({ title, description, buttonText, onConfirm }) =>
    set({
      open: true,
      title,
      description,
      buttonText: buttonText || defaultButtonText,
      onConfirm,
    }),
  reset: () =>
    set({
      open: false,
      title: '',
      description: '',
      buttonText: defaultButtonText,
      onConfirm: () => undefined,
    }),
}));
