const Material = require('../models/Material');

const router = require('express').Router();

const CATEGORY_LABELS = {
  wood: 'أخشاب',
  paint: 'دهانات',
  tile: 'بلاط',
  electrical: 'كهرباء',
  plumbing: 'سباكة',
  hardware: 'أدوات',
  other: 'أخرى',
};

// GET /api/materials
router.get('/', async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (lowStock === 'true') filter.$expr = { $lte: ['$stock', '$minStock'] };
    const materials = await Material.find(filter).sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/materials
router.post('/', async (req, res) => {
  try {
    const material = new Material(req.body);
    await material.save();
    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/materials/:id
router.put('/:id', async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/materials/:id/restock
router.patch('/:id/restock', async (req, res) => {
  try {
    const { quantity } = req.body;
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });
    material.stock += Number(quantity) || 0;
    material.lastRestocked = new Date();
    await material.save();
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/materials/:id
router.delete('/:id', async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, CATEGORY_LABELS };
