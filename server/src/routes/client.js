import { Router } from 'express';
import { Project } from '../models/Project.js';

const router = Router();

router.get('/track/:trackingToken', async (req, res) => {
  try {
    const project = await Project.findOne({ trackingToken: req.params.trackingToken });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const totalPaid = (project.payments || [])
      .filter((p) => p.isVerified)
      .reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = (project.totalAgreedAmount || 0) - totalPaid;
    const visibleMedia = (project.media || [])
      .filter((m) => m.visibleToClient)
      .map((m) => ({ url: m.url, stage: m.stage, uploadedAt: m._id?.getTimestamp?.() || null }));

    const stages = [
      { key: 'preparing', label: 'تجهيز السلعة', order: 1 },
      { key: 'in_progress', label: 'انطلاق الأشغال', order: 2 },
      { key: 'finishing', label: 'مرحلة التشطيب', order: 3 },
      { key: 'completed', label: 'التسليم النهائي', order: 4 },
    ];
    const currentIndex = Math.max(stages.findIndex((s) => s.key === project.status), 0);
    const timeline = stages.map((stage, index) => ({
      ...stage,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));

    res.json({
      status: project.status,
      progress: project.progress,
      timeline,
      totalAgreedAmount: project.totalAgreedAmount,
      totalPaid,
      remainingBalance,
      media: visibleMedia,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
