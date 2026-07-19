import express from 'express';
import { morganMiddleware } from './core/logger/morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import healthModule from './modules/health'
import { swaggerServe, swaggerSetup } from './docs/swagger';
import { notFoundMiddleware } from './core/middleware/not-found.middleware';
import { errorMiddleware } from './core/middleware/error.middleware';

const app = express();

app.use(helmet())
app.use(cors())
app.use(compression())
app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(morganMiddleware)

app.use('/api', healthModule)
app.use('/docs', swaggerServe, swaggerSetup)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app