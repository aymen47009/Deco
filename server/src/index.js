import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { connectDB, isDBConnected } from "./config/db.js";
import projectsRouter from "./routes/projects.js";
import customersRouter from "./routes/customers.js";
import { notFound, errorHandler } from "./middleware/error.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    db: isDBConnected() ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/projects", projectsRouter);
app.use("/api/customers", customersRouter);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] Deco Workshops API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[server] Failed to start:", err.message);
    process.exit(1);
  });
