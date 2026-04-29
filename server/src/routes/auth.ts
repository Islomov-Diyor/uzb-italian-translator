import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import db from '../db'

const router = Router()

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' })
    return
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    res.status(409).json({ error: 'Email already exists' })
    return
  }
  const password_hash = await bcrypt.hash(password, 10)
  const result = db
    .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    .run(email, password_hash)
  const token = jwt.sign(
    { userId: result.lastInsertRowid },
    process.env.JWT_SECRET || 'fallback',
    { expiresIn: '7d' }
  )
  res.status(201).json({ token, email })
})

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' })
    return
  }
  const user = db
    .prepare('SELECT id, password_hash FROM users WHERE email = ?')
    .get(email) as { id: number; password_hash: string } | undefined
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'fallback',
    { expiresIn: '7d' }
  )
  res.status(200).json({ token, email })
})

export default router
