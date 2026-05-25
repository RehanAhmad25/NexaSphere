/**
 * API Documentation Routes
 * Serves Swagger UI and ReDoc for API documentation
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import redoc from 'redoc-express';
import specs from '../config/swagger.js';
import logger from '../utils/logger.js';
import yaml from 'yaml';

const router = express.Router();

/**
 * Swagger UI - Interactive API documentation
 * GET /api/docs
 */
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(specs, {
  swaggerOptions: {
    url: '/api/swagger.json',
    displayOperationId: true,
    filter: true,
    showExtensions: true,
    deepLinking: true,
  },
  customCss: '.swagger-ui .topbar { background-color: #007bff; }',
  customSiteTitle: 'NexaSphere API Documentation',
}));

/**
 * ReDoc - Alternative API documentation view
 * GET /api/redoc
 */
router.get('/redoc', redoc({
  title: 'NexaSphere API Documentation',
  specUrl: '/api/swagger.json',
}));

/**
 * OpenAPI Spec JSON
 * GET /api/swagger.json
 */
router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
  logger.info('OpenAPI spec requested', { ip: req.ip });
});

/**
 * OpenAPI Spec YAML
 * GET /api/swagger.yaml
 */
router.get('/swagger.yaml', (req, res) => {
  res.setHeader('Content-Type', 'application/yaml');
  res.send(yaml.stringify(specs));
  logger.info('OpenAPI YAML spec requested', { ip: req.ip });
});

/**
 * API Documentation Index
 * GET /api/docs-info
 */
router.get('/docs-info', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'API Documentation Available',
      documentation: {
        swagger_ui: 'http://localhost:3000/api/docs',
        redoc: 'http://localhost:3000/api/redoc',
        openapi_json: 'http://localhost:3000/api/swagger.json',
        openapi_yaml: 'http://localhost:3000/api/swagger.yaml',
      },
      apiVersion: specs.info.version,
      title: specs.info.title,
    });
  } catch (error) {
    logger.error('Error getting docs info', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
