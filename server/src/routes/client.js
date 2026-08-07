import { Router } from 'express';
import { Project } from '../models/Project.js';

const router = Router();

router.get('/track/:token', async (req, res) => {
  try {
    const project = await Project.findOne({ trackingToken: req.params.token });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const totalPaid = (project.payments || [])
      .filter((p) => p.isVerified)
      .reduce((sum, p) => sum + p.amount, 0);
    const remaining = (project.totalAgreedAmount || 0) - totalPaid;
    const visibleMedia = (project.media || [])
      .filter((m) => m.visibleToClient)
      .map((m) => ({ url: m.url, stage: m.stage, date: m._id.getTimestamp() }));

    const stages = [
      { key: 'preparing', label: 'تجهيز السلعة', order: 1 },
      { key: 'in_progress', label: 'انطلاق الأشغال', order: 2 },
      { key: 'finishing', label: 'مرحلة التشطيب', order: 3 },
      { key: 'completed', label: 'التسليم النهائي', order: 4 },
    ];
    const currentStage = stages.find((s) => s.key === project.status) || stages[0];

    res.json({
      code: project.code,
      title: project.title,
      customerName: project.customer.name,
      workshopTypes: project.workshopTypes,
      spaceSize: project.spaceSize,
      status: project.status,
      progress: project.progress,
      totalAgreedAmount: project.totalAgreedAmount,
      totalPaid,
      remaining,
      currentStage,
      stages,
      media: visibleMedia,
      createdAt: project.createdAt,
      completedAt: project.completedAt,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
