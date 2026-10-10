import { createApp } from './app';
import { env } from './config/env';
import { Database } from './config/db';

const app = createApp();

// Connect to MongoDB Atlas (safe offline fallback if MONGODB_URI is unconfigured)
Database.connect().catch((err) => {
  console.warn('[Server] MongoDB connection initialization notice:', err?.message || err);
});

const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`PathForge AI API server listening on http://127.0.0.1:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing HTTP server gracefully...');
  await Database.disconnect();
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
