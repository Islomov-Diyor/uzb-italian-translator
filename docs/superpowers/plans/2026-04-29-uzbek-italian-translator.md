# Uzbek ↔ Italian Translator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Uzbek ↔ Italian translator web app with JWT auth, Three.js animated background, i18n UI (en/uz/it), translation history per user, file translation, and a high-end dark glassmorphism design.

**Architecture:** Monorepo with `/client` (React+Vite+TypeScript+Tailwind) and `/server` (Express+TypeScript+SQLite). Backend handles auth and history; text translation calls MyMemory API directly from the client; file translation goes through the backend (multer). JWT stored in localStorage, sent as `Authorization: Bearer` header.

**Tech Stack:** React 18, Vite 5, TypeScript, Tailwind CSS 3, react-three-fiber, @react-three/drei, three.js, framer-motion, react-hot-toast, lucide-react, axios, react-router-dom v6, Express 4, better-sqlite3, bcrypt, jsonwebtoken, multer, concurrently, Jest, Supertest, ts-jest

---

## File Map

```
/
├── package.json                          # root: concurrently starts both
├── .env                                  # JWT_SECRET, PORT
├── .env.example
├── .gitignore
├── README.md
├── client/
│   ├── package.json
│   ├── vite.config.ts                    # proxy /api → localhost:3001
│   ├── tailwind.config.ts
│   ├── postcss.config.cjs
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx                      # ReactDOM.render + Toaster
│       ├── index.css                     # Tailwind directives + global styles
│       ├── App.tsx                       # routes + framer-motion AnimatePresence
│       ├── i18n/
│       │   └── translations.ts           # all UI strings in en/uz/it
│       ├── context/
│       │   ├── LanguageContext.tsx       # lang state + useLanguage hook
│       │   └── AuthContext.tsx           # auth state + useAuth hook
│       ├── api/
│       │   └── client.ts                 # axios instance + JWT interceptor
│       ├── components/
│       │   ├── Background3D.tsx          # Three.js canvas, all pages
│       │   ├── Navbar.tsx                # lang switcher + logout
│       │   └── ProtectedRoute.tsx        # redirects to /login if no token
│       └── pages/
│           ├── Login.tsx
│           ├── Signup.tsx
│           └── Translate.tsx             # full translator dashboard
└── server/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts                      # Express app, mounts routes
        ├── db.ts                         # SQLite init + migrations
        ├── middleware/
        │   └── auth.ts                   # verifyToken middleware
        ├── routes/
        │   ├── auth.ts                   # POST /api/auth/signup, /api/auth/login
        │   ├── history.ts                # GET/POST /api/history
        │   └── translate.ts              # POST /api/translate/file
        └── __tests__/
            ├── auth.test.ts
            ├── history.test.ts
            └── translate.test.ts
```

---

## Task 1: Root project scaffolding

**Files:**
- Create: `package.json`
- Create: `.env`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "uz-it-translator",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "install:all": "npm install && npm install --prefix client && npm install --prefix server"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 2: Create .env**

```env
JWT_SECRET=supersecretkey_change_in_production_32chars
PORT=3001
```

- [ ] **Step 3: Create .env.example**

```env
JWT_SECRET=your_jwt_secret_here
PORT=3001
```

- [ ] **Step 4: Create .gitignore**

```gitignore
node_modules/
client/node_modules/
server/node_modules/
.env
*.db
dist/
client/dist/
```

- [ ] **Step 5: Install root dependencies**

Run: `npm install`
Expected: `concurrently` installed in root `node_modules/`

---

## Task 2: Server package setup

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`

- [ ] **Step 1: Create server/package.json**

```json
{
  "name": "uz-it-translator-server",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "jest --forceExit"
  },
  "dependencies": {
    "axios": "^1.6.7",
    "bcrypt": "^5.1.1",
    "better-sqlite3": "^9.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/better-sqlite3": "^7.6.8",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.11.24",
    "@types/supertest": "^6.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.4",
    "ts-jest": "^29.1.2",
    "tsx": "^4.7.1",
    "typescript": "^5.4.2"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "testMatch": ["**/__tests__/**/*.test.ts"]
  }
}
```

- [ ] **Step 2: Create server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Install server dependencies**

Run: `cd server && npm install`
Expected: all packages installed, no errors

---

## Task 3: Database setup

**Files:**
- Create: `server/src/db.ts`

- [ ] **Step 1: Create server/src/db.ts**

```typescript
import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data.db')

