# Deco Workshops — Backend API

Express + MongoDB Atlas (Mongoose) backend. Deployable on Render, Railway, Vercel, or any Node host.

## Setup

```bash
cd server
cp .env.example .env      # then edit if needed
npm install
npm run dev
```

The server starts on `http://localhost:3001` (or the `PORT` env var).

## Environment variables

| Variable        | Description                                      | Default                  |
| --------------- | ------------------------------------------------ | ------------------------ |
| `MONGODB_URI`   | MongoDB Atlas connection string                  | (set in `.env.example`)  |
| `PORT`          | Port the Express server listens on               | `3001`                   |
| `CLIENT_ORIGIN` | Comma-separated allowed CORS origins (frontend)  | `http://localhost:5173`  |

## REST endpoints

### Projects
- `GET    /api/projects` — list all (optional `?status=` or `?customerId=` filters)
- `GET    /api/projects/:id`
- `POST   /api/projects`
- `PUT    /api/projects/:id`
- `DELETE /api/projects/:id`

### Customers
- `GET    /api/customers`
- `GET    /api/customers/:id`
- `POST   /api/customers`
- `PUT    /api/customers/:id`
- `DELETE /api/customers/:id`

### Health
- `GET /api/health` — returns `{ status, db, timestamp }`

## Deployment notes

- **Render / Railway:** set `MONGODB_URI`, `CLIENT_ORIGIN` (your frontend URL), and `PORT` in the service dashboard. Build command `npm install`, start command `npm start`.
- **Vercel:** this server is a long-running Express app, so use a Render/Railway-style host rather than Vercel serverless functions. If you must use Vercel, wrap `app` as a serverless handler (not recommended for persistent MongoDB connections).
- Update the frontend's `VITE_API_URL` env var to point at the deployed backend URL.
