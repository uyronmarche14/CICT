import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.API_BASE_URL || `http://localhost:${PORT}`;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'CICT Portal API',
      version: '1.0.0',
      description: 'Backend API for the CICT student and admin portal',
    },
    servers: [
      {
        url: BASE_URL,
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['src/routes/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
