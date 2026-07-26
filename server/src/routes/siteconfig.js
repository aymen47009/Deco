import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { SiteConfig } from '../models/SiteConfig.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

async function getConfig() {
  let config = await SiteConfig.findOne();
  if (!config) config = await SiteConfig.create({});
  return config;
}

router.get('/', async (req, res) => {
  try { res.json(await getConfig()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/', async (req, res) => {
  try {
    const config = await getConfig();
    Object.assign(config, req.body);
    await config.save();
    res.json(config);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'deco-workshops/site' },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      stream.end(req.file.buffer);
    });
    res.json({ url: result.secure_url });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/gallery/add', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'deco-workshops/gallery' },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      stream.end(req.file.buffer);
    });
    const config = await getConfig();
    config.galleryImages.push(result.secure_url);
    await config.save();
    res.json(config);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/gallery/:index', async (req, res) => {
  try {
    const idx = parseInt(req.params.index, 10);
    const config = await getConfig();
    if (idx >= 0 && idx < config.galleryImages.length) {
      config.galleryImages.splice(idx, 1);
      await config.save();
    }
    res.json(config);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
