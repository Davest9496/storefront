import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { Logger } from '../utils/logger.utils';

const logger = new Logger();
const envPath = path.resolve(process.cwd(), '.env.production');
dotenv.config({ path: envPath });

function getDbConfig(database: string): {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: { rejectUnauthorized: boolean };
} {
  // Validate environment variables
  if (
    typeof process.env.POSTGRES_HOST !== 'string' ||
    typeof process.env.POSTGRES_USER !== 'string' ||
    typeof process.env.POSTGRES_PASSWORD !== 'string'
  ) {
    throw new Error('Missing required database configuration');
  }

  return {
    host: process.env.POSTGRES_HOST,
    port:
      typeof process.env.POSTGRES_PORT === 'string'
        ? parseInt(process.env.POSTGRES_PORT, 10)
        : 5432,
    database,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
  };
}

async function createDatabase(): Promise<void> {
  const defaultPool = new Pool(getDbConfig('postgres'));
  let storefrontPool: Pool | null = null;

  try {
    // Check if database exists
    const checkResult = await defaultPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      ['storefront']
    );

    if (checkResult.rows.length === 0) {
      logger.info('Creating database "storefront"...');
      await defaultPool.query('CREATE DATABASE storefront');
      logger.info('Database created successfully!');
    } else {
      logger.info('Database "storefront" already exists');
    }

    // Connect to storefront database to create schema
    storefrontPool = new Pool(getDbConfig('storefront'));

    logger.info('Creating schema...');
    await storefrontPool.query(`
      -- Drop existing tables and types if they exist
      DROP TABLE IF EXISTS order_products CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS product_accessories CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TYPE IF EXISTS order_status CASCADE;
      DROP TYPE IF EXISTS product_category CASCADE;

      -- Create enums
      CREATE TYPE order_status AS ENUM ('active', 'complete');
      CREATE TYPE product_category AS ENUM ('headphones', 'speakers', 'earphones');

      -- Create Products table with SERIAL ID
      CREATE TABLE products (
          id SERIAL PRIMARY KEY,
          product_name VARCHAR(100) NOT NULL,
          price DECIMAL(10,2) NOT NULL CHECK (price > 0),
          category product_category NOT NULL,
          product_desc TEXT,
          features TEXT[],
          is_new BOOLEAN DEFAULT false
      );

      -- Create Product accessories table
      CREATE TABLE product_accessories (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL,
          item_name VARCHAR(100) NOT NULL,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          CONSTRAINT fk_product
              FOREIGN KEY (product_id)
              REFERENCES products(id)
              ON DELETE CASCADE
      );

      -- Create Users table
      CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_digest VARCHAR(250) NOT NULL
      );

      -- Create Orders table
      CREATE TABLE orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          status order_status NOT NULL DEFAULT 'active',
          CONSTRAINT fk_user 
              FOREIGN KEY (user_id) 
              REFERENCES users(id) 
              ON DELETE CASCADE
      );

      -- Create Order_Products table
      CREATE TABLE order_products (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          CONSTRAINT fk_order 
              FOREIGN KEY (order_id) 
              REFERENCES orders(id) 
              ON DELETE CASCADE,
          CONSTRAINT fk_product 
              FOREIGN KEY (product_id) 
              REFERENCES products(id) 
              ON DELETE CASCADE
      );

      -- Create indexes
      CREATE INDEX idx_products_category ON products(category);
      CREATE INDEX idx_accessories_product ON product_accessories(product_id);
      CREATE INDEX idx_orders_user_id ON orders(user_id);
      CREATE INDEX idx_order_products_order_id ON order_products(order_id);
      CREATE INDEX idx_order_products_product_id ON order_products(product_id);
      CREATE INDEX idx_users_email ON users(email);
    `);

    logger.info('Schema created successfully!');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Database creation failed: ${errorMessage}`);
    throw error;
  } finally {
    // Clean up connections
    if (storefrontPool) {
      await storefrontPool.end();
    }
    await defaultPool.end();
  }
}

logger.info('Starting database creation...');
createDatabase().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  logger.error(`Unhandled error: ${errorMessage}`);
  process.exit(1);
});
