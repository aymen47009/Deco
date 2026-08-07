const mongoose = require('mongoose');
const crypto = require('crypto');

const artisanTaskSchema = new mongoose.Schema(
  {
    taskName: { type: String, required: true, trim: true },
    unitPrice: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    totalTaskPrice: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const materialSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    materialName: { type: String, trim: true, default: '' },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: 'piece' },
    unitCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    sellPrice: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    collectedBy: { type: String, enum: ['admin', 'artisan'], default: 'admin' },
    isVerified: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    stage: { type: String, enum: ['before', 'during', 'after'], default: 'during' },
    visibleToClient: { type: Boolean, default: true },
    uploadedBy: { type: String, enum: ['admin', 'artisan'], default: 'admin' },
  },
  { _id: false }
);

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
      enum: ['preparing', 'in_progress', 'finishing', 'completed', 'new', 'in_review', 'approved', 'review', 'cancelled'],
      default: 'preparing',
    },
    assignedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }],
    assignedArtisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    artisanTasks: { type: [artisanTaskSchema], default: [] },
    totalArtisanPayout: { type: Number, default: 0, min: 0 },
    trackingToken: { type: String, unique: true, index: true },
    totalAgreedAmount: { type: Number, default: 0, min: 0 },
    materials: { type: [materialSchema], default: [] },
    images: [{ url: String, publicId: String }],
    payments: { type: [paymentSchema], default: [] },
    media: { type: [mediaSchema], default: [] },
    startDate: { type: Date },
    expectedEndDate: { type: Date },
    actualEndDate: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    notes: { type: String, default: '' },
    workshopTypes: { type: [String], default: [] },
    spaceSize: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

projectSchema.pre('validate', async function preValidate(next) {
  if (this.code) return next();
  try {
    const count = await mongoose.model('Project').countDocuments();
    this.code = `DW-${String(count + 1).padStart(4, '0')}`;
  } catch (err) {
    this.code = `DW-${Date.now()}`;
  }
  return next();
});

projectSchema.pre('validate', async function generateToken(next) {
  if (this.trackingToken) return next();
  this.trackingToken = crypto.randomBytes(9).toString('base64url');
  return next();
});

projectSchema.pre('validate', function recalculateArtisanTotals(next) {
  const artisanTasks = Array.isArray(this.artisanTasks) ? this.artisanTasks : [];
  this.totalArtisanPayout = artisanTasks.reduce((sum, task) => {
    const unitPrice = Number(task.unitPrice || 0);
    const quantity = Number(task.quantity || 0);
    const totalTaskPrice = unitPrice * quantity;
    task.totalTaskPrice = totalTaskPrice;
    return sum + totalTaskPrice;
  }, 0);
  return next();
});

projectSchema.methods.recalculateProgress = function recalculateProgress() {
  const statusMap = {
    preparing: 0,
    in_progress: 50,
    finishing: 85,
    completed: 100,
    new: 0,
    in_review: 10,
    approved: 20,
    review: 85,
    cancelled: 0,
  };
  this.progress = statusMap[this.status] ?? 0;
  return this.progress;
};

module.exports = mongoose.model('Project', projectSchema);
