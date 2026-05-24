import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(): ErrorRequestHandler {
  return (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
      return;
    }

    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        success: false,
        error: err.message,
        code: err.code,
      });
      return;
    }

    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[ERROR]', err);
    res.status(500).json({ success: false, error: message });
  };
}