const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    direction TEXT NOT NULL CHECK(direction IN ('uz-it', 'it-uz')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`)

export default db
```

---

## Task 4: JWT auth middleware

**Files:**
- Create: `server/src/middleware/auth.ts`

- [ ] **Step 1: Create server/src/middleware/auth.ts**

```typescript
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: number
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' })
    return
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback') as { userId: number }
    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

---

## Task 5: Auth routes + tests

**Files:**
- Create: `server/src/routes/auth.ts`
- Create: `server/src/__tests__/auth.test.ts`

- [ ] **Step 1: Write failing test for signup**

Create `server/src/__tests__/auth.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && npm test -- --testPathPattern=auth`
Expected: FAIL (app not yet exported)

- [ ] **Step 3: Create stub files so index.ts compiles for tests**

Create `server/src/routes/history.ts` (stub — replaced in Task 6):

```typescript
import { Router } from 'express'
const router = Router()
export default router
```

Create `server/src/routes/translate.ts` (stub — replaced in Task 7):

```typescript
import { Router } from 'express'
const router = Router()
export default router
```

- [ ] **Step 4: Create server/src/routes/auth.ts**

```typescript
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
```

- [ ] **Step 5: Create server/src/index.ts**

```typescript
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
```

- [ ] **Step 6: Run auth tests to verify they pass**

Run: `cd server && npm test -- --testPathPattern=auth`
Expected: PASS (all 4 tests)

- [ ] **Step 7: Commit**

```bash
git add server/
git commit -m "feat: server setup with auth routes and JWT middleware"
```

---

## Task 6: History routes + tests

**Files:**
- Modify: `server/src/routes/history.ts` (replace stub from Task 5)
- Create: `server/src/__tests__/history.test.ts`

- [ ] **Step 1: Write failing tests**

Create `server/src/__tests__/history.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && npm test -- --testPathPattern=history`
Expected: FAIL

- [ ] **Step 3: Create server/src/routes/history.ts**

```typescript
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
```

- [ ] **Step 4: Run history tests to verify they pass**

Run: `cd server && npm test -- --testPathPattern=history`
Expected: PASS (all 3 tests)

---

## Task 7: File translation route + tests

**Files:**
- Modify: `server/src/routes/translate.ts` (replace stub from Task 5)
- Create: `server/src/__tests__/translate.test.ts`

- [ ] **Step 1: Write failing test**

Create `server/src/__tests__/translate.test.ts`:

```typescript
import request from 'supertest'
import path from 'path'
import fs from 'fs'

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && npm test -- --testPathPattern=translate`
Expected: FAIL

- [ ] **Step 3: Create server/src/routes/translate.ts**

```typescript
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
```

- [ ] **Step 4: Run translate tests to verify they pass**

Run: `cd server && npm test -- --testPathPattern=translate`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add server/src/routes/ server/src/__tests__/
git commit -m "feat: history and file translation routes with tests"
```

---

## Task 8: Client package setup

**Files:**
- Create: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/vite.config.ts`
- Create: `client/tailwind.config.ts`
- Create: `client/postcss.config.cjs`

- [ ] **Step 1: Create client/package.json**

```json
{
  "name": "uz-it-translator-client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@react-three/drei": "^9.99.0",
    "@react-three/fiber": "^8.15.19",
    "axios": "^1.6.7",
    "framer-motion": "^11.0.8",
    "lucide-react": "^0.363.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.22.3",
    "three": "^0.162.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@types/three": "^0.162.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.6"
  }
}
```

- [ ] **Step 2: Create client/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create client/vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
```

- [ ] **Step 4: Create client/tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 5: Create client/postcss.config.cjs**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: Install client dependencies**

Run: `cd client && npm install`
Expected: all packages installed

---

## Task 9: Client entry point + global styles

**Files:**
- Create: `client/index.html`
- Create: `client/src/main.tsx`
- Create: `client/src/index.css`

