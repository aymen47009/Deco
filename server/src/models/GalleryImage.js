import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['hero', 'gallery', 'service'],
      default: 'gallery',
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

galleryImageSchema.index({ category: 1, order: 1 });

export const GalleryImage = mongoose.model('GalleryImage', galleryImageSchema);
