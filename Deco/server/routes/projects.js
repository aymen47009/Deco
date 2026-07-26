import { Router } from "express";
import { Project } from "../models/Project.js";
import { Customer } from "../models/Customer.js";
import { User } from "../models/User.js";
import { authMiddleware, requireAdmin, requireWorkerOrAdmin } from "../middleware/auth.js";

export const projectRouter = Router();

projectRouter.get("/", authMiddleware, async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === "worker") {
      filter.workerId = req.user.id;
    }
    if (req.query.status) filter.status = req.query.status;
    const items = await Project.find(filter)
      .populate("customerId")
      .populate("workerId", "-password")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

projectRouter.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const item = await Project.findById(req.params.id)
      .populate("customerId")
      .populate("workerId", "-password");
    if (!item) return res.status(404).json({ error: "Project not found" });
    if (req.user.role === "worker" && String(item.workerId?._id) !== req.user.id) {
      return res.status(403).json({ error: "Not assigned to you" });
    }
    res.json(item);
  } catch (e) {
    next(e);
  }
});

projectRouter.post("/public-request", async (req, res, next) => {
  try {
    const { name, phone, city, title, description, type, area, images } = req.body || {};
    if (!name || !phone || !title) return res.status(400).json({ error: "Name, phone, title required" });

    let customer = await Customer.findOne({ phone });
    if (!customer) customer = await Customer.create({ name, phone, city: city || "" });
    else if (city) customer.city = city;
    await customer.save();

    const imageDocs = (images || []).map((url) => ({ url, category: "request" }));

    const project = await Project.create({
      title,
      description: description || "",
      customerId: customer._id,
      type: type || "decor",
      city: city || "",
      area: area || 0,
      status: "pending",
      images: imageDocs,
      financials: { totalCost: 0, workerFee: 0, customerPaid: false, workerPaid: false },
    });

    res.status(201).json(project);
  } catch (e) {
    next(e);
  }
});

projectRouter.post("/", requireAdmin, async (req, res, next) => {
  try {
    const item = await Project.create(req.body || {});
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

projectRouter.put("/:id", authMiddleware, requireWorkerOrAdmin, async (req, res, next) => {
  try {
    const body = { ...req.body };
    const item = await Project.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Project not found" });
    if (req.user.role === "worker" && String(item.workerId?._id) !== req.user.id) {
      return res.status(403).json({ error: "Not assigned to you" });
    }
    Object.assign(item, body);
    await item.save();
    const populated = await Project.findById(item._id).populate("customerId").populate("workerId", "-password");
    res.json(populated);
  } catch (e) {
    next(e);
  }
});

projectRouter.patch("/:id/assign", requireAdmin, async (req, res, next) => {
  try {
    const { workerId, totalCost, workerFee } = req.body || {};
    const item = await Project.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Project not found" });
    if (workerId !== undefined) item.workerId = workerId || null;
    if (totalCost !== undefined) item.financials.totalCost = totalCost;
    if (workerFee !== undefined) item.financials.workerFee = workerFee;
    if (workerId) item.status = "in_progress";
    await item.save();
    const populated = await Project.findById(item._id).populate("customerId").populate("workerId", "-password");
    res.json(populated);
  } catch (e) {
    next(e);
  }
});

projectRouter.patch("/:id/validate", requireAdmin, async (req, res, next) => {
  try {
    const item = await Project.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Project not found" });
    item.status = "validated";
    item.validatedAt = new Date();
    await item.save();
    const populated = await Project.findById(item._id).populate("customerId").populate("workerId", "-password");
    res.json(populated);
  } catch (e) {
    next(e);
  }
});

projectRouter.patch("/:id/customer-paid", requireAdmin, async (req, res, next) => {
  try {
    const item = await Project.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Project not found" });
    item.financials.customerPaid = true;
    item.status = "paid";
    item.completedAt = new Date();
    await item.save();

    if (item.workerId && item.financials.workerFee > 0) {
      await User.findByIdAndUpdate(item.workerId, {
        $inc: { pendingDues: item.financials.workerFee },
      });
    }

    const populated = await Project.findById(item._id).populate("customerId").populate("workerId", "-password");
    res.json(populated);
  } catch (e) {
    next(e);
  }
});

projectRouter.patch("/:id/worker-paid", requireAdmin, async (req, res, next) => {
  try {
    const item = await Project.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Project not found" });
    item.financials.workerPaid = true;
    await item.save();
    const populated = await Project.findById(item._id).populate("customerId").populate("workerId", "-password");
    res.json(populated);
  } catch (e) {
    next(e);
  }
});

projectRouter.patch("/:id/add-images", authMiddleware, requireWorkerOrAdmin, async (req, res, next) => {
  try {
    const { images, category } = req.body || {};
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "Images array required" });
    }
    const item = await Project.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Project not found" });
    if (req.user.role === "worker" && String(item.workerId?._id) !== req.user.id) {
      return res.status(403).json({ error: "Not assigned to you" });
    }
    const cat = category || "progress";
    const newImages = images.map((url) => ({ url, category: cat }));
    item.images.push(...newImages);
    await item.save();
    const populated = await Project.findById(item._id).populate("customerId").populate("workerId", "-password");
    res.json(populated);
  } catch (e) {
    next(e);
  }
});

projectRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const item = await Project.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Project not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
