// server.js
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); // Ensure this exists
const jsonServer = require('json-server');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount JSON Server directly into Express
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();
app.use('/api', middlewares, router);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cafe API Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation at http://localhost:${PORT}/api-docs`);
  console.log(`📦 JSON API available at http://localhost:${PORT}/api`);
});
