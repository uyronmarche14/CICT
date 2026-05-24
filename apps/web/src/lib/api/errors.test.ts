import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './errors';

describe('getApiErrorMessage', () => {
  it('prefers structured backend messages', () => {
    const error = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      data: { message: 'Too many requests from this IP, please try again later.' },
      status: 429,
      statusText: 'Too Many Requests',
      headers: {},
      config: {} as never,
    });

    expect(getApiErrorMessage(error, 'fallback')).toBe(
      'Too many requests from this IP, please try again later.'
    );
  });

  it('falls back to plain-text backend responses', () => {
    const error = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      data: 'Too many requests from this IP, please try again later.',
      status: 429,
      statusText: 'Too Many Requests',
      headers: {},
      config: {} as never,
    });

    expect(getApiErrorMessage(error, 'fallback')).toBe(
      'Too many requests from this IP, please try again later.'
    );
  });
});
