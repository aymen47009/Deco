import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['placo', 'wood', 'marble', 'pvc', 'demontable', 'designer', 'manager'],
      default: 'placo',
    },
    status: {
      type: String,
      enum: ['available', 'busy', 'on_leave', 'inactive'],
      default: 'available',
    },
    avatar: { type: String, default: '' },
    assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true }
);

export const Worker = mongoose.model('Worker', workerSchema);
