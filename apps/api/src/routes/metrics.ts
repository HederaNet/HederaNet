import { Router } from 'express';
import { register } from '../metrics.js';

export const metricsRouter: Router = Router();

metricsRouter.get('/', async (_req, res, next) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    next(err);
  }
});
