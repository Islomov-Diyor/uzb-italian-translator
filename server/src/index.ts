import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth'
import historyRouter from './routes/history'
import translateRouter from './routes/translate'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/history', historyRouter)
app.use('/api/translate', translateRouter)

if (require.main === module) {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

export default app
