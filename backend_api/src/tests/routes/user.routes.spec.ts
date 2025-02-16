// import request from 'supertest';
// import app from '../../server';
// import { dbPool } from '../../config/database.config';
// import { QueryResult } from 'pg';
// import { TestUser, AuthResponse } from './types';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';

// describe('User Routes', () => {
//   let testUser: TestUser;
//   let authToken: string;
//   const pepper = process.env.BCRYPT_PASSWORD || '';
//   const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');

//   beforeAll(async () => {
//     // Initial database setup
//     const client = await dbPool.connect();
//     try {
//       await client.query('TRUNCATE users CASCADE');
//     } finally {
//       client.release();
//     }
//   });

//   beforeEach(async () => {
//     const client = await dbPool.connect();
//     try {
//       await client.query('BEGIN');

//       // Create test user
//       const password = await bcrypt.hash('password123' + pepper, saltRounds);

//       const result: QueryResult<TestUser> = await client.query(
//         `INSERT INTO users (first_name, last_name, email, password_digest)
//                  VALUES ($1, $2, $3, $4)
//                  RETURNING id, first_name, last_name, email`,
//         ['Test', 'User', 'test@example.com', password]
//       );

//       testUser = result.rows[0];
//       await client.query('COMMIT');

//       // Generate auth token
//       authToken = jwt.sign(
//         { user: { id: testUser.id, email: testUser.email } },
//         process.env.JWT_SECRET || 'test-secret',
//         { expiresIn: '1h' }
//       );
//     } catch (err) {
//       await client.query('ROLLBACK');
//       throw err;
//     } finally {
//       client.release();
//     }
//   });

//   afterEach(async () => {
//     const client = await dbPool.connect();
//     try {
//       await client.query('TRUNCATE users CASCADE');
//     } finally {
//       client.release();
//     }
//   });

//   describe('Basic CRUD Operations', () => {
//     it('GET / should require authentication', async () => {
//       const response = await request(app).get('/api/users');

//       expect(response.status).toBe(401);
//       expect(response.body.error).toBe('Access denied, invalid token');
//     });

//     it('GET / should return users with valid auth token', async () => {
//       const response = await request(app)
//         .get('/api/users')
//         .set('Authorization', `Bearer ${authToken}`);

//       expect(response.status).toBe(200);
//       expect(Array.isArray(response.body)).toBe(true);
//       expect(response.body.length).toBeGreaterThan(0);

//       const user = response.body[0] as TestUser;
//       expect(user.email).toBe(testUser.email);
//     });

//     it('POST / should create new user', async () => {
//       const newUser = {
//         first_name: 'New',
//         last_name: 'User',
//         email: 'new@example.com',
//         password: 'password123',
//       };

//       const response = await request(app)
//         .post('/api/users')
//         .send(newUser)
//         .set('Accept', 'application/json')
//         .set('Content-Type', 'application/json');

//       expect(response.status).toBe(201);

//       const result = response.body as AuthResponse;
//       expect(result.user.email).toBe(newUser.email);
//       expect(result.token).toBeDefined();
//     });

//     it('GET /:id should return specific user', async () => {
//       const response = await request(app)
//         .get(`/api/users/${testUser.id}`)
//         .set('Authorization', `Bearer ${authToken}`);

//       expect(response.status).toBe(200);

//       const user = response.body as TestUser;
//       expect(user.id).toBe(testUser.id);
//       expect(user.email).toBe(testUser.email);
//     });

//     it('GET /:id should return 404 for non-existent user', async () => {
//       const response = await request(app)
//         .get('/api/users/99999')
//         .set('Authorization', `Bearer ${authToken}`);

//       expect(response.status).toBe(404);
//       expect(response.body.error).toBe('User not found');
//     });

//     it('GET /:id should return 403 for other users data', async () => {
//       const client = await dbPool.connect();
//       try {
//         // Create another user
//         const password = await bcrypt.hash('password123' + pepper, saltRounds);
//         const result = await client.query(
//           `INSERT INTO users (first_name, last_name, email, password_digest)
//                      VALUES ($1, $2, $3, $4)
//                      RETURNING id, first_name, last_name, email`,
//           ['Other', 'User', 'other@example.com', password]
//         );

//         const otherUser = result.rows[0];

//         const response = await request(app)
//           .get(`/api/users/${otherUser.id}`)
//           .set('Authorization', `Bearer ${authToken}`);

//         expect(response.status).toBe(403);
//         expect(response.body.error).toBe(
//           'Unauthorized access to this resource'
//         );
//       } finally {
//         client.release();
//       }
//     });
//   });
// });
