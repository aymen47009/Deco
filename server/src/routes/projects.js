import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Project } from '../models/Project.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function computeFinancials(project) {
  const materialsCost = (project.materials || []).reduce(
    (sum, m) => sum + m.costPrice * m.quantity, 0
  );
  const materialsRevenue = (project.materials || []).reduce(
    (sum, m) => sum + m.sellPrice * m.quantity, 0
  );
  const totalPaid = (project.payments || [])
    .filter((p) => p.isVerified)
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = (project.payments || [])
    .filter((p) => !p.isVerified)
    .reduce((sum, p) => sum + p.amount, 0);
  const remaining = (project.totalAgreedAmount || 0) - totalPaid;
  const materialMargin = materialsRevenue - materialsCost;
  const artisanWage = project.artisanDetails?.agreedWage || 0;
  const netProfit = (project.totalAgreedAmount || 0) - materialsCost - artisanWage;
  return {
    materialsCost,
    materialsRevenue,
    materialMargin,
    totalPaid,
    pendingPayments,
    remaining,
    artisanWage,
    netProfit,
  };
}

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const projects = await Project.find(filter).populate('assignedWorkers', 'name role status').sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('assignedWorkers', 'name role status');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const obj = project.toObject();
    obj.financials = computeFinancials(project);
    res.json(obj);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const project = await new Project(req.body).save();
    await project.populate('assignedWorkers', 'name role status');
    res.status(201).json(project);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('assignedWorkers', 'name role status');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const update = { status: req.body.status };
    if (req.body.status === 'completed') update.completedAt = new Date();
    const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch('/:id/progress', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { progress: req.body.progress }, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/:id/materials', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.materials.push(req.body);
    await project.save();
    const obj = project.toObject();
    obj.financials = computeFinancials(project);
    res.status(201).json(obj);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id/materials/:index', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const idx = Number(req.params.index);
    if (idx >= 0 && idx < project.materials.length) {
      project.materials.splice(idx, 1);
      await project.save();
    }
    res.json({ message: 'Material removed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/payments', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.payments.push({
      amount: req.body.amount,
      collectedBy: req.body.collectedBy || 'admin',
      isVerified: req.body.collectedBy === 'admin' ? true : false,
      date: req.body.date || new Date(),
    });
    await project.save();
    const obj = project.toObject();
    obj.financials = computeFinancials(project);
    res.status(201).json(obj);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch('/:id/payments/:payIndex/verify', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const idx = Number(req.params.payIndex);
    if (idx >= 0 && idx < project.payments.length) {
      project.payments[idx].isVerified = true;
      await project.save();
    }
    const obj = project.toObject();
    obj.financials = computeFinancials(project);
    res.json(obj);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch('/:id/artisan-wage', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!project.artisanDetails) project.artisanDetails = {};
    project.artisanDetails.agreedWage = req.body.agreedWage;
    if (req.body.artisanId) project.artisanDetails.artisanId = req.body.artisanId;
    if (req.body.isWagePaid !== undefined) project.artisanDetails.isWagePaid = req.body.isWagePaid;
    await project.save();
    const obj = project.toObject();
    obj.financials = computeFinancials(project);
    res.json(obj);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/:id/media', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'deco-workshops/projects' },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      stream.end(req.file.buffer);
    });

    project.media.push({
      url: result.secure_url,
      stage: req.body.stage || 'during',
      visibleToClient: req.body.visibleToClient === 'true',
      uploadedBy: req.body.uploadedBy || 'admin',
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id/media/:mediaId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const item = project.media.id(req.params.mediaId);
    if (!item) return res.status(404).json({ error: 'Media not found' });
    if (item.url && item.url.includes('cloudinary')) {
      try { await cloudinary.uploader.destroy(item.url.split('/').slice(-2).join('/').split('.')[0]); } catch { /* ignore */ }
    }
    project.media.pull(req.params.mediaId);
    await project.save();
    res.json({ message: 'Media deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
