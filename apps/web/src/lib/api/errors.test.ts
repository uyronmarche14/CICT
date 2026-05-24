import { describe, expect, it } from 'vitest';
import axios, { type AxiosRequestConfig } from 'axios';
import { getApiErrorMessage } from './errors';

describe('getApiErrorMessage', () => {
  it('returns string response data directly', () => {
    const error = new axios.AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
      status: 400,
      data: 'Bad request body',
      statusText: 'Bad Request',
      headers: {},
      config: {} as AxiosRequestConfig,
    });

    expect(getApiErrorMessage(error)).toBe('Bad request body');
  });

  it('returns message field from response data', () => {
    const error = new axios.AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
      status: 400,
      data: { message: 'Email is required' },
      statusText: 'Bad Request',
      headers: {},
      config: {} as AxiosRequestConfig,
    });

    expect(getApiErrorMessage(error)).toBe('Email is required');
  });

  it('returns axios error message as fallback', () => {
    const error = new axios.AxiosError('Network Error', 'ERR_NETWORK', undefined, undefined, {
      status: 0,
      data: undefined,
      statusText: 'Unknown',
      headers: {},
      config: {} as AxiosRequestConfig,
    });

    expect(getApiErrorMessage(error)).toBe('Network Error');
  });

  it('returns custom fallback for unknown errors', () => {
    expect(getApiErrorMessage(null)).toBe('Something went wrong. Please try again.');
    expect(getApiErrorMessage(undefined)).toBe('Something went wrong. Please try again.');
    expect(getApiErrorMessage('just a string')).toBe('Something went wrong. Please try again.');
  });

  it('returns Error.message for non-axios errors', () => {
    expect(getApiErrorMessage(new Error('Custom error'))).toBe('Custom error');
  });

  it('returns fallback for empty message', () => {
    const error = new Error('');
    expect(getApiErrorMessage(error)).toBe('Something went wrong. Please try again.');
  });

  it('accepts custom fallback message', () => {
    expect(getApiErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
  });
});
