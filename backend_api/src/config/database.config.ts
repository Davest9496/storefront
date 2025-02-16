import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import * as dotenv from 'dotenv';
import path = require('path');

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

  // Log environment for debugging
  console.log(`Database Environment: ${process.env.ENV}`);
  console.log(`Host: ${process.env.POSTGRES_HOST}`);
  console.log(
    `Database: ${isTest ? 'storefront_test' : process.env.POSTGRES_DB}`
  );

  // Base configuration
  const config: PoolConfig = {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: isTest ? 'storefront_test' : process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    // Connection pool settings
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  // Add SSL configuration for production
  if (isProduction) {
    console.log('Connecting to RDS in production mode with SSL');
    config.ssl = {
      rejectUnauthorized: false,
      // Add these if your RDS requires them
      // ca: fs.readFileSync('/path/to/rds-ca-2019-root.pem').toString(),
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

    console.log('Database connection established successfully');
    return pool;
  } catch (error) {
    if (retries > 0) {
      console.log(
        `Connection failed, retrying... (${retries} attempts remaining)`
      );
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      return createPool(retries - 1);
    }
    throw error;
  }
};

// Initialize pool
let pool: Pool;

export const initializePool = async (): Promise<void> => {
  try {
    pool = await createPool();

    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
      // Don't exit process, try to recover
      initializePool().catch(console.error);
    });
  } catch (error) {
    console.error('Failed to initialize pool:', error);
    throw error;
  }
};

export async function query<T extends DatabaseRow>(
  text: string,
  params?: QueryParams[]
): Promise<QueryResult<T>> {
  if (!pool) {
    await initializePool();
  }

  const start = Date.now();
  const client = await pool.connect();

  try {
    const res = await client.query<T>(text, params);
    const duration = Date.now() - start;

    if (process.env.ENV !== 'test') {
      console.log('Executed query', {
        text,
        duration,
        rows: res.rowCount,
        params,
      });
    }

    return res;
  } catch (error) {
    console.error('Query error:', {
      text,
      params,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  } finally {
    client.release();
  }
}

// Initialize pool on module load
initializePool().catch(console.error);

export const dbPool = (): Pool => pool;
export default { query, dbPool };
