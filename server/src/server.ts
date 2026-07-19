import http from 'http';

import app from './app';
import { env } from './core/config/env';
import { logger } from './core/logger/logger';

const server = http.createServer(app)

server.listen(env.PORT, () => {
  logger.info(`${env.APP_NAME} is running on port ${env.PORT}`)
})

process.on('SIGINT', () => {
  logger.info('Shutting down server...');
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  logger.info('Shutting down server...');
  server.close(() => process.exit(0));
});