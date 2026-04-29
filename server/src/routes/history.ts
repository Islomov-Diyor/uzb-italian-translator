import { Router, Response } from 'express'
import db from '../db'
import { verifyToken, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(verifyToken)

router.get('/', (req: AuthRequest, res: Response): void => {
  const rows = db
    .prepare(
      'SELECT id, source_text, translated_text, direction, created_at FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
    )
    .all(req.userId)
  res.json(rows)
})

router.post('/', (req: AuthRequest, res: Response): void => {
  const { source_text, translated_text, direction } = req.body
  if (!source_text || !translated_text || !['uz-it', 'it-uz'].includes(direction)) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }
  const result = db
    .prepare(
      'INSERT INTO history (user_id, source_text, translated_text, direction) VALUES (?, ?, ?, ?)'
    )
    .run(req.userId, source_text, translated_text, direction)
  res.status(201).json({ id: result.lastInsertRowid })
})

export default router
