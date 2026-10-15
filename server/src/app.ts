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

  const rawOrigins = env.CLIENT_ORIGIN || 'http://localhost:5173';
  const allowedOrigins = rawOrigins
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        if (!requestOrigin || env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        const normalized = requestOrigin.replace(/\/+$/, '');
        if (allowedOrigins.includes(normalized) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        if (/^https:\/\/.*\.vercel\.app$/.test(normalized)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${requestOrigin}`));
      },
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
