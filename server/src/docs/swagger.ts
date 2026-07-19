import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './openapi';

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(openApiSpec);