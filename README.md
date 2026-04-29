# Uzbek ↔ Italian Translator

Full-stack web app for translating between Uzbek and Italian. Features a dark glassmorphism UI with an animated Three.js background, JWT authentication, translation history, and file translation.

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

**1. Install all dependencies:**
```bash
npm run install:all
```

**2. Configure environment:**
```bash
cp .env.example .env
# Edit .env and set a strong JWT_SECRET (32+ chars)
```

**3. Run in development:**
```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001

## Running tests

```bash
cd server && npm test
```

## Features

- Uzbek ↔ Italian text translation (MyMemory API, free, no key needed)
- File translation: upload a `.txt` file → download translated `.txt`
- JWT authentication (signup / login)
- Translation history per user (stored in SQLite, click to restore)
- UI language switcher: English 🇬🇧 / Uzbek 🇺🇿 / Italian 🇮🇹
- Animated 3D background (Three.js — Roman columns, Venetian arches, geometric gems, mountain cones)

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS (glassmorphism) |
| 3D Background | Three.js via react-three-fiber |
| Animations | framer-motion |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite via better-sqlite3 |
| Auth | JWT + bcrypt |
| Translation | [MyMemory API](https://mymemory.translated.net/) |
