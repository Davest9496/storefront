// import request from 'supertest';
// import app from '../../server';
// import { testHelpers } from './helpers';
// import { TestUser, TestProduct, TestOrder } from './types';

// describe('Order Routes', () => {
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
//     it('should require authentication', async () => {
//       const response = await request(app).get('/api/orders');
//       expect(response.status).toBe(401);
//     });

//     it('should return all orders when authenticated', async () => {
//       const response = await request(app)
//         .get('/api/orders')
//         .set('Authorization', `Bearer ${testToken}`);
//       expect(response.status).toBe(200);
//       expect(Array.isArray(response.body)).toBe(true);
//     });
//   });

//   describe('POST /', () => {
//     it('should create a new order', async () => {
//       const response = await request(app)
//         .post('/api/orders')
//         .set('Authorization', `Bearer ${testToken}`);

//       const order = response.body as TestOrder;
//       expect(response.status).toBe(201);
//       expect(order.id).toBeDefined();
//       expect(order.user_id).toBe(testUser.id);
//       expect(order.status).toBe('active');
//     });
//   });

//   describe('POST /:id/products', () => {
//     it('should add a product to an order', async () => {
//       // First create an order
//       const orderResponse = await request(app)
//         .post('/api/orders')
//         .set('Authorization', `Bearer ${testToken}`);

//       const order = orderResponse.body as TestOrder;

//       // Then add a product to it
//       const response = await request(app)
//         .post(`/api/orders/${order.id}/products`)
//         .set('Authorization', `Bearer ${testToken}`)
//         .send({
//           productId: testProduct.id,
//           quantity: 2,
//         });

//       expect(response.status).toBe(200);
//       expect(response.body.quantity).toBe(2);
//       expect(response.body.product_id).toBe(testProduct.id);
//     });
//   });
// });
