import { Router } from 'express';
import { Material } from '../models/Material.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (lowStock === 'true') filter.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    res.json(await Material.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try { res.status(201).json(await new Material(req.body).save()); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json({ message: 'Material deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
