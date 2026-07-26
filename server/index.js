import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const SECRET = process.env.JWT_SECRET || "fallback_secret";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "worker"], default: "worker" },
    totalEarnings: { type: Number, default: 0 },
    pendingDues: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { strict: false, timestamps: true }
);
const User = mongoose.model("User", UserSchema);

const CustomerSchema = new mongoose.Schema(
  { name: { type: String, required: true }, phone: { type: String, default: "" }, city: { type: String, default: "" }, notes: { type: String, default: "" } },
  { strict: false, timestamps: true }
);
const Customer = mongoose.model("Customer", CustomerSchema);

const ImageItemSchema = new mongoose.Schema(
  { url: String, category: { type: String, enum: ["request", "progress", "completion"], default: "request" }, uploadedAt: { type: Date, default: Date.now } },
  { _id: true }
);
const FinancialSchema = new mongoose.Schema(
  { totalCost: { type: Number, default: 0 }, workerFee: { type: Number, default: 0 }, customerPaid: { type: Boolean, default: false }, workerPaid: { type: Boolean, default: false } },
  { _id: false }
);
const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending", "in_progress", "validated", "paid"], default: "pending" },
    workTypes: { type: [String], default: [] },
    type: { type: String, default: "decor" },
    city: { type: String, default: "" },
    area: { type: String, default: "" },
    trackingCode: { type: String, unique: true, sparse: true, index: true },
    images: [ImageItemSchema],
    financials: { type: FinancialSchema, default: () => ({}) },
    validatedAt: { type: Date },
    completedAt: { type: Date },
  },
  { strict: false, timestamps: true }
);
const Project = mongoose.model("Project", ProjectSchema);

function genTrackingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "DW-";
  for (let i = 0; i < 6; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
async function uniqueTrackingCode() {
  for (let i = 0; i < 10; i += 1) {
    const code = genTrackingCode();
    const exists = await Project.findOne({ trackingCode: code });
    if (!exists) return code;
  }
  return "DW-" + Date.now().toString(36).toUpperCase();
}

function signToken(payload) { return jwt.sign(payload, SECRET, { expiresIn: "7d" }); }
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token provided" });
  try { req.user = jwt.verify(header.replace("Bearer ", ""), SECRET); next(); }
  catch { return res.status(401).json({ error: "Invalid or expired token" }); }
}
const requireAdmin = (req, res, next) => (req.user?.role !== "admin" ? res.status(403).json({ error: "Admin access required" }) : next());
const requireWorkerOrAdmin = (req, res, next) => (req.user?.role !== "admin" && req.user?.role !== "worker" ? res.status(403).json({ error: "Access denied" }) : next());

let seeding = false;
async function ensureDb() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
  if (!seeding) { seeding = true; seedAdmin().catch(() => {}).finally(() => { seeding = false; }); }
}
async function seedAdmin() {
  const existing = await User.findOne({ phone: "admin" });
  if (!existing) {
    await User.create({ name: "المدير العام", phone: "admin", password: await bcrypt.hash("admin123", 10), role: "admin", totalEarnings: 0, pendingDues: 0, active: true });
    console.log("Admin seeded");
  } else if (existing.role !== "admin") {
    existing.role = "admin";
    existing.active = true;
    await existing.save();
    console.log("Admin role repaired");
  }
}

const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { strict: false, timestamps: true }
);
const Setting = mongoose.model("Setting", SettingSchema);

