import { Router } from 'express';
import { Worker } from '../models/Worker.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    const workers = await Worker.find(filter).populate('assignedProjects', 'title status').sort({ createdAt: -1 });
    res.json(workers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/phone/:phone', async (req, res) => {
  try {
    const worker = await Worker.findOne({ phone: req.params.phone }).populate('assignedProjects', 'title customer phone workshopTypes spaceSize status progress');
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json(worker);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('assignedProjects', 'title status');
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json(worker);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try { res.status(201).json(await new Worker(req.body).save()); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('assignedProjects', 'title status');
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json(worker);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json(worker);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json({ message: 'Worker deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
