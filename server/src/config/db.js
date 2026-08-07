import mongoose from "mongoose";
import { migrateProjectCodeIndex } from "../models/Project.js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("[db] FATAL: MONGODB_URI is not set. The server cannot start.");
  process.exit(1);
}

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  mongoose.set("strictQuery", true);
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log(`[db] Connected to MongoDB Atlas: ${conn.connection.host}/${conn.connection.name}`);
    await migrateProjectCodeIndex();
  } catch (err) {
    console.error("[db] Failed to connect to MongoDB Atlas:", err.message);
    throw err;
  }
}

export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
