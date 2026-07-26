const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      enum: ['wood', 'paint', 'tile', 'electrical', 'plumbing', 'hardware', 'other'],
      default: 'other',
    },
    unit: { type: String, default: 'piece' },
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 0 },
    unitCost: { type: Number, default: 0 },
    supplier: { type: String, default: '', trim: true },
    lastRestocked: { type: Date },
  },
  { timestamps: true }
);

materialSchema.virtual('lowStock').get(function () {
  return this.stock <= this.minStock;
});

materialSchema.set('toJSON', { virtuals: true });
materialSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Material', materialSchema);
