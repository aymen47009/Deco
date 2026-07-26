import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken, authMiddleware } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const { phone, password } = req.body || {};
    if (!phone || !password) return res.status(400).json({ error: "Phone and password required" });
    const user = await User.findOne({ phone });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.active) return res.status(403).json({ error: "Account disabled" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = signToken({ id: user._id, role: user.role, name: user.name });
    res.json({
      token,
      user: { _id: user._id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (e) {
    next(e);
  }
});

authRouter.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    next(e);
  }
});
