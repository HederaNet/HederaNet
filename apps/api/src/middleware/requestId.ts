import type { RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function requestId(): RequestHandler {
  return (req, res, next) => {
    const id = (req.headers['x-request-id'] as string | undefined) ?? uuidv4();
    req.headers['x-request-id'] = id;
    res.setHeader('x-request-id', id);
    next();
  };
}
