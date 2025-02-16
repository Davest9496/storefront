import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import router from './routes/router';
import path from 'path';
import { initializePool, dbPool } from './config/database.config';
import { errorHandler } from './utils/error.utils';

// Environment setup
const getEnvPath = (): string => {
  const nodeEnv = process.env.ENV;
  switch (nodeEnv) {
    case 'production':
      return '.env.production';
    case 'test':
      return '.env.test';
    default:
      return '.env';
  }
};

// Load appropriate .env file
const envPath = path.resolve(process.cwd(), getEnvPath());
console.log(`Loading environment from: ${envPath}`);
dotenv.config({ path: envPath });

const app: Application = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    const pool = dbPool();
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.ENV || process.env.NODE_ENV,
      service: 'storefront-api',
      database: {
        connected: true,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        timestamp: result.rows[0].now,
      },
    });
  } catch {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.ENV || process.env.NODE_ENV,
      service: 'storefront-api',
      database: {
        connected: false,
        error: 'Database connection error',
      },
    });
  }
});

// API Routes
app.use('/api', router);

// Error handling middleware (should be after routes)
app.use(errorHandler);

// 404 handler (should be after API routes)
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// Start server function
const startServer = async (): Promise<void> => {
  try {
    await initializePool();

    if (process.env.ENV !== 'test') {
      const server = app.listen(port, () => {
        console.log(`
🚀 Server started:
📋 Environment: ${process.env.ENV || process.env.NODE_ENV}
🔌 Port: ${port}
📦 Database: ${process.env.POSTGRES_DB}
🏠 Host: ${process.env.POSTGRES_HOST}
        `);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
          console.log('HTTP server closed');
        });
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Initialize server
if (process.env.ENV !== 'test') {
  startServer().catch((error) => {
    console.error('Server initialization failed:', error);
    process.exit(1);
  });
}

export default app;
