import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import * as dotenv from 'dotenv';
import path = require('path');
import { Logger } from '../utils/logger.utils';

// Initialize logger
const logger = new Logger();

// Load environment variables from .env file
const envFile = process.env.ENV === 'test' ? '.env.test' : '.env';
const envPath = path.resolve(process.cwd(), envFile);

dotenv.config({ path: envPath });

interface DatabaseRow extends QueryResultRow {
  id?: number;
}

type QueryParams = string | number | boolean | null | undefined | Buffer | Date;

const getDbConfig = (): PoolConfig => {
  const isTest = process.env.ENV === 'test';
  const isProduction = process.env.ENV === 'production';
  const dbHost = process.env.POSTGRES_HOST ?? 'localhost';
  const dbName = isTest
    ? 'storefront_test'
    : (process.env.POSTGRES_DB ?? 'postgres');

  // Log environment for debugging
  logger.info(`Database Environment: ${process.env.ENV ?? 'development'}`);
  logger.info(`Host: ${dbHost}`);
  logger.info(`Database: ${dbName}`);

  // Base configuration
  const config: PoolConfig = {
    host: dbHost,
    port:
      typeof process.env.POSTGRES_PORT === 'string'
        ? parseInt(process.env.POSTGRES_PORT, 10)
        : 5432,
    database: dbName,
    user: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? '',
    // Connection pool settings
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  // Add SSL configuration for production
  if (isProduction) {
    logger.info('Connecting to RDS in production mode with SSL');
    config.ssl = {
      rejectUnauthorized: false,
    };
  }

  return config;
};

// Create the pool with retries
const createPool = async (retries = 5): Promise<Pool> => {
  try {
    const pool = new Pool(getDbConfig());

    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    logger.info('Database connection established successfully');
    return pool;
  } catch (error) {
    if (retries > 0) {
      logger.info(
        `Connection failed, retrying... (${retries} attempts remaining)`
      );
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      return createPool(retries - 1);
    }
    throw error;
  }
};

// Initialize pool
let pool: Pool | null = null;

export const initializePool = async (): Promise<void> => {
  try {
    pool = await createPool();

    if (pool !== null) {
      pool.on('error', (err: Error) => {
        logger.error(`Unexpected error on idle client: ${err.message}`);
        // Don't exit process, try to recover
        initializePool().catch((e) => {
          if (e instanceof Error) {
            logger.error(`Pool initialization error: ${e.message}`);
          } else {
            logger.error('Pool initialization error: Unknown error');
          }
        });
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Failed to initialize pool: ${error.message}`);
    } else {
      logger.error('Failed to initialize pool: Unknown error');
    }
    throw error;
  }
};

export async function query<T extends DatabaseRow>(
  text: string,
  params?: QueryParams[]
): Promise<QueryResult<T>> {
  if (pool === null) {
    await initializePool();
  }

  const start = Date.now();
  const client = await pool!.connect();

  try {
    const res = await client.query<T>(text, params);
    const duration = Date.now() - start;

    if (process.env.ENV !== 'test') {
      logger.info(
        `Executed query "${text}" with ${res.rowCount ?? 0} rows in ${duration}ms`
      );
    }

    return res;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Query error for "${text}": ${errorMessage}`);
    throw error;
  } finally {
    client.release();
  }
}

// Initialize pool on module load
initializePool().catch((error) => {
  if (error instanceof Error) {
    logger.error(`Initial pool setup failed: ${error.message}`);
  } else {
    logger.error('Initial pool setup failed: Unknown error');
  }
});

export const dbPool = (): Pool => {
  if (pool === null) {
    throw new Error('Database pool not initialized');
  }
  return pool;
};

export default { query, dbPool };
