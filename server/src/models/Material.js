import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['placo', 'wood', 'marble', 'pvc', 'demontable', 'tools', 'other'],
      default: 'other',
    },
    unit: { type: String, trim: true, default: 'piece' },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    pricePerUnit: { type: Number, default: 0, min: 0 },
    supplier: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export const Material = mongoose.model('Material', materialSchema);
