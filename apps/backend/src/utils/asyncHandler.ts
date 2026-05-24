import { type Request, type Response, type NextFunction } from 'express';

type AsyncHandler<T extends Request = Request> = (
  req: T,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = <T extends Request = Request>(
  fn: AsyncHandler<T>
) => {
  return (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