const DEFAULT_SETTINGS = {
  heroImage: "https://images.pexels.com/photos/7567307/pexels-photo-7567307.jpeg?auto=compress&cs=tinysrgb&w=1400",
  galleryImages: [
    "https://images.pexels.com/photos/6492383/pexels-photo-6492383.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/5824477/pexels-photo-5824477.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/6492392/pexels-photo-6492392.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  workTypeIcons: {
    placo: "🧱",
    pvc: "⚪",
    separation: "🪨",
    marble: "◈",
    wood: "🪵",
  },
  services: [
    { icon: "🧱", title: "بلاكو بلاتر", desc: "أسقف وجدران بلاكو بلاتر بأدق التفاصيل" },
    { icon: "⚪", title: "بي في سي السقف", desc: "أسقف بي في سي عصرية ومتينة" },
    { icon: "🪨", title: "سيباراسيون", desc: "فواصل وتقسيمات داخلية احترافية" },
    { icon: "◈", title: "بديل الرخام", desc: "أرضيات وجدران بديل الرخام الفاخر" },
    { icon: "🪵", title: "بديل الخشب", desc: "تشطيبات بديل الخشب الأنيق" },
  ],
};
async function getSettings() {
  await ensureDb();
  const doc = await Setting.findOne({ key: "site" });
  return { ...DEFAULT_SETTINGS, ...(doc?.value || {}) };
}
async function saveSettings(value) {
  await ensureDb();
  await Setting.findOneAndUpdate(
    { key: "site" },
    { key: "site", value },
    { upsert: true, new: true }
  );
  return getSettings();
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

app.get("/api/health", async (_req, res) => {
  try { await ensureDb(); res.json({ ok: true, db: mongoose.connection.readyState === 1 }); }
  catch (e) { res.json({ ok: true, db: false, error: e.message }); }
});

app.get("/api/settings", async (_req, res) => {
  try { res.json(await getSettings()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/settings", authMiddleware, requireAdmin, async (req, res) => {
  try { res.json(await saveSettings(req.body || {})); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    await ensureDb();
    const { phone, password } = req.body || {};
    if (!phone || !password) return res.status(400).json({ error: "Phone and password required" });
    const user = await User.findOne({ phone });
    if (!user) return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    if (!user.active) return res.status(403).json({ error: "Account disabled" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    const token = signToken({ id: user._id, role: user.role, name: user.name });
    res.json({ token, user: { _id: user._id, name: user.name, phone: user.phone, role: user.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try { await ensureDb(); const u = await User.findById(req.user.id).select("-password"); if (!u) return res.status(404).json({ error: "User not found" }); res.json(u); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/projects", authMiddleware, async (req, res) => {
  try {
    await ensureDb();
    const filter = {};
    if (req.user.role === "worker") filter.workerId = req.user.id;
    if (req.query.status) filter.status = req.query.status;
    const items = await Project.find(filter).populate("customerId").populate("workerId", "-password").sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/projects/:id", authMiddleware, async (req, res) => {
  try {
    await ensureDb();
    const item = await Project.findById(req.params.id).populate("customerId").populate("workerId", "-password");
    if (!item) return res.status(404).json({ error: "Project not found" });
    if (req.user.role === "worker" && String(item.workerId?._id) !== req.user.id) return res.status(403).json({ error: "Not assigned to you" });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/projects/public-request", async (req, res) => {
  try {
    await ensureDb();
    const { name, phone, city, title, description, workTypes, type, area, images } = req.body || {};
    if (!name || !phone) return res.status(400).json({ error: "Name and phone required" });
    let customer = await Customer.findOne({ phone });
    if (!customer) customer = await Customer.create({ name, phone, city: city || "" });
    else if (city) { customer.city = city; await customer.save(); }
    const imageDocs = (images || []).map((url) => ({ url, category: "request" }));
    const trackingCode = await uniqueTrackingCode();
    const project = await Project.create({
      title: title || "طلب جديد",
      description: description || "",
      customerId: customer._id,
      workTypes: Array.isArray(workTypes) ? workTypes : [],
      type: type || "decor",
      city: city || "",
      area: area || "",
      trackingCode,
      status: "pending",
      images: imageDocs,
      financials: { totalCost: 0, workerFee: 0, customerPaid: false, workerPaid: false },
    });
    res.status(201).json(project);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/projects/track/:code", async (req, res) => {
  try {
    await ensureDb();
    const project = await Project.findOne({ trackingCode: req.params.code.toUpperCase() })
      .populate("customerId")
      .populate("workerId", "-password");
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch("/api/projects/:id/assign", authMiddleware, requireAdmin, async (req, res) => {
  try {
    await ensureDb();
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
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch("/api/projects/:id/validate", authMiddleware, requireAdmin, async (req, res) => {
  try { await ensureDb(); const item = await Project.findById(req.params.id); if (!item) return res.status(404).json({ error: "Project not found" }); item.status = "validated"; item.validatedAt = new Date(); await item.save(); const p = await Project.findById(item._id).populate("customerId").populate("workerId", "-password"); res.json(p); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch("/api/projects/:id/customer-paid", authMiddleware, requireAdmin, async (req, res) => {
  try {
    await ensureDb();
    const item = await Project.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Project not found" });
    item.financials.customerPaid = true; item.status = "paid"; item.completedAt = new Date();
    await item.save();
    if (item.workerId && item.financials.workerFee > 0) await User.findByIdAndUpdate(item.workerId, { $inc: { pendingDues: item.financials.workerFee } });
    const p = await Project.findById(item._id).populate("customerId").populate("workerId", "-password");
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch("/api/projects/:id/worker-paid", authMiddleware, requireAdmin, async (req, res) => {
  try { await ensureDb(); const item = await Project.findById(req.params.id); if (!item) return res.status(404).json({ error: "Project not found" }); item.financials.workerPaid = true; await item.save(); const p = await Project.findById(item._id).populate("customerId").populate("workerId", "-password"); res.json(p); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch("/api/projects/:id/add-images", authMiddleware, requireWorkerOrAdmin, async (req, res) => {
  try {
    await ensureDb();
    const { images, category } = req.body || {};
    if (!Array.isArray(images) || images.length === 0) return res.status(400).json({ error: "Images array required" });
    const item = await Project.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Project not found" });
    if (req.user.role === "worker" && String(item.workerId?._id) !== req.user.id) return res.status(403).json({ error: "Not assigned to you" });
    const cat = category || "progress";
    item.images.push(...images.map((url) => ({ url, category: cat })));
    await item.save();
    const p = await Project.findById(item._id).populate("customerId").populate("workerId", "-password");
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/projects/:id", authMiddleware, requireAdmin, async (req, res) => {
  try { await ensureDb(); const item = await Project.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ error: "Project not found" }); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/workers", authMiddleware, async (_req, res) => {
  try { await ensureDb(); const items = await User.find({ role: "worker" }).select("-password").sort({ createdAt: -1 }); res.json(items); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/workers", authMiddleware, requireAdmin, async (req, res) => {
  try { await ensureDb(); const { name, phone, password } = req.body || {}; if (!name || !phone || !password) return res.status(400).json({ error: "Name, phone, password required" }); const existing = await User.findOne({ phone }); if (existing) return res.status(409).json({ error: "Phone already in use" }); const hashed = await bcrypt.hash(password, 10); const item = await User.create({ name, phone, password: hashed, role: "worker" }); res.status(201).json({ _id: item._id, name: item.name, phone: item.phone, role: item.role }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/workers/:id", authMiddleware, requireAdmin, async (req, res) => {
  try { await ensureDb(); const item = await User.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ error: "Worker not found" }); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch("/api/workers/:id/pay-dues", authMiddleware, requireAdmin, async (req, res) => {
  try { await ensureDb(); const item = await User.findById(req.params.id); if (!item) return res.status(404).json({ error: "Worker not found" }); item.totalEarnings = (item.totalEarnings || 0) + (item.pendingDues || 0); item.pendingDues = 0; await item.save(); res.json({ _id: item._id, totalEarnings: item.totalEarnings, pendingDues: item.pendingDues }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    const folder = req.body.folder || "decoworkshops";
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (err, r) => (err ? reject(err) : resolve(r)));
      stream.end(req.file.buffer);
    });
    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/upload/multiple", upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: "No files provided" });
    const folder = req.body.folder || "decoworkshops";
    const results = await Promise.all(req.files.map((file) => new Promise((resolve, reject) => { const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (err, r) => (err ? reject(err) : resolve(r))); stream.end(file.buffer); })));
    res.json(results.map((r) => ({ url: r.secure_url, public_id: r.public_id })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const distDir = path.resolve(__dirname, "../dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distDir, "index.html"));
  });
}

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
