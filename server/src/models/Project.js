import mongoose from 'mongoose';

const artisanTaskSchema = new mongoose.Schema(
  {
    taskName: { type: String, required: true, trim: true },
    unitPrice: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    totalTaskPrice: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, default: '', trim: true },
      address: { type: String, default: '', trim: true },
    },
    workshopTypes: [{ type: String, default: [] }],
    spaceSize: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['preparing', 'in_progress', 'finishing', 'completed', 'new', 'in_review', 'approved', 'review', 'cancelled'],
      default: 'preparing',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    trackingToken: { type: String, unique: true, index: true },
    totalAgreedAmount: { type: Number, default: 0, min: 0 },
    assignedArtisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    artisanTasks: { type: [artisanTaskSchema], default: [] },
    totalArtisanPayout: { type: Number, default: 0, min: 0 },
    materials: [
      {
        name: { type: String, trim: true },
        materialName: { type: String, required: true, trim: true },
        quantity: { type: Number, default: 1, min: 0 },
        unit: { type: String, default: 'piece' },
        unitCost: { type: Number, default: 0, min: 0 },
        totalCost: { type: Number, default: 0, min: 0 },
        costPrice: { type: Number, default: 0, min: 0 },
        sellPrice: { type: Number, default: 0, min: 0 },
      },
    ],
    payments: [
      {
        amount: { type: Number, required: true, min: 0 },
        collectedBy: { type: String, enum: ['admin', 'artisan'], default: 'admin' },
        isVerified: { type: Boolean, default: false },
        date: { type: Date, default: Date.now },
      },
    ],
    media: [
      {
        url: { type: String, required: true },
        stage: { type: String, enum: ['before', 'during', 'after'], default: 'during' },
        visibleToClient: { type: Boolean, default: true },
        uploadedBy: { type: String, enum: ['admin', 'artisan'], default: 'admin' },
      },
    ],
    artisanDetails: {
      artisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', default: null },
      agreedWage: { type: Number, default: 0, min: 0 },
      isWagePaid: { type: Boolean, default: false },
    },
    assignedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }],
    preferredDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

projectSchema.pre('validate', async function generateCode(next) {
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
  const crypto = await import('crypto');
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
    cancelled: 0,
  };
  this.progress = statusMap[this.status] ?? 0;
  return this.progress;
};

export async function migrateProjectCodeIndex() {
  try {
    const collection = mongoose.model('Project').collection;
    const indexes = await collection.indexes();
    const stale = indexes.find((ix) => ix.key && ix.key.code);
    if (stale) {
      await collection.dropIndex(stale.name || 'code_1').catch(() => {});
      console.log('[db] Dropped stale code index');
    }
    const nullDocs = await collection.find({ code: null }).toArray();
    for (const doc of nullDocs) {
      await collection.updateOne(
        { _id: doc._id },
        { $set: { code: `DW-${doc._id.toString().slice(-6).toUpperCase()}` } }
      );
    }
    if (nullDocs.length) console.log(`[db] Backfilled ${nullDocs.length} projects with codes`);
  } catch (err) {
    console.error('[db] Project code migration skipped:', err.message);
  }
}

export const Project = mongoose.model('Project', projectSchema);
