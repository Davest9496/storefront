// import { query } from '../../config/database.config';
// import * as dotenv from 'dotenv';
// import path = require('path');
// import { SpecReporter, StacktraceOption } from 'jasmine-spec-reporter';

// // Load test environment variables
// dotenv.config({
//   path: path.resolve(process.cwd(), '.env.test'),
// });

// // Configure Jasmine Reporter
// jasmine.getEnv().clearReporters();
// jasmine.getEnv().addReporter(
//   new SpecReporter({
//     spec: {
//       displayStacktrace: StacktraceOption.PRETTY,
//       displayPending: true,
//       displayDuration: true,
//     },
//     suite: {
//       displayNumber: true,
//     },
//     summary: {
//       displayErrorMessages: true,
//       displayStacktrace: StacktraceOption.PRETTY,
//       displaySuccessful: true,
//       displayFailed: true,
//       displayPending: true,
//     },
//   })
// );

// beforeAll(async (): Promise<void> => {
//   try {
//     // Drop existing tables if they exist
//     await query(`
//       DROP TABLE IF EXISTS order_products CASCADE;
//       DROP TABLE IF EXISTS orders CASCADE;
//       DROP TABLE IF EXISTS products CASCADE;
//       DROP TABLE IF EXISTS users CASCADE;
//       DROP TYPE IF EXISTS order_status CASCADE;
//       DROP TYPE IF EXISTS product_category CASCADE;
//     `);

//     // Create enums
//     await query(`
//       CREATE TYPE order_status AS ENUM ('active', 'complete');
//       CREATE TYPE product_category AS ENUM ('headphones', 'speakers', 'earphones');
//     `);

//     // Create tables
//     await query(`
//       CREATE TABLE users (
//         id SERIAL PRIMARY KEY,
//         first_name VARCHAR(100) NOT NULL,
//         last_name VARCHAR(100) NOT NULL,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password_digest VARCHAR(250) NOT NULL
//       );

//       CREATE TABLE products (
//         id SERIAL PRIMARY KEY,
//         product_name VARCHAR(100) NOT NULL,
//         price DECIMAL(10,2) NOT NULL CHECK (price > 0),
//         category product_category NOT NULL,
//         product_desc VARCHAR(250),
//         image_name VARCHAR(255) NOT NULL,
//         product_features TEXT[],
//         product_accessories TEXT[]
//       );

//       CREATE TABLE orders (
//         id SERIAL PRIMARY KEY,
//         user_id INTEGER NOT NULL,
//         status order_status NOT NULL DEFAULT 'active',
//         CONSTRAINT fk_user 
//           FOREIGN KEY (user_id) 
//           REFERENCES users(id) 
//           ON DELETE CASCADE
//       );

//       CREATE TABLE order_products (
//         id SERIAL PRIMARY KEY,
//         order_id INTEGER NOT NULL,
//         product_id INTEGER NOT NULL,
//         quantity INTEGER NOT NULL CHECK (quantity > 0),
//         CONSTRAINT fk_order 
//           FOREIGN KEY (order_id) 
//           REFERENCES orders(id) 
//           ON DELETE CASCADE,
//         CONSTRAINT fk_product 
//           FOREIGN KEY (product_id) 
//           REFERENCES products(id) 
//           ON DELETE CASCADE
//       );

//       CREATE INDEX idx_orders_user_id ON orders(user_id);
//       CREATE INDEX idx_products_category ON products(category);
//       CREATE INDEX idx_order_products_order_id ON order_products(order_id);
//       CREATE INDEX idx_order_products_product_id ON order_products(product_id);
//       CREATE INDEX idx_users_email ON users(email);
//     `);

//     console.log('Test database schema created successfully');
//   } catch (error) {
//     console.error('Test setup failed:', error);
//     throw error;
//   }
// });

// afterAll(async (): Promise<void> => {
//   try {
//     // Clean up by dropping all tables
//     await query(`
//       DROP TABLE IF EXISTS order_products CASCADE;
//       DROP TABLE IF EXISTS orders CASCADE;
//       DROP TABLE IF EXISTS products CASCADE;
//       DROP TABLE IF EXISTS users CASCADE;
//       DROP TYPE IF EXISTS order_status CASCADE;
//       DROP TYPE IF EXISTS product_category CASCADE;
//     `);

//     console.log('Test database cleanup completed');
//   } catch (error) {
//     console.error('Test cleanup failed:', error);
//     throw error;
//   }
// });
