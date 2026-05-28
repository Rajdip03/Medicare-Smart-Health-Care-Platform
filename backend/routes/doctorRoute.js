import express from 'express'
import upload from '../middlewares/multer.js'
import { doctorList, loginDoctor, doctorAppointments, cancelAppointmentDoctor, getDoctorProfile, updateDoctorProfile, doctorDashboard, addReview, getReviews, searchDoctors } from '../controllers/doctorController.js'
import { approveAppointment, getDoctorRoomDetails } from '../controllers/videoController.js'
import { uploadPrescription, getDoctorPrescriptions, deletePrescription } from '../controllers/prescriptionController.js'
import authDoctor from '../middlewares/authDoctor.js'
import authUser from '../middlewares/authUser.js'

const doctorRouter = express.Router()

doctorRouter.get('/list', doctorList)
doctorRouter.post('/login', loginDoctor)
doctorRouter.get('/appointments', authDoctor, doctorAppointments)
doctorRouter.post('/cancel-appointment', authDoctor, cancelAppointmentDoctor)
doctorRouter.post('/approve-appointment', authDoctor, approveAppointment)
doctorRouter.get('/video-room/:meetingRoomId', authDoctor, getDoctorRoomDetails)

// doctor profile
doctorRouter.get('/get-profile', authDoctor, getDoctorProfile)
doctorRouter.post('/update-profile', upload.single('image'), authDoctor, updateDoctorProfile)
doctorRouter.post('/add-review', authUser, addReview)
doctorRouter.get('/reviews/:docId', getReviews)
doctorRouter.get('/dashboard', authDoctor, doctorDashboard)
// search doctors with filters
doctorRouter.get('/search', searchDoctors)

// prescription routes
doctorRouter.post('/upload-prescription', upload.single('prescription'), authDoctor, uploadPrescription)
doctorRouter.post('/prescriptions', authDoctor, getDoctorPrescriptions)
doctorRouter.post('/delete-prescription', authDoctor, deletePrescription)

export default doctorRouter
