const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    company: { type: String, default: '', trim: true },
    notes: { type: String, default: '' },
    projectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