- [ ] **Step 1: Create client/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Uz ↔ It Translator</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create client/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    box-sizing: border-box;
  }
  html,
  body,
  #root {
    height: 100%;
    margin: 0;
    padding: 0;
  }
  body {
    background-color: #0a0a0f;
    color: #f1f5f9;
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.03);
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.4);
    border-radius: 3px;
  }
}

@layer utilities {
  .glass {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .glass-strong {
    background: rgba(255, 255, 255, 0.07);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
}
```

- [ ] **Step 3: Create client/src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(15, 15, 25, 0.95)',
          color: '#f1f5f9',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
        },
      }}
    />
  </React.StrictMode>
)
```

---

## Task 10: i18n system

**Files:**
- Create: `client/src/i18n/translations.ts`
- Create: `client/src/context/LanguageContext.tsx`

- [ ] **Step 1: Create client/src/i18n/translations.ts**

```typescript
export type Lang = 'en' | 'uz' | 'it'

export const translations = {
  // Auth
  login: { en: 'Login', uz: 'Kirish', it: 'Accedi' },
  signup: { en: 'Sign Up', uz: "Ro'yxatdan o'tish", it: 'Registrati' },
  email: { en: 'Email', uz: 'Elektron pochta', it: 'Email' },
  password: { en: 'Password', uz: 'Parol', it: 'Password' },
  noAccount: { en: "Don't have an account?", uz: "Hisobingiz yo'qmi?", it: 'Non hai un account?' },
  hasAccount: { en: 'Already have an account?', uz: 'Hisobingiz bormi?', it: 'Hai già un account?' },
  loginError: { en: 'Invalid email or password', uz: "Noto'g'ri email yoki parol", it: 'Email o password non validi' },
  signupError: { en: 'Email already in use', uz: 'Bu email allaqachon ishlatilmoqda', it: 'Email già in uso' },
  fieldRequired: { en: 'All fields are required', uz: "Barcha maydonlar to'ldirilishi shart", it: 'Tutti i campi sono obbligatori' },
  loginSuccess: { en: 'Welcome back!', uz: 'Xush kelibsiz!', it: 'Bentornato!' },
  signupSuccess: { en: 'Account created!', uz: 'Hisob yaratildi!', it: 'Account creato!' },
  logout: { en: 'Logout', uz: 'Chiqish', it: 'Esci' },

  // Translator
  translate: { en: 'Translate', uz: 'Tarjima qilish', it: 'Traduci' },
  translating: { en: 'Translating...', uz: 'Tarjima qilinmoqda...', it: 'Traduzione in corso...' },
  sourceText: { en: 'Enter text...', uz: 'Matn kiriting...', it: 'Inserisci testo...' },
  translation: { en: 'Translation', uz: 'Tarjima', it: 'Traduzione' },
  words: { en: 'words', uz: "so'z", it: 'parole' },
  copied: { en: 'Copied!', uz: 'Nusxalandi!', it: 'Copiato!' },
  copy: { en: 'Copy', uz: 'Nusxalash', it: 'Copia' },
  uploadFile: { en: 'Upload .txt file', uz: '.txt fayl yuklash', it: 'Carica file .txt' },
  downloadTranslation: { en: 'Download translation', uz: "Tarjimani yuklab olish", it: 'Scarica traduzione' },
  translatingFile: { en: 'Translating file...', uz: 'Fayl tarjima qilinmoqda...', it: 'Traduzione file...' },
  fileError: { en: 'File translation failed', uz: "Fayl tarjima qilishda xatolik", it: 'Traduzione file fallita' },
  translateError: { en: 'Translation failed. Try again.', uz: "Tarjima xatosi. Qayta urinib ko'ring.", it: 'Traduzione fallita. Riprova.' },
  networkError: { en: 'Network error. Check your connection.', uz: "Tarmoq xatosi. Aloqani tekshiring.", it: 'Errore di rete. Controlla la connessione.' },

  // History
  history: { en: 'History', uz: 'Tarix', it: 'Cronologia' },
  noHistory: { en: 'No translations yet', uz: 'Hali tarjimalar yo\'q', it: 'Nessuna traduzione ancora' },
  clearHistory: { en: 'Clear', uz: 'Tozalash', it: 'Cancella' },

  // Navbar
  appName: { en: 'Uz ↔ It', uz: "O'z ↔ It", it: 'Uz ↔ It' },
} as const

export type TranslationKey = keyof typeof translations
```

- [ ] **Step 2: Create client/src/context/LanguageContext.tsx**

```tsx
import React, { createContext, useContext, useState, useCallback } from 'react'
import { translations, Lang, TranslationKey } from '../i18n/translations'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('lang') as Lang) || 'en'
  )

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem('lang', l)
    setLangState(l)
  }, [])

  const t = useCallback(
    (key: TranslationKey) => translations[key][lang],
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
```

---

## Task 11: Auth context + API client

**Files:**
- Create: `client/src/api/client.ts`
- Create: `client/src/context/AuthContext.tsx`

- [ ] **Step 1: Create client/src/api/client.ts**

```typescript
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
```

- [ ] **Step 2: Create client/src/context/AuthContext.tsx**

```tsx
import React, { createContext, useContext, useState, useCallback } from 'react'

interface AuthContextValue {
  token: string | null
  email: string | null
  login: (token: string, email: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  )
  const [email, setEmail] = useState<string | null>(
    () => localStorage.getItem('email')
  )

  const login = useCallback((t: string, e: string) => {
    localStorage.setItem('token', t)
    localStorage.setItem('email', e)
    setToken(t)
    setEmail(e)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    setToken(null)
    setEmail(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, email, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

---

## Task 12: App routing

**Files:**
- Create: `client/src/components/ProtectedRoute.tsx`
- Create: `client/src/App.tsx`

- [ ] **Step 1: Create client/src/components/ProtectedRoute.tsx**

```tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}
```

- [ ] **Step 2: Create client/src/App.tsx**

```tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Translate from './pages/Translate'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/translate"
          element={
            <ProtectedRoute>
              <Translate />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
```

---

## Task 13: Three.js Background component

**Files:**
- Create: `client/src/components/Background3D.tsx`

- [ ] **Step 1: Create client/src/components/Background3D.tsx**

```tsx
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PURPLE = '#7c3aed'
const INDIGO = '#4f46e5'
const VIOLET = '#8b5cf6'

function Column({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  const speed = useMemo(() => Math.random() * 0.0004 + 0.0001, [])
  const drift = useMemo(
    () => ({ x: (Math.random() - 0.5) * 0.0004, y: (Math.random() - 0.5) * 0.0002 }),
    []
  )
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.y += speed
    ref.current.position.x += drift.x
    ref.current.position.y += drift.y
    if (ref.current.position.x > 18) ref.current.position.x = -18
    if (ref.current.position.x < -18) ref.current.position.x = 18
    if (ref.current.position.y > 12) ref.current.position.y = -12
    if (ref.current.position.y < -12) ref.current.position.y = 12
  })
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.12, 0.18, 3.5, 6]} />
      <meshBasicMaterial color={PURPLE} wireframe transparent opacity={0.25} />
    </mesh>
  )
}

