const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { router: projectsRouter } = require('./routes/projects');
const { router: workersRouter } = require('./routes/workers');
const customersRouter = require('./routes/customers');
const { router: materialsRouter } = require('./routes/materials');
const { upload } = require('./middleware/upload');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('[warn] MONGODB_URI not set — server will start without DB persistence.');
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.json({ status: 'ok', db: dbState === 1 ? 'connected' : 'disconnected' });
});

app.post('/api/upload', upload.array('images', 8), (req, res) => {
  try {
    const files = req.files || [];
    const images = files.map((f) => ({ url: f.path, publicId: f.filename }));
    res.json({ images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/projects', projectsRouter);
app.use('/api/workers', workersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/materials', materialsRouter);

const clientDist = path.join(__dirname, '..', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: err.message });
});

async function start() {
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('[db] Connected to MongoDB Atlas');
    } catch (err) {
      console.error('[db] Connection failed:', err.message);
    }
  }
  app.listen(PORT, () => {
    console.log(`[server] Deco Workshops API running on port ${PORT}`);
  });
}

start();
