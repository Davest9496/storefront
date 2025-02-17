import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { Logger } from '../utils/logger.utils';

const logger = new Logger();

const envPath = path.resolve(process.cwd(), '.env.production');
dotenv.config({ path: envPath });

// Product data type definitions
interface ProductAccessory {
  quantity: number;
  item: string;
}

interface Product {
  name: string;
  description: string;
  price: number;
  features: string[];
  includes: ProductAccessory[];
  isNew: boolean;
}

interface Category {
  name: string;
  items: Product[];
}

interface ProductsData {
  categories: Category[];
}

const productsData: ProductsData = {
  categories: [
    // ... (existing product data remains the same)
  ],
};

async function populateDatabase(): Promise<void> {

 if (
   typeof process.env.POSTGRES_HOST !== 'string' ||
   typeof process.env.POSTGRES_USER !== 'string' ||
   typeof process.env.POSTGRES_PASSWORD !== 'string'
 ) {
   throw new Error('Missing required database configuration');
 }

 const pool = new Pool({
   host: process.env.POSTGRES_HOST,
   port:
     typeof process.env.POSTGRES_PORT === 'string'
       ? parseInt(process.env.POSTGRES_PORT, 10)
       : 5432,
   database: 'storefront',
   user: process.env.POSTGRES_USER,
   password: process.env.POSTGRES_PASSWORD,
   ssl: {
     rejectUnauthorized: false,
   },
 });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    logger.info('Cleaning existing data...');
    await client.query(`
      TRUNCATE TABLE order_products CASCADE;
      TRUNCATE TABLE orders CASCADE;
      TRUNCATE TABLE product_accessories CASCADE;
      TRUNCATE TABLE products CASCADE;
      TRUNCATE TABLE users CASCADE;
    `);

    // Insert users
    logger.info('Inserting users...');
    const usersResult = await client.query<{ id: number; email: string }>(`
      INSERT INTO users (first_name, last_name, email, password_digest) VALUES
      (
        'John',
        'Doe',
        'john.doe@example.com',
        '$2b$10$xPPQQUB4gRTJK9BLON5e7.f6jpZBu0WJQAqJ0VLrDsQHnHrB8KDtC'
      ),
      (
        'Jane',
        'Smith',
        'jane.smith@example.com',
        '$2b$10$xPPQQUB4gRTJK9BLON5e7.1234567890abcdefghijklmnopqrstuv'
      )
      RETURNING id, email;
    `);

    const users = usersResult.rows;
    const userMap = new Map(users.map((user) => [user.email, user.id]));

    // Insert products and their accessories
    logger.info('Inserting products and accessories...');
    const productIdMap = new Map<string, number>();

    for (const category of productsData.categories) {
      for (const product of category.items) {
        // Insert product
        const productResult = await client.query<{ id: number }>(
          `
          INSERT INTO products (
            product_name,
            price,
            category,
            product_desc,
            features,
            is_new
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `,
          [
            product.name,
            product.price,
            category.name.toLowerCase(),
            product.description,
            product.features,
            product.isNew,
          ]
        );

        const productId = productResult.rows[0].id;
        productIdMap.set(product.name, productId);

        // Insert accessories
        for (const accessory of product.includes) {
          await client.query(
            `
            INSERT INTO product_accessories (
              product_id,
              item_name,
              quantity
            ) VALUES ($1, $2, $3)
          `,
            [productId, accessory.item, accessory.quantity]
          );
        }
      }
    }

    // Create sample orders
    logger.info('Creating sample orders...');

    const johnDoeId = userMap.get('john.doe@example.com');
    const xx99Mark2Id = productIdMap.get('XX99 Mark II Headphones');

    if (johnDoeId == null || xx99Mark2Id == null) {
      throw new Error('Required user or product not found');
    }

    const johnOrderResult = await client.query<{ id: number }>(
      `
      INSERT INTO orders (user_id, status)
      VALUES ($1, 'active')
      RETURNING id
      `,
      [johnDoeId]
    );

    await client.query(
      `
      INSERT INTO order_products (order_id, product_id, quantity)
      VALUES ($1, $2, 2)
      `,
      [johnOrderResult.rows[0].id, xx99Mark2Id]
    );

    const janeSmithId = userMap.get('jane.smith@example.com');
    const zx9Id = productIdMap.get('ZX9 Speaker');
    const yx1Id = productIdMap.get('YX1 Wireless Earphones');

    if (janeSmithId == null || zx9Id == null || yx1Id == null) {
      throw new Error('Required user or products not found');
    }

    const janeOrderResult = await client.query<{ id: number }>(
      `
      INSERT INTO orders (user_id, status)
      VALUES ($1, 'complete')
      RETURNING id
      `,
      [janeSmithId]
    );

    await client.query(
      `
      INSERT INTO order_products (order_id, product_id, quantity)
      VALUES 
        ($1, $2, 1),
        ($1, $3, 1)
      `,
      [janeOrderResult.rows[0].id, zx9Id, yx1Id]
    );

    await client.query('COMMIT');
    logger.info('Database populated successfully!');

    // Verify data
    type CountResult = { count: string };
    const [userCount, productCount, accessoryCount, orderCount, orderProductCount] =
      await Promise.all([
        client.query<CountResult>('SELECT COUNT(*) FROM users'),
        client.query<CountResult>('SELECT COUNT(*) FROM products'),
        client.query<CountResult>('SELECT COUNT(*) FROM product_accessories'),
        client.query<CountResult>('SELECT COUNT(*) FROM orders'),
        client.query<CountResult>('SELECT COUNT(*) FROM order_products'),
      ]);

    logger.info(`
Data verification:
Users: ${userCount.rows[0].count}
Products: ${productCount.rows[0].count}
Accessories: ${accessoryCount.rows[0].count}
Orders: ${orderCount.rows[0].count}
Order Products: ${orderProductCount.rows[0].count}
    `);
  } catch (error) {
    await client.query('ROLLBACK');
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error populating database: ${errorMessage}`);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

logger.info('Starting database population...');
populateDatabase().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  logger.error(`Database population failed: ${errorMessage}`);
  process.exit(1);
});
