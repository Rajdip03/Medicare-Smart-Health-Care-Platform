import mongoose from 'mongoose'

const labTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  sampleType: { type: String },
  preparation: { type: String },
  available: { type: Boolean, default: true },
  image: { type: String },
}, { timestamps: true });

export default mongoose.model('LabTest', labTestSchema);
