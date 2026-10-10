import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { healthRouter } from './routes/healthRoutes';
import { roadmapRouter } from './routes/roadmapRoutes';
import { authRouter } from './routes/authRoutes';
import { roadmapPersistenceRouter } from './routes/roadmapPersistenceRoutes';
import { shareRouter } from './routes/shareRoutes';

export const createApp = (): Express => {
  const app = express();

  // Security Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.NODE_ENV === 'production' ? env.CLIENT_ORIGIN : true,
      credentials: true,
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Route Mounting
  app.use('/api/v1', healthRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/roadmap', roadmapRouter);
  app.use('/api/v1/roadmaps', roadmapPersistenceRouter);
  app.use('/api/v1/shares', shareRouter);

  // 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
    });
  });

  // Global Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      success: false,
      error: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
  });

  return app;
};
