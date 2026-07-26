import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    city: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { strict: false, timestamps: true }
);

export const Customer = mongoose.model("Customer", CustomerSchema);
