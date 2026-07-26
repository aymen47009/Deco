const Worker = require('../models/Worker');

const router = require('express').Router();

const ROLE_LABELS = {
  carpenter: 'نجار',
  painter: 'دهان',
  electrician: 'كهربائي',
  plumber: 'سباك',
  tiler: 'بلاط',
  general: 'عامل عام',
  manager: 'مدير',
};

// GET /api/workers
router.get('/', async (req, res) => {
  try {
    const { status, role, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (role && role !== 'all') filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const workers = await Worker.find(filter).populate('assignedProjects', 'code title status').sort({ createdAt: -1 });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workers/:id
router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('assignedProjects');
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workers
router.post('/', async (req, res) => {
  try {
    const worker = new Worker(req.body);
    await worker.save();
    res.status(201).json(worker);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/workers/:id
router.put('/:id', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/workers/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    worker.status = status;
    await worker.save();
    res.json(worker);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/workers/:id
router.delete('/:id', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json({ message: 'Worker deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, ROLE_LABELS };
