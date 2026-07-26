import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "./models/User.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const existing = await User.findOne({ phone: "admin" });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }
  const hashed = await bcrypt.hash("admin123", 10);
  await User.create({
    name: "المدير العام",
    phone: "admin",
    password: hashed,
    role: "admin",
    totalEarnings: 0,
    pendingDues: 0,
    active: true,
  });
  console.log("Admin created: phone=admin password=admin123");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
