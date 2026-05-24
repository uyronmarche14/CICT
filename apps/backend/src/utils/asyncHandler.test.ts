import { describe, expect, it, vi } from 'vitest';
import { asyncHandler } from './asyncHandler';

describe('asyncHandler', () => {
  it('calls next with error when async handler rejects', async () => {
    const error = new Error('async error');
    const fn = async () => { throw error; };
    const next = vi.fn();
    const wrapped = asyncHandler(fn);

    await wrapped({} as any, {} as any, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('does not call next when handler succeeds', async () => {
    const fn = async () => { /* success */ };
    const next = vi.fn();
    const wrapped = asyncHandler(fn);

    await wrapped({} as any, {} as any, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('passes through return value (promise resolved)', async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const next = vi.fn();
    const wrapped = asyncHandler(fn);

    await wrapped({} as any, {} as any, next);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });
});
