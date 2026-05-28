import mongoose from 'mongoose'

const bedSchema = new mongoose.Schema({
  wardId: { type: mongoose.Schema.Types.ObjectId, ref: 'ward', required: true },
  bedNumber: { type: String, required: true }, // unique per ward
  type: { type: String, enum: ['Normal', 'ICU', 'Ventilator', 'Other'], default: 'Normal' },
  status: { type: String, enum: ['vacant', 'occupied', 'reserved', 'maintenance'], default: 'vacant' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'appointment', default: null },
  notes: { type: String, default: '' },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true })

// ensure a bedNumber is unique per ward
bedSchema.index({ wardId: 1, bedNumber: 1 }, { unique: true })

const Bed = mongoose.models.bed || mongoose.model('bed', bedSchema)
export default Bed
