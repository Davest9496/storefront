import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

// Force production environment
process.env.ENV = 'production';

// Load production environment variables
const envPath = path.resolve(process.cwd(), '.env.production');
dotenv.config({ path: envPath });

async function performDNSLookup(hostname: string): Promise<void> {
  try {
    const result = await lookup(hostname);
    console.log('DNS Lookup result:', {
      ip: result.address,
      family: `IPv${result.family}`,
    });
  } catch (err) {
    console.error('DNS Lookup failed:', err);
  }
}

async function testRDSConnection(): Promise<void> {
  const host = process.env.POSTGRES_HOST;
  const port = process.env.POSTGRES_PORT
    ? parseInt(process.env.POSTGRES_PORT, 10)
    : 5432;
  const database = process.env.POSTGRES_DB;
  const user = process.env.POSTGRES_USER;

  console.log('\nConnection Parameters:');
  console.log('Host:', host);
  console.log('Port:', port);
  console.log('Database:', database);
  console.log('User:', user);

  // Perform DNS lookup first
  if (host) {
    console.log('\nPerforming DNS lookup...');
    await performDNSLookup(host);
  }

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
    // Connection timeout
    connectionTimeoutMillis: 5000,
    // Maximum connection retries
    max: 1,
    // Idle timeout
    idleTimeoutMillis: 30000,
  });

  try {
    console.log('\nAttempting to connect to RDS...');

    // Test the connection
    const client = await pool.connect();
    console.log('Successfully connected to RDS!');

    // Basic connectivity test
    const result = await client.query('SELECT NOW()');
    console.log('\nDatabase Connection Info:');
    console.log('Current database time:', result.rows[0].now);

    // Get database information
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database,
        version() as version,
        current_setting('server_version') as server_version,
        current_setting('server_version_num') as server_version_num
    `);

    console.log('\nDatabase Details:');
    console.log('Database name:', dbInfo.rows[0].database);
    console.log('PostgreSQL version:', dbInfo.rows[0].version);
    console.log('Server version:', dbInfo.rows[0].server_version);

    // Test SSL
    const sslResult = await client.query('SHOW ssl');
    console.log('\nSSL Status:', sslResult.rows[0].ssl);

    // Release client and end pool
    client.release();
    await pool.end();

    console.log('\nRDS connection test completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\nError connecting to RDS:', err);

    if (err instanceof Error) {
      console.error('\nError Details:');
      console.error('Name:', err.name);
      console.error('Message:', err.message);
      console.error('Stack:', err.stack);
    }

    process.exit(1);
  }
}

console.log('Starting RDS connection test...');
testRDSConnection().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
