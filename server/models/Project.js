const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, default: '', trim: true },
      address: { type: String, default: '', trim: true },
    },
    propertyType: {
      type: String,
      enum: ['apartment', 'villa', 'office', 'shop', 'restaurant', 'other'],
      default: 'apartment',
    },
    workType: {
      type: String,
      enum: ['full_renovation', 'kitchen', 'bathroom', 'painting', 'flooring', 'ceiling', 'custom'],
      default: 'full_renovation',
    },
    budget: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['new', 'in_review', 'approved', 'in_progress', 'review', 'completed', 'cancelled'],
      default: 'new',
    },
    assignedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }],
    materials: [
      {
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, default: 1 },
        unit: { type: String, default: 'piece' },
        unitCost: { type: Number, default: 0 },
        totalCost: { type: Number, default: 0 },
      },
    ],
    images: [{ url: String, publicId: String }],
    startDate: { type: Date },
    expectedEndDate: { type: Date },
    actualEndDate: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

projectSchema.pre('validate', async function preValidate(next) {
  if (this.code) return next();
  const count = await mongoose.model('Project').countDocuments();
  this.code = `DW-${String(count + 1).padStart(4, '0')}`;
  return next();
});

projectSchema.methods.recalculateProgress = function recalculateProgress() {
  const statusMap = {
    new: 0, in_review: 10, approved: 20, in_progress: 50, review: 85, completed: 100, cancelled: 0,
  };
  this.progress = statusMap[this.status] ?? 0;
  return this.progress;
};

module.exports = mongoose.model('Project', projectSchema);
