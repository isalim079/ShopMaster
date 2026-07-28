import morgan from 'morgan';
import { env } from '../config/env';
import { logger } from './logger';

const productionFormat = ':method :url :status :response-time ms';

export const morganMiddleware =
  env.NODE_ENV === 'development'
    ? morgan('dev')
    : morgan(productionFormat, {
        stream: {
          write: (message: string) => {
            logger.info(message.trim());
          },
        },
      });