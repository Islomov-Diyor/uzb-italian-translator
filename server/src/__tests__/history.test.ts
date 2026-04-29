import request from 'supertest'
import path from 'path'

process.env.JWT_SECRET = 'test_secret'
process.env.DB_PATH = path.join(__dirname, '../../test.db')

import app from '../index'
import db from '../db'
import jwt from 'jsonwebtoken'

let token: string
let userId: number

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ email: 'hist@example.com', password: 'pass123' })
  token = res.body.token
  const decoded = jwt.verify(token, 'test_secret') as { userId: number }
  userId = decoded.userId
})

afterAll(() => {
  db.exec(`DELETE FROM history WHERE user_id = ${userId}`)
  db.exec(`DELETE FROM users WHERE id = ${userId}`)
  db.close()
})

describe('POST /api/history', () => {
  it('saves a translation entry', async () => {
    const res = await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${token}`)
      .send({ source_text: 'Salom', translated_text: 'Ciao', direction: 'uz-it' })
    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
  })

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/history')
      .send({ source_text: 'x', translated_text: 'y', direction: 'uz-it' })
    expect(res.status).toBe(401)
  })
})

describe('GET /api/history', () => {
  it('returns user history', async () => {
    const res = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0].source_text).toBe('Salom')
  })
})
