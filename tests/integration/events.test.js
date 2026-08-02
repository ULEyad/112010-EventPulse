process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../app');
const User = require('../../models/User');
const Category = require('../../models/Category');

let mongoServer;
let adminToken;
let category;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashedPassword = await bcrypt.hash('password123', 12);
  await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: hashedPassword,
    role: 'admin',
  });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'password123' });

  adminToken = loginRes.body.token;

  category = await Category.create({ name: 'Tech', description: 'Tech events' });
}, 60000);

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);

describe('Events API', () => {
  it('creates an event as admin', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Backend Workshop',
        description: 'A hands-on workshop about Node.js APIs',
        category: category._id.toString(),
        date: '2026-09-01T10:00:00Z',
        city: 'Port Said',
        capacity: 20,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.event.name).toBe('Backend Workshop');
  });

  it('rejects event creation without a token', async () => {
    const res = await request(app).post('/api/events').send({ name: 'No Auth Event' });
    expect(res.statusCode).toBe(401);
  });

  it('rejects event creation from a non-admin (attendee) token', async () => {
    const attendeePassword = await bcrypt.hash('password123', 12);
    await User.create({
      name: 'Attendee',
      email: 'attendee@test.com',
      password: attendeePassword,
      role: 'attendee',
    });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'attendee@test.com', password: 'password123' });

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .send({
        name: 'Should Fail',
        description: 'Attendees cannot create events',
        category: category._id.toString(),
        date: '2026-09-01T10:00:00Z',
        city: 'Cairo',
        capacity: 10,
      });

    expect(res.statusCode).toBe(403);
  });

  it('lists events with pagination metadata', async () => {
    const res = await request(app).get('/api/events?page=1&limit=5');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page', 1);
    expect(Array.isArray(res.body.data.events)).toBe(true);
  });

  it('filters events by city', async () => {
    const res = await request(app).get('/api/events?city=Port Said');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.events.every((e) => e.city === 'Port Said')).toBe(true);
  });

  it('returns an empty list (not an error) for a search with no matches', async () => {
    const res = await request(app).get('/api/events?search=zzzznomatchzzzz');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.events).toHaveLength(0);
  });

  it('returns 404 for a non-existent event id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/events/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });
});
