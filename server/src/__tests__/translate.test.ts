import request from 'supertest'
import path from 'path'

process.env.JWT_SECRET = 'test_secret'
process.env.DB_PATH = path.join(__dirname, '../../test.db')

import app from '../index'

let token: string

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ email: 'trans@example.com', password: 'pass123' })
  token = res.body.token
})

describe('POST /api/translate/file', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/translate/file')
    expect(res.status).toBe(401)
  })

  it('returns 400 if no file provided', async () => {
    const res = await request(app)
      .post('/api/translate/file')
      .set('Authorization', `Bearer ${token}`)
      .field('direction', 'uz-it')
    expect(res.status).toBe(400)
  })
})
