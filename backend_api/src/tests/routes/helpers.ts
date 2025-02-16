// import { TestUser, TestProduct } from './types';
// import { ProductCategory } from '../../types/shared.types';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { dbPool } from '../../config/database.config';
// import { QueryResult } from 'pg';

// export const testHelpers = {
//   async createTestUser(
//     firstName = 'Test',
//     lastName = 'User',
//     email = 'test@example.com',
//     password = 'password123'
//   ): Promise<TestUser> {
//     const passwordDigest = await bcrypt.hash(
//       password + process.env.BCRYPT_PASSWORD,
//       10
//     );
//     const client = await dbPool.connect();
//     try {
//       const result: QueryResult<TestUser> = await client.query(
//         `INSERT INTO users (first_name, last_name, email, password_digest)
//          VALUES ($1, $2, $3, $4)
//          RETURNING id, first_name, last_name, email`,
//         [firstName, lastName, email, passwordDigest]
//       );
//       return result.rows[0];
//     } finally {
//       client.release();
//     }
//   },

//   generateTestToken(userId: number, email: string): string {
//     return jwt.sign(
//       { user: { id: userId, email } },
//       process.env.JWT_SECRET || 'test-secret',
//       { expiresIn: '1h' }
//     );
//   },

//   async createTestProduct(
//     productName = 'Test Product',
//     price = 99.99,
//     category: ProductCategory = 'headphones'
//   ): Promise<TestProduct> {
//     const client = await dbPool.connect();
//     try {
//       const result: QueryResult<TestProduct> = await client.query(
//         `INSERT INTO products (
//           product_name, price, category, product_desc, image_name,
//           product_features, product_accessories
//         )
//         VALUES ($1, $2, $3, $4, $5, $6, $7)
//         RETURNING *`,
//         [
//           productName,
//           price,
//           category,
//           'Test description',
//           'test-image',
//           ['Feature 1', 'Feature 2'],
//           ['Accessory 1', 'Accessory 2'],
//         ]
//       );
//       return result.rows[0];
//     } finally {
//       client.release();
//     }
//   },

//   async cleanupTestData(): Promise<void> {
//     const client = await dbPool.connect();
//     try {
//       await client.query(
//         'TRUNCATE order_products, orders, products, users CASCADE'
//       );
//     } finally {
//       client.release();
//     }
//   },
// };
