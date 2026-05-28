// API for adding doctor

import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

const addDoctor = async (req, res) => {

    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        // hashing doctor password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: address,
            date: Date.now()
        }
        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        res.json({ success: true, message: "Doctor Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {

            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token });

        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {

    try {

        const appointments = await appointmentModel.find({});
        res.json({ success: true, appointments });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }

}


const getUsers = async (req, res) => {
    try {
        const { search } = req.query
        const filter = {}
        if (search) {
            const q = new RegExp(search, 'i')
            filter.$or = [{ name: q }, { email: q }, { phone: q }]
        }
        const users = await userModel.find(filter).select('name email phone').limit(50)
        res.json({ success: true, users })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// create a new user/patient by admin
const createUser = async (req, res) => {
    try {
        const { name, email, phone } = req.body
        if (!name || !email) return res.json({ success: false, message: 'Name and email are required' })
        if (!validator.isEmail(email)) return res.json({ success: false, message: 'Invalid email' })
        const exists = await userModel.findOne({ email })
        if (exists) return res.json({ success: false, message: 'Email already exists' })

        // generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8)
        const salt = await bcrypt.genSalt(10)
        const hashed = await bcrypt.hash(tempPassword, salt)

        const userData = { name, email, phone: phone || '', password: hashed }
        const newUser = new userModel(userData)
        await newUser.save()

        res.json({ success: true, user: { _id: newUser._id, name: newUser.name, email: newUser.email, phone: newUser.phone }, tempPassword })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, getUsers, createUser }

// API to update doctor by admin
const updateDoctor = async (req, res) => {
    try {
        const { docId, name, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        if (!docId) return res.json({ success: false, message: 'Doctor id missing' });

        const updateData = { name, speciality, degree, experience, about, fees, address };

        // remove undefined fields
        Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            updateData.image = imageUpload.secure_url;
        }

        await doctorModel.findByIdAndUpdate(docId, updateData);

        res.json({ success: true, message: 'Doctor updated' });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to delete doctor by admin
const deleteDoctor = async (req, res) => {
    try {
        const { docId } = req.body;
        if (!docId) return res.json({ success: false, message: 'Doctor id missing' });

        await doctorModel.findByIdAndDelete(docId);

        // Optionally remove related appointments - keep for now

        res.json({ success: true, message: 'Doctor deleted' });
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { cancelAppointmentAdmin, adminDashboard, updateDoctor, deleteDoctor };

// Admin cancel appointment (allows admin to cancel any appointment)
const cancelAppointmentAdmin = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // releasing doctor slot
        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);
        let slots_booked = doctorData.slots_booked || {};

        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
            await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        }

        res.json({ success: true, message: 'Appointment Cancelled' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
    doctors: doctors.length,
    appointments: appointments.length,
    patients: users.length,
    latestAppointments: appointments.reverse().slice(0, 5)
}

res.json({ success: true, dashData })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}






