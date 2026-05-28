import prescriptionModel from "../models/prescriptionModel.js";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import fs from "fs";
import path from "path";

// API to upload prescription by doctor
const uploadPrescription = async (req, res) => {
    try {
        const { appointmentId, docId, notes } = req.body;
        const prescriptionFile = req.file;

        if (!appointmentId || !docId || !prescriptionFile) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        // Verify appointment exists and belongs to this doctor
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        if (appointmentData.docId !== docId) {
            return res.json({ success: false, message: 'Not authorized to upload prescription for this appointment' });
        }

        // Get doctor and user data
        const doctorData = await doctorModel.findById(docId);
        const userData = await userModel.findById(appointmentData.userId);

        if (!doctorData || !userData) {
            return res.json({ success: false, message: 'Doctor or User not found' });
        }

        // Create prescription record
        const prescriptionData = new prescriptionModel({
            appointmentId,
            doctorId: docId,
            userId: appointmentData.userId,
            prescriptionFile: prescriptionFile.path,
            fileName: prescriptionFile.originalname,
            uploadedAt: Date.now(),
            doctorName: doctorData.name,
            userName: userData.name,
            notes: notes || ''
        });

        await prescriptionData.save();

        res.json({ success: true, message: 'Prescription uploaded successfully', prescription: prescriptionData });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get prescriptions for a user
const getUserPrescriptions = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.json({ success: false, message: 'User ID is required' });
        }

        const prescriptions = await prescriptionModel.find({ userId }).sort({ uploadedAt: -1 });

        res.json({ success: true, prescriptions });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get prescription by appointment ID
const getPrescriptionByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.json({ success: false, message: 'Appointment ID is required' });
        }

        const prescription = await prescriptionModel.findOne({ appointmentId });

        if (!prescription) {
            return res.json({ success: false, message: 'No prescription found for this appointment' });
        }

        res.json({ success: true, prescription });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to download prescription
const downloadPrescription = async (req, res) => {
    try {
        const { prescriptionId } = req.params;

        if (!prescriptionId) {
            return res.json({ success: false, message: 'Prescription ID is required' });
        }

        const prescription = await prescriptionModel.findById(prescriptionId);

        if (!prescription) {
            return res.json({ success: false, message: 'Prescription not found' });
        }

        const filePath = prescription.prescriptionFile;

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.json({ success: false, message: 'File not found' });
        }

        // Send file for download
        res.download(filePath, prescription.fileName, (err) => {
            if (err) {
                console.log('Error downloading file:', err);
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get prescriptions for a doctor's patients
const getDoctorPrescriptions = async (req, res) => {
    try {
        const { docId } = req.body;

        if (!docId) {
            return res.json({ success: false, message: 'Doctor ID is required' });
        }

        const prescriptions = await prescriptionModel.find({ doctorId: docId }).sort({ uploadedAt: -1 });

        res.json({ success: true, prescriptions });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to delete prescription (optional - by doctor or admin)
const deletePrescription = async (req, res) => {
    try {
        const { prescriptionId, docId } = req.body;

        if (!prescriptionId) {
            return res.json({ success: false, message: 'Prescription ID is required' });
        }

        const prescription = await prescriptionModel.findById(prescriptionId);

        if (!prescription) {
            return res.json({ success: false, message: 'Prescription not found' });
        }

        // Verify doctor ownership
        if (prescription.doctorId !== docId) {
            return res.json({ success: false, message: 'Not authorized to delete this prescription' });
        }

        // Delete file if it exists
        if (fs.existsSync(prescription.prescriptionFile)) {
            fs.unlinkSync(prescription.prescriptionFile);
        }

        // Delete from database
        await prescriptionModel.findByIdAndDelete(prescriptionId);

        res.json({ success: true, message: 'Prescription deleted successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { uploadPrescription, getUserPrescriptions, getPrescriptionByAppointment, downloadPrescription, getDoctorPrescriptions, deletePrescription };
