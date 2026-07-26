import { Router } from "express";
import { Customer } from "../models/Customer.js";
import { asyncHandler } from "../middleware/error.js";

const router = Router();

router.get("/", asyncHandler(async (_req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 }).lean({ virtuals: true });
  res.json(customers.map((c) => ({ ...c, id: c._id, _id: undefined })));
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).lean({ virtuals: true });
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  res.json({ ...customer, id: customer._id, _id: undefined });
}));

router.post("/", asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json(customer.toJSON());
}));

router.put("/:id", asyncHandler(async (req, res) => {
  const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ error: "Customer not found" });
  res.json(updated.toJSON());
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const deleted = await Customer.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Customer not found" });
  res.json({ success: true, id: req.params.id });
}));

export default router;
