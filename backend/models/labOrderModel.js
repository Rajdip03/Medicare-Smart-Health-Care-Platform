import mongoose from 'mongoose'

const labOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  labTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest', required: true },
  patientName: { type: String },
  patientPhone: { type: String },
  scheduleDate: { type: Date, required: true },
  status: { type: String, enum: ['booked','completed','cancelled'], default: 'booked' },
  payment: { type: Boolean, default: false },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('LabOrder', labOrderSchema);
