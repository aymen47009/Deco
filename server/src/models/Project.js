import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
      code: {
    type: String,
    unique: true,
    default: () => `PRJ-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`,
  },
  title: { type: String, required: true, trim: true },

    title: { type: String, required: true, trim: true },
    customer: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    workshopTypes: [{ type: String, default: [] }],
    spaceSize: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['new', 'in_review', 'approved', 'in_progress', 'review', 'completed', 'cancelled'],
      default: 'new',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    images: [{ type: String, default: [] }],
    assignedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }],
    preferredDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', projectSchema);
