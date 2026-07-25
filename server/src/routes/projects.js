import { Router } from "express";
import { Project } from "../models/Project.js";
import { asyncHandler } from "../middleware/error.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const { status, customerId } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (customerId) filter.customerId = customerId;
  const projects = await Project.find(filter).sort({ createdAt: -1 }).lean({ virtuals: true });
  res.json(projects.map((p) => ({ ...p, id: p._id, _id: undefined })));
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).lean({ virtuals: true });
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json({ ...project, id: project._id, _id: undefined });
}));

router.post("/", asyncHandler(async (req, res) => {
  const project = await Project.create(req.body);
  res.status(201).json(project.toJSON());
}));

router.put("/:id", asyncHandler(async (req, res) => {
  const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ error: "Project not found" });
  res.json(updated.toJSON());
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const deleted = await Project.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Project not found" });
  res.json({ success: true, id: req.params.id });
}));

export default router;
