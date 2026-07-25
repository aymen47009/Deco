import mongoose from "mongoose";

const { Schema } = mongoose;

const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    address: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  {
    strict: false,
    timestamps: true,
  }
);

customerSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const Customer = mongoose.model("Customer", customerSchema);