function Arch({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  const speed = useMemo(() => (Math.random() - 0.5) * 0.0006, [])
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.x += speed * 0.7
    ref.current.rotation.z += speed
  })
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[1.2, 0.06, 8, 32, Math.PI]} />
      <meshBasicMaterial color={INDIGO} wireframe transparent opacity={0.3} />
    </mesh>
  )
}

function Gem({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  const rot = useMemo(
    () => ({ x: (Math.random() - 0.5) * 0.0008, y: (Math.random() - 0.5) * 0.001 }),
    []
  )
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.x += rot.x
    ref.current.rotation.y += rot.y
  })
  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.6 + Math.random() * 0.4, 0]} />
      <meshBasicMaterial color={VIOLET} wireframe transparent opacity={0.35} />
    </mesh>
  )
}

function Mountain({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  const speed = useMemo(() => (Math.random() - 0.5) * 0.0003, [])
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.y += speed
  })
  return (
    <mesh ref={ref} position={position}>
      <coneGeometry args={[0.8, 2.2, 5]} />
      <meshBasicMaterial color={INDIGO} wireframe transparent opacity={0.2} />
    </mesh>
  )
}

function Ring({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  const speed = useMemo(() => (Math.random() - 0.5) * 0.0008, [])
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.x += speed
    ref.current.rotation.y += speed * 0.6
  })
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[1.5, 0.05, 6, 40]} />
      <meshBasicMaterial color={PURPLE} wireframe transparent opacity={0.2} />
    </mesh>
  )
}

