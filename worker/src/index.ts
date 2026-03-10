import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { templateRoutes } from './routes/templates';
import { fileRoutes } from './routes/files';
import { authMiddleware } from './middleware/auth';

// Define environment bindings
interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  PDF_QUEUE: Queue;
}

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// Apply middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', secureHeaders());

// Apply routes
app.route('/api/templates', templateRoutes);
app.route('/api/files', fileRoutes);

// Default route
app.get('/', (c) => {
  return c.json({
    message: 'Contract Generator API',
    version: '0.1.0',
  });
});

// Not found handler
app.notFound((c) => {
  return c.json({
    message: 'Not Found',
    status: 404,
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({
    message: 'Internal Server Error',
    status: 500,
  }, 500);
});

export default app;
