import { Router, Response } from 'express'
import multer from 'multer'
import axios from 'axios'
import { verifyToken, AuthRequest } from '../middleware/auth'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 } })

router.use(verifyToken)

router.post(
  '/file',
  upload.single('file'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' })
      return
    }
    const direction = req.body.direction as string
    if (!['uz-it', 'it-uz'].includes(direction)) {
      res.status(400).json({ error: 'Invalid direction' })
      return
    }
    const [sourceLang, targetLang] = direction.split('-')
    const text = req.file.buffer.toString('utf-8')
    try {
      const { data } = await axios.get('https://api.mymemory.translated.net/get', {
        params: { q: text, langpair: `${sourceLang}|${targetLang}` },
      })
      const translated: string = data.responseData?.translatedText ?? ''
      res.json({ translatedText: translated })
    } catch {
      res.status(502).json({ error: 'Translation service unavailable' })
    }
  }
)

export default router
