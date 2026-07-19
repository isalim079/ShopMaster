import { env } from "../core/config/env";

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Shop ERP API',
    version: '1.0.0',
    description: 'Production-ready Shop ERP REST API',
  },
  servers: [
    {
      url: env.SERVER_URL,
    },
  ],
};