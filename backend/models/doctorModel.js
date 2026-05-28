import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    address: { type: String, required: true },
    date: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    reviews: { type: Array, default: [] }, // { userId, name, rating, comment, date }
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 }
}, { minimize: false });

const doctorModel = mongoose.models.doctor || mongoose.model('doctor', doctorSchema);

export default doctorModel;

// Add a text index to support efficient searching across common fields
doctorSchema.index({ name: 'text', speciality: 'text', degree: 'text', about: 'text' });
