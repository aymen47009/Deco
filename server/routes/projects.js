const Project = require('../models/Project');
const Worker = require('../models/Worker');

const router = require('express').Router();

const STATUS_LABELS = {
  new: 'جديد',
  in_review: 'قيد المراجعة',
  approved: 'مقبول',
  in_progress: 'قيد التنفيذ',
  review: 'للمراجعة',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }
    const projects = await Project.find(filter)
      .populate('assignedWorkers', 'name role status')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('assignedWorkers');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/code/:code
router.get('/code/:code', async (req, res) => {
  try {
    const project = await Project.findOne({ code: req.params.code }).populate('assignedWorkers');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    const project = new Project(req.body);
    project.recalculateProgress();
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.recalculateProgress();
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.status = status;
    project.recalculateProgress();
    if (status === 'completed') project.actualEndDate = new Date();
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/projects/:id/workers
router.post('/:id/workers', async (req, res) => {
  try {
    const { workerId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!project.assignedWorkers.includes(workerId)) {
      project.assignedWorkers.push(workerId);
      await project.save();
    }
    const worker = await Worker.findById(workerId);
    if (worker && !worker.assignedProjects.includes(project._id)) {
      worker.assignedProjects.push(project._id);
      worker.status = 'busy';
      await worker.save();
    }
    res.json(await project.populate('assignedWorkers'));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/projects/:id/workers/:workerId
router.delete('/:id/workers/:workerId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.assignedWorkers = project.assignedWorkers.filter(
      (w) => w.toString() !== req.params.workerId
    );
    await project.save();
    await Worker.findByIdAndUpdate(req.params.workerId, {
      $pull: { assignedProjects: project._id },
      status: 'available',
    });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    await Worker.updateMany(
      { _id: { $in: project.assignedWorkers } },
      { $pull: { assignedProjects: project._id }, status: 'available' }
    );
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, STATUS_LABELS };
