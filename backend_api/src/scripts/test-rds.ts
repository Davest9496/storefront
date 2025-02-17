import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { promisify } from 'util';
import { Logger } from '../utils/logger.utils';

const logger = new Logger();
const lookup = promisify(dns.lookup);

// Force production environment
process.env.ENV = 'production';

// Load production environment variables
const envPath = path.resolve(process.cwd(), '.env.production');
dotenv.config({ path: envPath });

interface DNSResult {
  address: string;
  family: number;
}

interface DatabaseInfo {
  database: string;
  version: string;
  server_version: string;
  server_version_num: string;
}

interface DatabaseTimestamp {
  now: string;
}

interface SSLStatus {
  ssl: string;
}

async function performDNSLookup(hostname: string): Promise<void> {
  try {
    const result: DNSResult = await lookup(hostname);
    logger.info(
      `DNS Lookup result: IP ${result.address} (IPv${result.family})`
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error(`DNS Lookup failed: ${errorMessage}`);
    throw error;
  }
}

// In testRDSConnection function
async function testRDSConnection(): Promise<void> {
  const host = process.env.POSTGRES_HOST;
  const port = typeof process.env.POSTGRES_PORT === 'string' ? 
    parseInt(process.env.POSTGRES_PORT, 10) : 5432;
  const database = process.env.POSTGRES_DB;
  const user = process.env.POSTGRES_USER;

  // Type check and validation
  if (
    typeof host !== 'string' ||
    typeof database !== 'string' ||
    typeof user !== 'string' ||
    typeof process.env.POSTGRES_PASSWORD !== 'string'
  ) {
    throw new Error(
      'Missing required database configuration. Please ensure POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER, and POSTGRES_PASSWORD are set.'
    );
  }

  logger.info(`
Connection Parameters:
Host: ${host}
Port: ${port}
Database: ${database}
User: ${user}
  `);

  // Now TypeScript knows host is a string
  logger.info('Performing DNS lookup...');
  await performDNSLookup(host);

  // Create RDS connection pool with detailed configuration
  const pool = new Pool({
    host,
    port,
    database,
    user,
    password: process.env.POSTGRES_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 5000,
    max: 1,
    idleTimeoutMillis: 30000,
  });

  try {
    logger.info('Attempting to connect to RDS...');

    // Test the connection
    const client = await pool.connect();
    logger.info('Successfully connected to RDS!');

    // Basic connectivity test
    const timeResult = await client.query<DatabaseTimestamp>('SELECT NOW()');
    logger.info(`Current database time: ${timeResult.rows[0].now}`);

    // Get database information
    const dbInfo = await client.query<DatabaseInfo>(`
      SELECT 
        current_database() as database,
        version() as version,
        current_setting('server_version') as server_version,
        current_setting('server_version_num') as server_version_num
    `);

    const info = dbInfo.rows[0];
    logger.info(`
Database Details:
Database name: ${info.database}
PostgreSQL version: ${info.version}
Server version: ${info.server_version}
    `);

    // Test SSL
    const sslResult = await client.query<SSLStatus>('SHOW ssl');
    logger.info(`SSL Status: ${sslResult.rows[0].ssl}`);

    // Release client and end pool
    client.release();
    await pool.end();

    logger.info('RDS connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? `${error.name}: ${error.message}\n${error.stack}`
        : 'Unknown error';

    logger.error(`Error connecting to RDS: ${errorMessage}`);
    throw error;
  }
}

logger.info('Starting RDS connection test...');
testRDSConnection().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  logger.error(`Unhandled error: ${errorMessage}`);
  process.exit(1);
});
