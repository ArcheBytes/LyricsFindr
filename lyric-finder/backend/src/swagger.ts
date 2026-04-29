import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LyricsFindr API',
      version: '1.0.0',
      description: 'API para buscar canciones y letras'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Desarrollo' }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);