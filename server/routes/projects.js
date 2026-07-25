import { Router } from "express";
import { Project } from "../models/Project.js";

export const projectRouter = Router();

projectRouter.get("/", async (_req, res, next) => {
  try {
    const items = await Project.find().populate("customerId").sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

projectRouter.get("/:id", async (req, res, next) => {
  try {
    const item = await Project.findById(req.params.id).populate("customerId");
    if (!item) return res.status(404).json({ error: "Project not found" });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

projectRouter.post("/", async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.code) body.code = `PRJ-${Date.now().toString().slice(-6)}`;
    const item = await Project.create(body);
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

projectRouter.put("/:id", async (req, res, next) => {
  try {
    const item = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: false });
    if (!item) return res.status(404).json({ error: "Project not found" });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

projectRouter.delete("/:id", async (req, res, next) => {
  try {
    const item = await Project.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Project not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
