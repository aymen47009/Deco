import mongoose from "mongoose";

const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    customerId: { type: String, default: null, index: true },
    status: { type: String, default: "pending", index: true },
    description: { type: String, default: "" },
    budget: { type: Number, default: 0 },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { strict: false, timestamps: true }
);

projectSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const Project = mongoose.model("Project", projectSchema);
