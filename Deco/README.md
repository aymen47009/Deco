# Deco Workshops

Project management app for tracking **Projects** and **Customers**, built with a React + Vite frontend and an Express + MongoDB Atlas backend.

## Structure
```
.
├── src/            # React frontend (Vite + TypeScript + Tailwind)
│   ├── api/        # REST client for the Express backend
│   ├── components/ # Views, forms, loading/error states
│   └── types.ts
├── server/         # Express + MongoDB Atlas backend (deployable)
│   └── src/
│       ├── config/db.js
│       ├── models/        # Mongoose schemas (strict: false)
│       ├── routes/        # /api/projects, /api/customers
│       └── middleware/
└── vite.config.ts  # Proxies /api → backend during dev
```

## Quick start (local)
1. **Backend:** `cd server && cp .env.example .env && npm install && npm run dev` → `http://localhost:3001`
2. **Frontend:** `cp .env.example .env && npm install && npm run dev` → `http://localhost:5173` (proxies `/api/*` to backend)

## Environment variables
- Frontend `.env`: `VITE_API_URL` (backend base URL, default `http://localhost:3001`)
- Backend `server/.env`: see `server/.env.example` and `server/README.md`

## Deployment
- **Backend:** deploy `server/` to Render/Railway. Set `MONGODB_URI`, `CLIENT_ORIGIN`, `PORT`.
- **Frontend:** `npm run build`, host `dist/`. Set `VITE_API_URL` to the deployed backend URL at build time.

## Notes
- Mongoose schemas use `strict: false` so unexpected form fields are stored safely.
- No Supabase dependency anywhere in the project.
