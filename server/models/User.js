import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "worker"], default: "worker" },
    totalEarnings: { type: Number, default: 0 },
    pendingDues: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { strict: false, timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
