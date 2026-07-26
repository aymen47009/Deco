import { Router } from "express";
import { Customer } from "../models/Customer.js";

export const customerRouter = Router();

customerRouter.get("/", async (_req, res, next) => {
  try {
    const items = await Customer.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

customerRouter.get("/:id", async (req, res, next) => {
  try {
    const item = await Customer.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Customer not found" });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

customerRouter.post("/", async (req, res, next) => {
  try {
    const item = await Customer.create(req.body || {});
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

customerRouter.put("/:id", async (req, res, next) => {
  try {
    const item = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: false,
    });
    if (!item) return res.status(404).json({ error: "Customer not found" });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

customerRouter.delete("/:id", async (req, res, next) => {
  try {
    const item = await Customer.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Customer not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
