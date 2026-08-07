import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Project } from '../models/Project.js';
import { User } from '../../models/User.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function computeMaterialCost(material) {
  const quantity = toNumber(material.quantity, 1);
  const costPrice = toNumber(material.costPrice ?? material.unitCost, 0);
  return costPrice * quantity;
}

function computeMaterialRevenue(material) {
  const quantity = toNumber(material.quantity, 1);
  const sellPrice = toNumber(material.sellPrice, 0);
  return sellPrice * quantity;
}

function computeFinancials(project) {
  const materials = project.materials || [];
  const payments = project.payments || [];
  const materialsCost = materials.reduce((sum, material) => sum + computeMaterialCost(material), 0);
  const materialsRevenue = materials.reduce((sum, material) => sum + computeMaterialRevenue(material), 0);
  const totalVerifiedPayments = payments
    .filter((payment) => payment.isVerified)
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);
  const pendingPayments = payments
    .filter((payment) => !payment.isVerified)
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);
  const totalArtisanPayout = toNumber(project.totalArtisanPayout, 0);
  const totalPaid = totalVerifiedPayments;
  const remaining = toNumber(project.totalAgreedAmount, 0) - totalVerifiedPayments;
  const materialMargin = materialsRevenue - materialsCost;
  const artisanWage = totalArtisanPayout;
  const netProfit = totalVerifiedPayments - (materialsCost + totalArtisanPayout);
  return {
    materialsCost,
    materialsRevenue,
    materialMargin,
    totalVerifiedPayments,
    totalPaid,
    pendingPayments,
    remaining,
    remainingBalance: remaining,
    artisanWage,
    totalArtisanPayout,
    netProfit,
  };
}

function normalizeMaterialPayload(payload, existing = {}) {
  const quantity = toNumber(payload.quantity ?? existing.quantity, 1);
  const costPrice = toNumber(payload.costPrice ?? payload.unitCost ?? existing.costPrice ?? existing.unitCost, 0);
  const sellPrice = toNumber(payload.sellPrice ?? existing.sellPrice, 0);
  return {
    name: payload.name ?? existing.name ?? payload.materialName ?? existing.materialName ?? '',
    materialName: payload.materialName ?? existing.materialName ?? payload.name ?? existing.name ?? '',
    quantity,
    unit: payload.unit ?? existing.unit ?? 'piece',
    unitCost: toNumber(payload.unitCost ?? existing.unitCost ?? costPrice, 0),
    totalCost: toNumber(payload.totalCost ?? existing.totalCost ?? (costPrice * quantity), 0),
    costPrice,
    sellPrice,
  };
}

function normalizePaymentPayload(payload, existing = {}) {
  const collectedBy = payload.collectedBy ?? existing.collectedBy ?? 'admin';
  return {
    amount: toNumber(payload.amount ?? existing.amount, 0),
    collectedBy,
    isVerified: payload.isVerified ?? existing.isVerified ?? (collectedBy === 'admin'),
    date: payload.date || existing.date || new Date(),
  };
}

async function hydrateProject(project) {
  await project.populate('assignedWorkers', 'name role status');
  await project.populate('assignedArtisanId', 'name phone role');
  const obj = project.toObject();
  obj.financials = computeFinancials(project);
  return obj;
}

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const projects = await Project.find(filter)
      .populate('assignedWorkers', 'name role status')
      .populate('assignedArtisanId', 'name phone role')
      .sort({ createdAt: -1 });
    res.json(projects.map((project) => ({ ...project.toObject(), financials: computeFinancials(project) })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('assignedWorkers', 'name role status')
      .populate('assignedArtisanId', 'name phone role');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(await hydrateProject(project));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};
    const rawCustomer = payload.customer || {};
    const normalizedCustomer = {
      name: String(rawCustomer.name ?? payload.customerName ?? payload.name ?? '').trim(),
      phone: String(rawCustomer.phone ?? payload.phone ?? '').trim(),
      email: String(rawCustomer.email ?? payload.customerEmail ?? '').trim(),
      address: String(rawCustomer.address ?? payload.customerAddress ?? '').trim(),
    };
    const normalizedWorkshopTypes = Array.isArray(payload.workshopTypes)
      ? payload.workshopTypes.filter(Boolean)
      : payload.workshopTypes
        ? [payload.workshopTypes].filter(Boolean)
        : [];
    const normalizedSpaceSize = String(payload.spaceSize ?? payload.space ?? '').trim();
    const normalizedTitle = String(payload.title ?? `طلب جديد: ${normalizedCustomer.name || 'زبون'}`).trim();

    if (!normalizedCustomer.name || !normalizedCustomer.phone) {
      return res.status(400).json({ error: 'Customer name and phone are required' });
    }
    if (!normalizedSpaceSize) {
      return res.status(400).json({ error: 'Space size is required' });
    }
    if (normalizedWorkshopTypes.length === 0) {
      return res.status(400).json({ error: 'At least one workshop type is required' });
    }

    const project = await new Project({
      ...payload,
      title: normalizedTitle,
      customer: normalizedCustomer,
      workshopTypes: normalizedWorkshopTypes,
      spaceSize: normalizedSpaceSize,
      totalAgreedAmount: payload.totalAgreedAmount ?? 0,
    }).save();
    await project.populate('assignedWorkers', 'name role status');
    await project.populate('assignedArtisanId', 'name phone role');
    res.status(201).json({ ...project.toObject(), financials: computeFinancials(project) });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedWorkers', 'name role status')
      .populate('assignedArtisanId', 'name phone role');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(await hydrateProject(project));
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

router.patch('/:id/assign-artisan', async (req, res) => {
  try {
    const { artisanId } = req.body;
    if (!artisanId) return res.status(400).json({ error: 'artisanId is required' });

    const artisan = await User.findById(artisanId);
    if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
    if (artisan.role && artisan.role !== 'worker') {
      return res.status(400).json({ error: 'Selected user is not an artisan' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    project.assignedArtisanId = artisan._id;
    if (project.artisanDetails) {
      project.artisanDetails.artisanId = artisan._id;
    }
    await project.save();

    await project.populate('assignedWorkers', 'name role status');
    await project.populate('assignedArtisanId', 'name phone role');
    res.json(await hydrateProject(project));
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/:id/materials', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.materials.push(normalizeMaterialPayload(req.body));
    await project.save();
    res.status(201).json(await hydrateProject(project));
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch('/:id/materials/:index', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const index = Number(req.params.index);
    if (index < 0 || index >= project.materials.length) return res.status(404).json({ error: 'Material not found' });
    project.materials[index] = normalizeMaterialPayload(req.body, project.materials[index]);
    await project.save();
    res.json(await hydrateProject(project));
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
    project.payments.push(normalizePaymentPayload(req.body));
    await project.save();
    res.status(201).json(await hydrateProject(project));
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch('/:id/payments/:payIndex', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const idx = Number(req.params.payIndex);
    if (idx < 0 || idx >= project.payments.length) return res.status(404).json({ error: 'Payment not found' });
    project.payments[idx] = normalizePaymentPayload(req.body, project.payments[idx]);
    await project.save();
    res.json(await hydrateProject(project));
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
    res.json(await hydrateProject(project));
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
    res.json(await hydrateProject(project));
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
