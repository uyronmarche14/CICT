import { toast as sonnerToast, type Action } from 'sonner';

interface ToastAction {
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const toastSuccess = (title: string, description?: string, action?: ToastAction) => {
  sonnerToast.success(title, {
    description,
    ...(action ? { action: action as Action } : {}),
    duration: 4000,
  });
};

const toastError = (title: string, description?: string, action?: ToastAction) => {
  sonnerToast.error(title, {
    description,
    ...(action ? { action: action as Action } : {}),
    duration: 6000,
  });
};

const toastInfo = (title: string, description?: string) => {
  sonnerToast.info(title, {
    description,
    duration: 4000,
  });
};

const toastWarning = (title: string, description?: string, action?: ToastAction) => {
  sonnerToast.warning(title, {
    description,
    ...(action ? { action: action as Action } : {}),
    duration: 5000,
  });
};

export const appToast = {
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
  warning: toastWarning,
};
