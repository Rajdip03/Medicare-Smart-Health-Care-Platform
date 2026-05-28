import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    appointmentId: { type: String, default: null },
    userId: { type: String, required: true },
    patientId: { type: String, required: true },
    docId: { type: String, required: true },
    doctorId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    meetingRoomId: { type: String, default: null },
    consultationStatus: { type: String, enum: ['pending', 'approved', 'completed', 'cancelled'], default: 'pending' }
});

const appointmentModel =
    mongoose.models.appointment ||
    mongoose.model('appointment', appointmentSchema);

export default appointmentModel;
