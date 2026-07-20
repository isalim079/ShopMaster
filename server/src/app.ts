import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import { env } from './core/config/env';
import { morganMiddleware } from './core/logger/morgan';
import { notFoundMiddleware } from './core/middleware/not-found.middleware';
import { errorMiddleware } from './core/middleware/error.middleware';
import { swaggerServe, swaggerSetup } from './docs/swagger';
import healthModule from './modules/health';
import authModule from './modules/auth';
import userModule from './modules/user';
import roleModule from './modules/role';
import permissionModule from './modules/permission';
import organizationModule from './modules/organization';
import settingModule from './modules/setting';
import customerModule from './modules/customer';
import supplierModule from './modules/supplier';
import brandModule from './modules/brand';
import categoryModule from './modules/category';
import warehouseModule from './modules/warehouse';
import productModule from './modules/product';
import inventoryModule from './modules/inventory';
import purchaseModule from './modules/purchase';
import purchaseReturnModule from './modules/purchase-return';
import saleModule from './modules/sale';
import saleReturnModule from './modules/sale-return';
import paymentModule from './modules/payment';
import expenseModule from './modules/expense';
import dashboardModule from './modules/dashboard';
import reportModule from './modules/report';
import notificationModule from './modules/notification';
import auditModule from './modules/audit';
import uploadModule from './modules/upload';
import path from 'path';

const app = express();

const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(',').map((origin) =>
  origin.trim(),
);

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(compression());
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morganMiddleware);

app.use('/api', healthModule);
app.use(`/api/${env.API_VERSION}`, authModule);
app.use(`/api/${env.API_VERSION}`, userModule);
app.use(`/api/${env.API_VERSION}`, roleModule);
app.use(`/api/${env.API_VERSION}`, permissionModule);
app.use(`/api/${env.API_VERSION}`, organizationModule);
app.use(`/api/${env.API_VERSION}`, settingModule);
app.use(`/api/${env.API_VERSION}`, customerModule);
app.use(`/api/${env.API_VERSION}`, supplierModule);
app.use(`/api/${env.API_VERSION}`, brandModule);
app.use(`/api/${env.API_VERSION}`, categoryModule);
app.use(`/api/${env.API_VERSION}`, warehouseModule);
app.use(`/api/${env.API_VERSION}`, productModule);
app.use(`/api/${env.API_VERSION}`, inventoryModule);
app.use(`/api/${env.API_VERSION}`, purchaseModule);
app.use(`/api/${env.API_VERSION}`, purchaseReturnModule);
app.use(`/api/${env.API_VERSION}`, saleModule);
app.use(`/api/${env.API_VERSION}`, saleReturnModule);
app.use(`/api/${env.API_VERSION}`, paymentModule);
app.use(`/api/${env.API_VERSION}`, expenseModule);
app.use(`/api/${env.API_VERSION}`, dashboardModule);
app.use(`/api/${env.API_VERSION}`, reportModule);
app.use(`/api/${env.API_VERSION}`, notificationModule);
app.use(`/api/${env.API_VERSION}`, auditModule);
app.use(`/api/${env.API_VERSION}`, uploadModule);
app.use(
  env.UPLOAD_STATIC_PATH,
  express.static(path.resolve(env.UPLOAD_DIR)),
);
app.use('/docs', swaggerServe, swaggerSetup);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
