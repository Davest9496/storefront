// import request from 'supertest';
// import app from '../../server';
// import { testHelpers } from './helpers';
// import { TestUser, TestProduct } from './types';

// describe('Product Routes', () => {
//   let testUser: TestUser;
//   let testToken: string;
//   let testProduct: TestProduct;

//   beforeEach(async () => {
//     await testHelpers.cleanupTestData();
//     testUser = await testHelpers.createTestUser();
//     testToken = testHelpers.generateTestToken(testUser.id, testUser.email);
//     testProduct = await testHelpers.createTestProduct();
//   });

//   describe('GET /', () => {
//     it('should return all products', async () => {
//       const response = await request(app).get('/api/products');
//       const products = response.body as TestProduct[];
//       expect(response.status).toBe(200);
//       expect(Array.isArray(products)).toBe(true);
//       expect(products.length).toBeGreaterThan(0);
//     });
//   });

//   describe('GET /:id', () => {
//     it('should return a specific product', async () => {
//       const response = await request(app).get(
//         `/api/products/${testProduct.id}`
//       );
//       const product = response.body as TestProduct;
//       expect(response.status).toBe(200);
//       expect(product.id).toBe(testProduct.id);
//       expect(product.product_name).toBe(testProduct.product_name);
//     });

//     it('should return 404 for non-existent product', async () => {
//       const response = await request(app).get('/api/products/999999');
//       expect(response.status).toBe(404);
//     });
//   });

//   describe('POST /', () => {
//     it('should require authentication', async () => {
//       const response = await request(app)
//         .post('/api/products')
//         .send({
//           product_name: 'New Product',
//           price: 199.99,
//           category: 'headphones',
//           product_desc: 'New product description',
//           image_name: 'new-product',
//           product_features: ['Feature 1'],
//           product_accessories: ['Accessory 1'],
//         });
//       expect(response.status).toBe(401);
//     });

//     it('should create a new product when authenticated', async () => {
//       const response = await request(app)
//         .post('/api/products')
//         .set('Authorization', `Bearer ${testToken}`)
//         .send({
//           product_name: 'New Product',
//           price: 199.99,
//           category: 'headphones',
//           product_desc: 'New product description',
//           image_name: 'new-product',
//           product_features: ['Feature 1'],
//           product_accessories: ['Accessory 1'],
//         });

//       const product = response.body as TestProduct;
//       expect(response.status).toBe(201);
//       expect(product.product_name).toBe('New Product');
//     });
//   });
// });
