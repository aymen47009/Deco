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

## Quick start (local development)

1. **Backend** — in one terminal:
   ```bash
   cd server
   cp .env.example .env
   npm install
   npm run dev
   ```
   The API runs on `http://localhost:3001`.

2. **Frontend** — in another terminal:
   ```bash
   cp .env.example .env
   npm install
   npm run dev
   ```
   The app runs on `http://localhost:5173` and proxies `/api/*` to the backend.

## Environment variables

### Frontend (`.env`)
| Variable       | Description                                   | Default                  |
| -------------- | --------------------------------------------- | ------------------------ |
| `VITE_API_URL` | Base URL of the backend (no trailing slash)  | `http://localhost:3001`  |

### Backend (`server/.env`)
See `server/.env.example` and `server/README.md`.

## Deployment

- **Backend:** deploy `server/` to Render or Railway. Set `MONGODB_URI`, `CLIENT_ORIGIN` (your frontend URL), and `PORT`. See `server/README.md`.
- **Frontend:** build with `npm run build` and host the `dist/` folder (Vercel, Netlify, etc.). Set `VITE_API_URL` to your deployed backend URL at build time.

## Notes

- Mongoose schemas use `strict: false` so unexpected form fields are stored without crashing.
- The frontend shows loading spinners and error states with retry for any network hiccup.
- No Supabase dependency remains anywhere in the project.
