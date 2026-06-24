import { isAxiosError } from 'axios';

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong.') => {
  if (isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const isNetworkError = (error: unknown) =>
  isAxiosError(error) && !error.response;
