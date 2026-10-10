import { Router, Request, Response } from 'express';
import { Database } from '../config/db';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'pathforge-server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    database: {
      connected: Database.isReady(),
      configured: Database.isConfigured(),
    },
  });
});
