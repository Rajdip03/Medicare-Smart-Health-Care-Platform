import mongoose from 'mongoose'

const wardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['General', 'ICU', 'Maternity', 'Pediatrics', 'Other'], default: 'General' },
  capacity: { type: Number, default: 0 },
  location: { type: String, default: '' },
  notes: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
})

const Ward = mongoose.models.ward || mongoose.model('ward', wardSchema)
export default Ward
