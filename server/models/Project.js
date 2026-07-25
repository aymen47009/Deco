import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    city: { type: String, default: "" },
    area: { type: Number, default: 0 },
    type: { type: String, default: "decor" },
    status: { type: String, default: "pending" },
    images: { type: [String], default: [] },
    notes: { type: String, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { strict: false, timestamps: true }
);

export const Project = mongoose.model("Project", ProjectSchema);
