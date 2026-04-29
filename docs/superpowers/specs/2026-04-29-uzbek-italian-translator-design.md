# Uzbek ↔ Italian Translator Web App — Design Spec
Date: 2026-04-29

## Overview
Full-stack web app for translating between Uzbek and Italian. JWT-authenticated, with translation history, file translation, i18n UI (en/uz/it), and a high-end dark glassmorphism design with an animated Three.js background.

## Architecture
- **Monorepo (Option A):** root `package.json` runs client + server concurrently via `concurrently`
- **Frontend:** React + Vite + TypeScript, Tailwind CSS, react-three-fiber (Three.js), framer-motion
- **Backend:** Node.js + Express + TypeScript, better-sqlite3, JWT (jsonwebtoken), bcrypt
- **Translation:** MyMemory free API (no key required)

## Folder Structure
```
/
├── package.json            # root dev script
├── .env                    # JWT_SECRET, PORT
├── client/
│   ├── src/
│   │   ├── i18n/translations.ts
│   │   ├── components/Background3D.tsx
│   │   ├── components/Navbar.tsx
│   │   ├── components/Toast.tsx
│   │   ├── pages/Login.tsx
│   │   ├── pages/Signup.tsx
│   │   ├── pages/Translate.tsx
│   │   ├── hooks/useAuth.ts
│   │   └── api/client.ts
└── server/
    └── src/
        ├── index.ts
        ├── db.ts
        ├── routes/auth.ts
        ├── routes/history.ts
        └── middleware/auth.ts
```

## Backend

### Database (SQLite via better-sqlite3)
- `users` table: `id`, `email`, `password_hash`, `created_at`
- `history` table: `id`, `user_id`, `source_text`, `translated_text`, `direction` (uz-it | it-uz), `created_at`

### API Routes
- `POST /api/auth/signup` — email + password → create user, return JWT
- `POST /api/auth/login` — email + password → verify, return JWT
- `GET /api/history` — auth required, returns user's translation history (newest first, limit 50)
- `POST /api/history` — auth required, saves a translation entry
- `POST /api/translate/file` — auth required, accepts .txt file, returns translated text

### Auth
- Passwords hashed with bcrypt (10 rounds)
- JWT signed with `JWT_SECRET` from `.env`, expiry 7 days
- JWT passed as `Authorization: Bearer <token>` header
- Token stored in `localStorage` on client

## Frontend

### Routes
- `/login` — public
- `/signup` — public
- `/translate` — protected (redirects to /login if no token)

### i18n
- `translations.ts` exports a map of keys → `{ en, uz, it }` strings
- Active language stored in React context, persisted to localStorage
- Language switcher in Navbar: 🇬🇧 EN / 🇺🇿 UZ / 🇮🇹 IT

### Three.js Background (`Background3D.tsx`)
- Shared component rendered on all pages (behind page content)
- Elements: Roman columns, Venetian arch wireframes, gondola silhouettes, Silk Road star shapes, mountain-inspired geometric forms, floating Latin + Uzbek Latin letters
- All as subtle wireframe/line geometry, slowly rotating and drifting
- Dark theme, low opacity — purely decorative

### Translator Page Features
1. Two text areas: source (left) + output (right)
2. Language direction selector with swap button (uz→it / it→uz)
3. Real-time word count on source textarea
4. Translate button → calls MyMemory API via backend proxy or directly from client
5. Copy-to-clipboard button on output
6. File upload: .txt → translated .txt download
7. History sidebar: scrollable list of past translations; clicking one restores source + result into textareas

### UI Design
- Dark background (#0a0a0f)
- Glassmorphism cards: `bg-white/5 backdrop-blur border border-white/10`
- Smooth framer-motion page transitions (opacity + slide)
- Toast notifications (success/error, translated in current language)
- Loading spinners on translate/file actions
- Fully responsive, mobile-first

## Error Handling
- All API errors return `{ error: string }` JSON
- Client shows translated error toasts
- Network errors caught globally in axios interceptor

## README
Includes: prerequisites, `npm install` at root, `.env` setup, `npm run dev`
