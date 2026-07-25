import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";

export const workerRouter = Router();

workerRouter.use(authMiddleware);

workerRouter.get("/", async (_req, res, next) => {
  try {
    const items = await User.find({ role: "worker" }).select("-password").sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

workerRouter.get("/:id", async (req, res, next) => {
  try {
    const item = await User.findById(req.params.id).select("-password");
    if (!item) return res.status(404).json({ error: "Worker not found" });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

workerRouter.post("/", requireAdmin, async (req, res, next) => {
  try {
    const { name, phone, password } = req.body || {};
    if (!name || !phone || !password) return res.status(400).json({ error: "Name, phone, password required" });
    const existing = await User.findOne({ phone });
    if (existing) return res.status(409).json({ error: "Phone already in use" });
    const hashed = await bcrypt.hash(password, 10);
    const item = await User.create({ name, phone, password: hashed, role: "worker" });
    res.status(201).json({ _id: item._id, name: item.name, phone: item.phone, role: item.role });
  } catch (e) {
    next(e);
  }
});

workerRouter.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    } else {
      delete body.password;
    }
    const item = await User.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: false }).select("-password");
    if (!item) return res.status(404).json({ error: "Worker not found" });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

workerRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const item = await User.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Worker not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

workerRouter.patch("/:id/pay-dues", requireAdmin, async (req, res, next) => {
  try {
    const item = await User.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Worker not found" });
    item.totalEarnings = (item.totalEarnings || 0) + (item.pendingDues || 0);
    item.pendingDues = 0;
    await item.save();
    res.json({ _id: item._id, totalEarnings: item.totalEarnings, pendingDues: item.pendingDues });
  } catch (e) {
    next(e);
  }
});
