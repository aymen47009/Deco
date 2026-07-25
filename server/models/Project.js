import mongoose from "mongoose";

const ImageItemSchema = new mongoose.Schema(
  {
    url: String,
    category: { type: String, enum: ["request", "progress", "completion"], default: "request" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const FinancialSchema = new mongoose.Schema(
  {
    totalCost: { type: Number, default: 0 },
    workerFee: { type: Number, default: 0 },
    customerPaid: { type: Boolean, default: false },
    workerPaid: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "in_progress", "validated", "paid"],
      default: "pending",
    },
    type: { type: String, enum: ["decor", "placo", "pmma", "other"], default: "decor" },
    city: { type: String, default: "" },
    area: { type: Number, default: 0 },
    images: [ImageItemSchema],
    financials: { type: FinancialSchema, default: () => ({}) },
    validatedAt: { type: Date },
    completedAt: { type: Date },
  },
  { strict: false, timestamps: true }
);

export const Project = mongoose.model("Project", ProjectSchema);
