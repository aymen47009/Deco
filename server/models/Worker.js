const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    role: {
      type: String,
      enum: ['carpenter', 'painter', 'electrician', 'plumber', 'tiler', 'general', 'manager'],
      default: 'general',
    },
    skills: [{ type: String, trim: true }],
    status: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
    assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    dailyRate: { type: Number, default: 0 },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Worker', workerSchema);
