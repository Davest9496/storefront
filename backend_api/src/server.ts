import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import router from './routes/router';
import path from 'path';
import { initializePool, dbPool } from './config/database.config';
import { errorHandler } from './utils/error.utils';
import { Logger } from './utils/logger.utils'; 

// Environment setup
const getEnvPath = (): string => {
  const nodeEnv = process.env.ENV ?? '';
  if (nodeEnv.length > 0) {
    if (nodeEnv === 'production') return '.env.production';
    if (nodeEnv === 'test') return '.env.test';
  }
  return '.env';
};

// Load appropriate .env file
const envPath = path.resolve(process.cwd(), getEnvPath());
const logger = new Logger();
logger.info(`Loading environment from: ${envPath}`);
dotenv.config({ path: envPath });

const app: Application = express();
const defaultPort = 3000;
const port =
  typeof process.env.PORT === 'string'
    ? parseInt(process.env.PORT, 10)
    : defaultPort;

// Middleware
app.use(bodyParser.json());

interface DatabaseTimestamp {
  now: string;
}

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  environment: string;
  service: string;
  database: {
    connected: boolean;
    host?: string;
    database?: string;
    timestamp?: string;
    error?: string;
  };
}

// Health check endpoint
app.get('/health', async (_req, res) => {
  const environment = process.env.ENV ?? process.env.NODE_ENV ?? 'development';
  const timestamp = new Date().toISOString();

  try {
    const pool = dbPool();
    const client = await pool.connect();
    const result = await client.query<DatabaseTimestamp>('SELECT NOW()');
    client.release();

    const dbHost = process.env.POSTGRES_HOST ?? 'unknown';
    const dbName = process.env.POSTGRES_DB ?? 'unknown';

    const response: HealthCheckResponse = {
      status: 'healthy',
      timestamp,
      environment,
      service: 'storefront-api',
      database: {
        connected: true,
        host: dbHost,
        database: dbName,
        timestamp: result.rows[0].now,
      },
    };

    res.json(response);
  } catch {
    const response: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp,
      environment,
      service: 'storefront-api',
      database: {
        connected: false,
        error: 'Database connection error',
      },
    };

    res.status(503).json(response);
  }
});

// API Routes
app.use('/api', router);

// Error handling middleware (should be after routes)
app.use(errorHandler);

// 404 handler (should be after API routes)
app.use((req, res) => {
  const response = {
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
  };
  res.status(404).json(response);
});

// Start server function
const startServer = async (): Promise<void> => {
  try {
    await initializePool();

    const isTestEnvironment = process.env.ENV === 'test';
    if (!isTestEnvironment) {
      const environment =
        process.env.ENV ?? process.env.NODE_ENV ?? 'development';
      const dbName = process.env.POSTGRES_DB ?? 'unknown';
      const dbHost = process.env.POSTGRES_HOST ?? 'unknown';

      const server = app.listen(port, () => {
        logger.info(`
🚀 Server started:
📋 Environment: ${environment}
🔌 Port: ${port}
📦 Database: ${dbName}
🏠 Host: ${dbHost}
        `);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        logger.info('SIGTERM signal received: closing HTTP server');
        server.close(() => {
          logger.info('HTTP server closed');
        });
      });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to start server:', errorMessage);
    process.exit(1);
  }
};

// Initialize server
const isTestEnvironment = process.env.ENV === 'test';
if (!isTestEnvironment) {
  startServer().catch((error) => {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('Server initialization failed:', errorMessage);
    process.exit(1);
  });
}

export default app;
