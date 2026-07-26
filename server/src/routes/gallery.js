import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { GalleryImage } from '../models/GalleryImage.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const images = await GalleryImage.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(images);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'deco-workshops/gallery' },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      stream.end(req.file.buffer);
    });
    const { title, category } = req.body;
    const image = await GalleryImage.create({
      url: result.secure_url,
      publicId: result.public_id,
      title: title || '',
      category: category || 'gallery',
    });
    res.status(201).json(image);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });
    if (image.publicId) {
      try { await cloudinary.uploader.destroy(image.publicId); } catch { /* ignore cloudinary errors */ }
    }
    await GalleryImage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/order', async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndUpdate(
      req.params.id,
      { order: req.body.order },
      { new: true }
    );
    if (!image) return res.status(404).json({ error: 'Image not found' });
    res.json(image);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
