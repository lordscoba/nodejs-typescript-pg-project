import http from 'http';
import request from 'supertest';
import { AppDataSource } from '../src/data-source';
import app from '../src/index';

let server: http.Server;

beforeAll(async () => {
  await AppDataSource.initialize();
  console.log('Data Source has been initialized!');

  server = await http.createServer(app);
  server = await app.listen(3000, () => {
    console.log('Test server running on port 3000');
  });
});

afterAll(async () => {
  await AppDataSource.destroy();
  console.log('Data Source has been closed!');

  await server.close();
});

let randomInteger = Math.floor(Math.random() * 100) + 1;
let token = '';
let firstName = 'John' + randomInteger;

// Register
describe('POST /auth/register', () => {
  it('Should Fail If Required Fields Are Missing', async () => {
    const res = await request(app).post('/auth/register').send({});
    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('errors', expect.any(Array));
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: firstName,
        lastName: 'Doe',
        email: 'nYvFf7' + randomInteger + '@example.com',
        password: 'password123',
        phone: '1234567890',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Registration successful');
    expect(res.body.data).toHaveProperty('accessToken', expect.any(String));
    expect(res.body.data).toHaveProperty('user', expect.any(Object));

    token = res.body.data.accessToken;
  });

  it('Should Fail if there’s Duplicate Email or UserID', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: firstName,
        lastName: 'Doe',
        email: 'nYvFf7' + randomInteger + '@example.com',
        password: 'password123',
        phone: '1234567890',
      });
    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('errors', expect.any(Array));
  });
});

// Login
describe('POST /auth/login', () => {
  it('should login a user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'nYvFf7' + randomInteger + '@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body.data).toHaveProperty('accessToken', expect.any(String));
    expect(res.body.data).toHaveProperty('user', expect.any(Object));
  });
});

// Organisations
describe('GET /api/organisations', () => {
  it('Verify the default organisation name is correctly generated (e.g., "John\'s Organisation" for a user with the first name "John").', async () => {
    const res = await request(app).get('/api/organisations').set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Organisations found successfully');
    expect(res.body.data).toHaveProperty('organisations', expect.any(Array));
    expect(res.body.data.organisations[0]).toHaveProperty('name', `${firstName}'s Organisation`);
  });
});
