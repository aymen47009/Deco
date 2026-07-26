# Deco Workshops — Backend API

Express + MongoDB Atlas (Mongoose) backend. Deployable on Render, Railway, or any Node host.

## Setup
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
Server starts on `http://localhost:3001` (or `PORT`).

## Environment variables
| Variable | Description | Default |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string | (in `.env.example`) |
| `PORT` | Port the Express server listens on | `3001` |
| `CLIENT_ORIGIN` | Comma-separated allowed CORS origins | `http://localhost:5173` |

## REST endpoints
- `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id` (optional `?status=` or `?customerId=` filters)
- `GET/POST /api/customers`, `GET/PUT/DELETE /api/customers/:id`
- `GET /api/health`

## Deployment
- **Render / Railway:** set `MONGODB_URI`, `CLIENT_ORIGIN`, `PORT`. Build: `npm install`, start: `npm start`.
- Update the frontend's `VITE_API_URL` to the deployed backend URL.
