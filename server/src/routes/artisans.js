import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Project } from '../models/Project.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function computeFinancials(project) {
  const materialsCost = (project.materials || []).reduce((sum, material) => {
    const quantity = toNumber(material.quantity, 1);
    const costPrice = toNumber(material.costPrice ?? material.unitCost, 0);
    return sum + costPrice * quantity;
  }, 0);
  const totalVerifiedPayments = (project.payments || [])
    .filter((payment) => payment.isVerified)
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);
  const totalArtisanPayout = toNumber(project.totalArtisanPayout, 0);
  return {
    materialsCost,
    totalVerifiedPayments,
    totalArtisanPayout,
    netProfit: totalVerifiedPayments - (materialsCost + totalArtisanPayout),
  };
}

function normalizeTaskPayload(payload) {
  const unitPrice = toNumber(payload.unitPrice, 0);
  const quantity = toNumber(payload.quantity, 0);
  return {
    taskName: String(payload.taskName || '').trim(),
    unitPrice,
    quantity,
    totalTaskPrice: unitPrice * quantity,
  };
}

function normalizePaymentPayload(payload) {
  return {
    amount: toNumber(payload.amount, 0),
    collectedBy: 'artisan',
    isVerified: false,
    date: payload.date || new Date(),
  };
}

async function hydrateProject(project) {
  await project.populate('assignedArtisanId', 'name phone role');
  await project.populate('assignedWorkers', 'name role status');
  const obj = project.toObject();
  obj.financials = computeFinancials(project);
  return obj;
}

router.use(authMiddleware);
router.use((req, res, next) => {
  if (req.user?.role !== 'worker' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Artisan access required' });
  }
  next();
});

router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({ assignedArtisanId: req.user.id })
      .populate('assignedArtisanId', 'name phone role')
      .populate('assignedWorkers', 'name role status')
      .sort({ createdAt: -1 });
    res.json(projects.map((project) => ({ ...project.toObject(), financials: computeFinancials(project) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/projects/:projectId/tasks', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, assignedArtisanId: req.user.id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const task = normalizeTaskPayload(req.body || {});
    if (!task.taskName) return res.status(400).json({ error: 'taskName is required' });
    project.artisanTasks.push(task);
    await project.save();
    res.status(201).json(await hydrateProject(project));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/projects/:projectId/payments', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, assignedArtisanId: req.user.id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.payments.push(normalizePaymentPayload(req.body || {}));
    await project.save();
    res.status(201).json(await hydrateProject(project));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/projects/:projectId/media', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const project = await Project.findOne({ _id: req.params.projectId, assignedArtisanId: req.user.id });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'deco-workshops/projects' },
        (error, uploaded) => {
          if (error) reject(error);
          else resolve(uploaded);
        }
      );
      stream.end(req.file.buffer);
    });

    project.media.push({
      url: result.secure_url,
      stage: req.body.stage || 'during',
      visibleToClient: req.body.visibleToClient !== 'false',
      uploadedBy: 'artisan',
    });
    await project.save();
    res.status(201).json(await hydrateProject(project));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