function Scene() {
  const columns = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 18,
        -5 - Math.random() * 10,
      ] as [number, number, number]),
    []
  )
  const arches = useMemo(
    () =>
      Array.from({ length: 6 }, () => [
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 16,
        -6 - Math.random() * 8,
      ] as [number, number, number]),
    []
  )
  const gems = useMemo(
    () =>
      Array.from({ length: 12 }, () => [
        (Math.random() - 0.5) * 32,
        (Math.random() - 0.5) * 20,
        -4 - Math.random() * 12,
      ] as [number, number, number]),
    []
  )
  const mountains = useMemo(
    () =>
      Array.from({ length: 7 }, () => [
        (Math.random() - 0.5) * 30,
        -4 - Math.random() * 8,
        -7 - Math.random() * 8,
      ] as [number, number, number]),
    []
  )
  const rings = useMemo(
    () =>
      Array.from({ length: 5 }, () => [
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 14,
        -8 - Math.random() * 6,
      ] as [number, number, number]),
    []
  )
  return (
    <>
      <ambientLight intensity={0.1} />
      {columns.map((p, i) => <Column key={`col-${i}`} position={p} />)}
      {arches.map((p, i) => <Arch key={`arch-${i}`} position={p} />)}
      {gems.map((p, i) => <Gem key={`gem-${i}`} position={p} />)}
      {mountains.map((p, i) => <Mountain key={`mtn-${i}`} position={p} />)}
      {rings.map((p, i) => <Ring key={`ring-${i}`} position={p} />)}
    </>
  )
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: '#0a0a0f' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
```

---

## Task 14: Navbar component

**Files:**
- Create: `client/src/components/Navbar.tsx`

- [ ] **Step 1: Create client/src/components/Navbar.tsx**

```tsx
import { LogOut, Globe } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Lang } from '../i18n/translations'

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'uz', label: 'UZ', flag: '🇺🇿' },
  { code: 'it', label: 'IT', flag: '🇮🇹' },
]

