import mongoose from 'mongoose';

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
