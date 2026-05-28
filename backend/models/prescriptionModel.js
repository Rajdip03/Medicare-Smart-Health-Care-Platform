import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    appointmentId: { type: String, required: true, ref: 'appointment' },
    doctorId: { type: String, required: true, ref: 'doctor' },
    userId: { type: String, required: true, ref: 'user' },
    prescriptionFile: { type: String, required: true }, // file path or URL
    fileName: { type: String, required: true },
    uploadedAt: { type: Number, required: true },
    doctorName: { type: String, required: true },
    userName: { type: String, required: true },
    notes: { type: String, default: '' } // additional notes
}, { minimize: false });

const prescriptionModel =
    mongoose.models.prescription ||
    mongoose.model('prescription', prescriptionSchema);

export default prescriptionModel;
