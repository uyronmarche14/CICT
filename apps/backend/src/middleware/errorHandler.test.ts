import { describe, expect, it } from 'vitest';
import { AppError } from './errorHandler';

describe('AppError', () => {
  it('creates an error with default status 500', () => {
    const err = new AppError('Something went wrong');
    expect(err.message).toBe('Something went wrong');
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
  });

  it('creates an error with custom status code', () => {
    const err = new AppError('Not found', 404);
    expect(err.statusCode).toBe(404);
  });

  it('is an instance of Error', () => {
    const err = new AppError('test');
    expect(err).toBeInstanceOf(Error);
  });

  it('captures stack trace', () => {
    const err = new AppError('test');
    expect(err.stack).toBeDefined();
  });
});
