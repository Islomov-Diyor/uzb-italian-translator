import request from 'supertest'
import path from 'path'

process.env.JWT_SECRET = 'test_secret'
process.env.DB_PATH = path.join(__dirname, '../../test.db')

import app from '../index'
import db from '../db'

afterAll(() => {
  db.exec('DELETE FROM users')
  db.close()
})

describe('POST /api/auth/signup', () => {
  it('creates a user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'password123' })
    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
  })

  it('returns 409 if email already exists', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'dup@example.com', password: 'pass' })
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'dup@example.com', password: 'pass' })
    expect(res.status).toBe(409)
  })
})

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'login@example.com', password: 'mypassword' })
  })

  it('returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'mypassword' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrongpass' })
    expect(res.status).toBe(401)
  })
})
