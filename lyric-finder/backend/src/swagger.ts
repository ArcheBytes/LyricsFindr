import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LyricsFindr API',
      version: '1.0.0',
      description: 'API to find songs and lyrics'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);