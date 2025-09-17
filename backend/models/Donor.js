const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodType: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  age: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  lastDonation: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);