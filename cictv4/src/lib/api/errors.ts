import axios from 'axios';

const isMessageRecord = (value: unknown): value is { message?: unknown } =>
  typeof value === 'object' && value !== null;

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (typeof responseData === 'string' && responseData.trim().length > 0) {
      return responseData.trim();
    }

    if (isMessageRecord(responseData) && typeof responseData.message === 'string') {
      return responseData.message;
    }

    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};