export default function Navbar() {
  const { lang, setLang, t } = useLanguage()
  const { isAuthenticated, logout, email } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <span className="font-semibold text-lg bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          {t('appName')}
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 glass rounded-lg px-2 py-1">
            <Globe size={14} className="text-violet-400 mr-1" />
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  lang === l.code
                    ? 'bg-violet-600/60 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          {isAuthenticated && (
            <>
              {email && (
                <span className="text-xs text-slate-500 hidden sm:block">{email}</span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors glass rounded-lg px-3 py-1.5"
              >
                <LogOut size={13} />
                {t('logout')}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
```

---

## Task 15: Login page

**Files:**
- Create: `client/src/pages/Login.tsx`

- [ ] **Step 1: Create client/src/pages/Login.tsx**

```tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import Background3D from '../components/Background3D'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Login() {
  const { t } = useLanguage()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error(t('fieldRequired'))
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.token, data.email)
      toast.success(t('loginSuccess'))
      navigate('/translate')
    } catch (err: any) {
      const status = err.response?.status
      if (status === 401) toast.error(t('loginError'))
      else toast.error(t('networkError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Background3D />
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="glass-strong rounded-2xl p-8 shadow-2xl shadow-violet-900/20">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-1">
                {t('login')}
              </h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-violet-900/40"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {t('login')}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              {t('noAccount')}{' '}
              <Link to="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
                {t('signup')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
```

---

## Task 16: Signup page

**Files:**
- Create: `client/src/pages/Signup.tsx`

- [ ] **Step 1: Create client/src/pages/Signup.tsx**

```tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import Background3D from '../components/Background3D'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Signup() {
  const { t } = useLanguage()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error(t('fieldRequired'))
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup', { email, password })
      login(data.token, data.email)
      toast.success(t('signupSuccess'))
      navigate('/translate')
    } catch (err: any) {
      const status = err.response?.status
      if (status === 409) toast.error(t('signupError'))
      else toast.error(t('networkError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Background3D />
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="glass-strong rounded-2xl p-8 shadow-2xl shadow-violet-900/20">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-1">
                {t('signup')}
              </h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-all"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-violet-900/40"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {t('signup')}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              {t('hasAccount')}{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
                {t('login')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
```

---

## Task 17: Translate page

**Files:**
- Create: `client/src/pages/Translate.tsx`

- [ ] **Step 1: Create client/src/pages/Translate.tsx**

```tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowLeftRight,
  Copy,
  Check,
  Upload,
  Download,
  Loader2,
  Clock,
  ChevronRight,
} from 'lucide-react'
import Background3D from '../components/Background3D'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import api from '../api/client'
import axios from 'axios'

type Direction = 'uz-it' | 'it-uz'

interface HistoryItem {
  id: number
  source_text: string
  translated_text: string
  direction: Direction
  created_at: string
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export default function Translate() {
  const { t } = useLanguage()
  const [direction, setDirection] = useState<Direction>('uz-it')
  const [sourceText, setSourceText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [translating, setTranslating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historySidebarOpen, setHistorySidebarOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await api.get<HistoryItem[]>('/history')
      setHistory(data)
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const saveToHistory = useCallback(
    async (source: string, translated: string, dir: Direction) => {
      try {
        await api.post('/history', {
          source_text: source,
          translated_text: translated,
          direction: dir,
        })
        fetchHistory()
      } catch {
        // silently fail
      }
    },
    [fetchHistory]
  )

  const doTranslate = useCallback(
    async (text: string, dir: Direction) => {
      if (!text.trim()) {
        setOutputText('')
        return
      }
      setTranslating(true)
      try {
        const [src, tgt] = dir.split('-')
        const { data } = await axios.get('https://api.mymemory.translated.net/get', {
          params: { q: text, langpair: `${src}|${tgt}` },
        })
        const result: string = data.responseData?.translatedText ?? ''
        setOutputText(result)
        saveToHistory(text, result, dir)
      } catch {
        toast.error(t('translateError'))
      } finally {
        setTranslating(false)
      }
    },
    [t, saveToHistory]
  )

  const handleSourceChange = (val: string) => {
    setSourceText(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      doTranslate(val, direction)
    }, 800)
  }

  const handleSwap = () => {
    const newDir: Direction = direction === 'uz-it' ? 'it-uz' : 'uz-it'
    setDirection(newDir)
    setSourceText(outputText)
    setOutputText(sourceText)
    if (outputText.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        doTranslate(outputText, newDir)
      }, 100)
    }
  }

  const handleCopy = async () => {
    if (!outputText) return
    await navigator.clipboard.writeText(outputText)
    setCopied(true)
    toast.success(t('copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setFileLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('direction', direction)
      const { data } = await api.post<{ translatedText: string }>('/translate/file', formData)
      const blob = new Blob([data.translatedText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `translated_${file.name}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t('downloadTranslation'))
    } catch {
      toast.error(t('fileError'))
    } finally {
      setFileLoading(false)
    }
  }

  const loadHistoryItem = (item: HistoryItem) => {
    setDirection(item.direction)
    setSourceText(item.source_text)
    setOutputText(item.translated_text)
    setHistorySidebarOpen(false)
  }

  const [srcLang, tgtLang] = direction === 'uz-it' ? ["O'zbek", 'Italiano'] : ['Italiano', "O'zbek"]

  return (
    <div className="min-h-screen flex flex-col">
      <Background3D />
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex-1 pt-14 flex overflow-hidden"
      >
        {/* History Sidebar */}
        <motion.div
          animate={{ width: historySidebarOpen ? 300 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden flex-shrink-0"
        >
          <div className="w-[300px] h-full glass border-r border-white/10 flex flex-col">
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <Clock size={14} className="text-violet-400" />
              <span className="text-sm font-medium text-slate-300">{t('history')}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">{t('noHistory')}</p>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full text-left glass rounded-xl p-3 hover:bg-white/8 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-violet-400 font-medium">
                        {item.direction === 'uz-it' ? "O'z → It" : 'It → Oz'}
                      </span>
                      <ChevronRight
                        size={12}
                        className="text-slate-600 group-hover:text-slate-400 transition-colors"
                      />
                    </div>
                    <p className="text-xs text-slate-400 truncate">{item.source_text}</p>
                    <p className="text-xs text-slate-600 truncate">{item.translated_text}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 gap-4 overflow-auto">
          {/* Direction bar */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setHistorySidebarOpen((v) => !v)}
              className="flex items-center gap-1.5 glass rounded-xl px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <Clock size={13} />
              {t('history')}
            </button>

            <div className="flex items-center gap-3 glass rounded-2xl px-5 py-2.5">
              <span className="text-sm font-semibold text-violet-300">{srcLang}</span>
              <button
                onClick={handleSwap}
                className="p-1.5 rounded-lg hover:bg-violet-600/30 transition-colors text-slate-400 hover:text-white"
              >
                <ArrowLeftRight size={16} />
              </button>
              <span className="text-sm font-semibold text-indigo-300">{tgtLang}</span>
            </div>

            {/* File upload */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={fileLoading}
                className="flex items-center gap-1.5 glass rounded-xl px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                {fileLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Upload size={13} />
                )}
                {fileLoading ? t('translatingFile') : t('uploadFile')}
              </button>
            </div>
          </div>

          {/* Textareas */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
            {/* Source */}
            <div className="glass-strong rounded-2xl flex flex-col overflow-hidden min-h-[300px]">
              <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-medium text-violet-300">{srcLang}</span>
                <span className="text-xs text-slate-500">
                  {wordCount(sourceText)} {t('words')}
                </span>
              </div>
              <textarea
                value={sourceText}
                onChange={(e) => handleSourceChange(e.target.value)}
                placeholder={t('sourceText')}
                className="flex-1 bg-transparent resize-none p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Output */}
            <div className="glass-strong rounded-2xl flex flex-col overflow-hidden min-h-[300px]">
              <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-medium text-indigo-300">{tgtLang}</span>
                <button
                  onClick={handleCopy}
                  disabled={!outputText}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-300 transition-colors disabled:opacity-30"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? t('copied') : t('copy')}
                </button>
              </div>
              <div className="flex-1 p-4 relative">
                {translating ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 size={14} className="animate-spin" />
                    {t('translating')}
                  </div>
                ) : (
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {outputText}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/
git commit -m "feat: complete client with auth pages and translator dashboard"
```

---

## Task 18: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README.md**

```markdown
# Uzbek ↔ Italian Translator

Full-stack web app for translating between Uzbek and Italian. Dark glassmorphism UI with animated Three.js background.

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and set a strong JWT_SECRET
   ```

3. **Run in development:**
   ```bash
   npm run dev
   ```
   - Client: http://localhost:5173
   - Server: http://localhost:3001

## Running tests

```bash
cd server && npm test
```

## Tech stack

- Frontend: React + Vite + TypeScript + Tailwind CSS + Three.js + framer-motion
- Backend: Node.js + Express + TypeScript + SQLite (better-sqlite3)
- Auth: JWT + bcrypt
- Translation: [MyMemory API](https://mymemory.translated.net/) (free, no key required)
```

- [ ] **Step 2: Final commit**

```bash
git add README.md .env.example
git commit -m "docs: add README with setup instructions"
```

---

## Task 19: Verify full app works

- [ ] **Step 1: Install all and start**

Run: `npm run install:all && npm run dev`
Expected: Server on :3001, client on :5173, no errors in console

- [ ] **Step 2: Verify signup flow**

Open http://localhost:5173 — should redirect to /login.
Navigate to /signup, create an account → should redirect to /translate with toast "Account created!"

- [ ] **Step 3: Verify translator**

Type "Salom, qanday yashayapsiz?" in source with direction uz→it.
Expected: Italian translation appears after ~800ms debounce.

- [ ] **Step 4: Verify history sidebar**

Click History button → sidebar opens showing the translation just made.
Click the history item → source + output restored into textareas.

- [ ] **Step 5: Verify file translation**

Create a test file `test.txt` with content "Salom dunyo".
Click "Upload .txt file" → browser downloads `translated_test.txt` with Italian translation.

- [ ] **Step 6: Verify language switch**

Click 🇺🇿 UZ in navbar → all UI text switches to Uzbek.
Reload page → Uzbek language persists.

- [ ] **Step 7: Verify logout**

Click Logout → redirected to /login. Navigating to /translate redirects back to /login.
