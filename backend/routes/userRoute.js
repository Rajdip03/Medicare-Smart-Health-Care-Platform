import express from 'express'
import { registerUser,loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyPayment, suggestDoctors, verifyEmail, resendVerificationEmail, sendTestEmail, toggleFavorite, getFavorites, downloadAppointmentReceipt } from '../controllers/userController.js'
import { getUserRoomDetails } from '../controllers/videoController.js'
import { getUserPrescriptions, getPrescriptionByAppointment, downloadPrescription } from '../controllers/prescriptionController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'


const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/verify-email', verifyEmail)
userRouter.post('/resend-verification', resendVerificationEmail)
userRouter.post('/send-test-email', sendTestEmail)
userRouter.post('/suggest-doctors', suggestDoctors)

userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile)
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/appointments',authUser,listAppointment)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)
userRouter.get('/video-room/:meetingRoomId', authUser, getUserRoomDetails)

// favorites
userRouter.post('/favorite', authUser, toggleFavorite)
userRouter.get('/favorites', authUser, getFavorites)

// payment routes
userRouter.post('/payment-razorpay', authUser, paymentRazorpay)
userRouter.post('/verify-payment', authUser, verifyPayment)
userRouter.get('/download-receipt/:appointmentId', authUser, downloadAppointmentReceipt)

// prescription routes
userRouter.post('/prescriptions', authUser, getUserPrescriptions)
userRouter.post('/prescription-by-appointment', authUser, getPrescriptionByAppointment)
userRouter.get('/download-prescription/:prescriptionId', authUser, downloadPrescription)

export default userRouter
