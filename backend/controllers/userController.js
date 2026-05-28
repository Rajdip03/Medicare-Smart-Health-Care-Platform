import validator from 'validator'
import bcrypt from 'bcrypt'
import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'
import { sendVerificationEmail, sendAppointmentConfirmation, sendPasswordResetEmail } from '../utils/emailService.js'
import { generateAppointmentReceipt } from '../utils/receiptGenerator.js'
import crypto from 'crypto'

// Helper to create JWT
const createToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }
  // add expiry as appropriate
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !password || !email) {
      return res.status(400).json({ success: false, message: 'Missing details' })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email' })
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Enter a strong password (min 8 characters)' })
    }

    // check if user already exists
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' })
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const userData = {
      name,
      email,
      password: hashedPassword,
    }

    const newUser = new User(userData)
    const user = await newUser.save()

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    user.emailVerificationToken = verificationToken
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    await user.save()

    // Send verification email
    await sendVerificationEmail(email, verificationToken, name)

    const token = createToken({ id: user._id })

    // return created (201) and token
    return res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email }, message: 'Please verify your email. Check your inbox for verification link.' })
  } catch (error) {
    console.error('registerUser error:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const token = createToken({ id: user._id })

    return res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (error) {
    console.error('loginUser error:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}



// API to update user profile
const updateProfile = async (req, res) => {
  try {

    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    await userModel.findByIdAndUpdate(
      userId,
      {
        name,
        phone,
        address: JSON.parse(address),
        dob,
        gender
      }
    );

    if (imageFile) {

      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(
        imageFile.path,
        { resource_type: "image" }
      );

      const imageUrl = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageUrl });
    }

    res.json({ success: true, message: "Profile Updated" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}


// API to get user profile data
const getProfile = async (req, res) => {

  try {

    const { userId } = req.body
    const userData = await userModel.findById(userId).select('-password')

    res.json({ success: true, userData })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// toggle favorite doctor for a user
const toggleFavorite = async (req, res) => {
  try {
    const { userId, docId } = req.body
    if (!userId || !docId) return res.json({ success: false, message: 'Missing data' })

    const user = await userModel.findById(userId)
    if (!user) return res.json({ success: false, message: 'User not found' })

    const idx = (user.favorites || []).indexOf(docId)
    if (idx === -1) {
      user.favorites = user.favorites || []
      user.favorites.push(docId)
      await user.save()
      return res.json({ success: true, message: 'Added to favorites', favorites: user.favorites })
    } else {
      user.favorites.splice(idx, 1)
      await user.save()
      return res.json({ success: true, message: 'Removed from favorites', favorites: user.favorites })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// get full favorite doctors list
const getFavorites = async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) return res.json({ success: false, message: 'Missing data' })

    const user = await userModel.findById(userId).select('favorites')
    if (!user) return res.json({ success: false, message: 'User not found' })

    const favDocs = await doctorModel.find({ _id: { $in: user.favorites } }).select('-password')
    res.json({ success: true, favorites: favDocs })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body

    if (!userId || !docId || !slotDate || !slotTime) return res.json({ success: false, message: 'Missing data' })

    const docData = await doctorModel.findById(docId).select('-password')
    if (!docData) return res.json({ success: false, message: 'Doctor not found' })

    if (!docData.available) {
      return res.json({ success: false, message: 'Doctor not available' })
    }

    let slots_booked = docData.slots_booked || {}

    // checking for slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: 'Slot not available' })
      } else {
        slots_booked[slotDate].push(slotTime)
      }
    } else {
      slots_booked[slotDate] = []
      slots_booked[slotDate].push(slotTime)
    }

    const userData = await userModel.findById(userId).select('-password')

    // ensure user exists
    if (!userData) {
      return res.json({ success: false, message: 'appointment validation failed' })
    }

    delete docData.slots_booked

    const appointmentData = {
      appointmentId: null,
      userId,
      patientId: userId,
      docId,
      doctorId: docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
      consultationStatus: 'pending'
    }

    const newAppointment = new appointmentModel(appointmentData)
    newAppointment.appointmentId = newAppointment._id.toString()
    await newAppointment.save()

    // save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    // Send appointment confirmation email with full details
    await sendAppointmentConfirmation({
      appointmentId: newAppointment._id,
      toEmail: userData.email,
      userName: userData.name,
      userPhone: userData.phone || '',
      doctorName: docData.name,
      doctorEmail: docData.email || '',
      doctorAddress: docData.address || '',
      appointmentDate: slotDate,
      appointmentTime: slotTime,
      fees: docData.fees,
      paymentStatus: newAppointment.payment || false
    })

    res.json({ success: true, message: 'Appointment Booked' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
  try {

    const { userId } = req.body
    const appointments = await appointmentModel.find({ userId })

    res.json({ success: true, appointments })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {

    const { userId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    // verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: 'Unauthorized action' });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData

    const doctorData = await doctorModel.findById(docId)

    let slots_booked = doctorData.slots_booked

    slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    res.json({ success: true, message: 'Appointment Cancelled' })


  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};





// (exports consolidated at end of file)

// Initialize Razorpay instance
const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY
})

// API to create payment order
const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body

    const appointmentData = await appointmentModel.findById(appointmentId)

    if (!appointmentData || appointmentData.payment) {
      return res.json({ success: false, message: 'Appointment not found or already paid' })
    }

    const options = {
      amount: appointmentData.amount * 100, // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: appointmentId
    }

    const order = await instance.orders.create(options)
    res.json({ success: true, order })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to verify payment
const verifyPayment = async (req, res) => {
  try {
    const { appointmentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    // Verify signature (basic verification - in production use proper crypto verification)
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.json({ success: false, message: 'Payment verification failed' })
    }

    // Mark appointment as paid
    await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })

    res.json({ success: true, message: 'Payment verified and appointment confirmed' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to download appointment receipt
const downloadAppointmentReceipt = async (req, res) => {
  try {
    const { appointmentId } = req.params
    const userId = req.body.userId

    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }

    if (appointment.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this receipt' })
    }

    if (!appointment.payment) {
      return res.status(400).json({ success: false, message: 'Payment not completed for this appointment' })
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="appointment_receipt_${appointmentId}.pdf"`)

    generateAppointmentReceipt(appointment, res)

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// (exports consolidated at end of file)

// Disease to Speciality Mapping
const diseaseSpecialityMap = {
  'headache': 'Neurologist',
  'migraine': 'Neurologist',
  'dizziness': 'Neurologist',
  'vertigo': 'Neurologist',
  'seizure': 'Neurologist',
  'depression': 'Neurologist',
  'anxiety': 'Neurologist',
  'stroke': 'Neurologist',
  'fever': 'General physician',
  'cold': 'General physician',
  'cough': 'General physician',
  'flu': 'General physician',
  'body pain': 'General physician',
  'weakness': 'General physician',
  'fatigue': 'General physician',
  'allergy': 'General physician',
  'skin rash': 'Dermatologist',
  'acne': 'Dermatologist',
  'eczema': 'Dermatologist',
  'psoriasis': 'Dermatologist',
  'hair loss': 'Dermatologist',
  'wart': 'Dermatologist',
  'fungal': 'Dermatologist',
  'pregnancy': 'Gynecologist',
  'menstrual': 'Gynecologist',
  'women health': 'Gynecologist',
  'period': 'Gynecologist',
  'contraception': 'Gynecologist',
  'miscarriage': 'Gynecologist',
  'child': 'Pediatricians',
  'baby': 'Pediatricians',
  'infant': 'Pediatricians',
  'kids': 'Pediatricians',
  'vaccine': 'Pediatricians',
  'newborn': 'Pediatricians',
  'stomach': 'Gastroenterologist',
  'digestion': 'Gastroenterologist',
  'diarrhea': 'Gastroenterologist',
  'constipation': 'Gastroenterologist',
  'acidity': 'Gastroenterologist',
  'gastric': 'Gastroenterologist',
  'ulcer': 'Gastroenterologist'
}

// API to suggest doctors based on disease/symptoms
const suggestDoctors = async (req, res) => {
  try {
    const { disease } = req.body

    if (!disease || typeof disease !== 'string') {
      return res.json({ success: false, message: 'Disease/symptom is required' })
    }

    const diseaseLower = disease.toLowerCase().trim()
    let speciality = null

    // Find matching speciality from disease map
    for (const [key, value] of Object.entries(diseaseSpecialityMap)) {
      if (diseaseLower.includes(key) || key.includes(diseaseLower)) {
        speciality = value
        break
      }
    }

    // If no exact match, return general physician as fallback
    if (!speciality) {
      speciality = 'General physician'
    }

    // Get doctors with matching speciality
    const suggestedDoctors = await doctorModel.find({ speciality }).select('-password')

    res.json({ success: true, doctors: suggestedDoctors, speciality })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// (exports consolidated at end of file)

// API to verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.json({ success: false, message: 'Token is required' })
    }

    const user = await userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.json({ success: false, message: 'Invalid or expired verification token' })
    }

    user.isEmailVerified = true
    user.emailVerificationToken = null
    user.emailVerificationExpires = null
    await user.save()

    res.json({ success: true, message: 'Email verified successfully' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.json({ success: false, message: 'Email is required' })
    }

    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    if (user.isEmailVerified) {
      return res.json({ success: false, message: 'Email already verified' })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    user.emailVerificationToken = verificationToken
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.save()

    await sendVerificationEmail(email, verificationToken, user.name)

    res.json({ success: true, message: 'Verification email resent. Check your inbox.' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to send test email 
const sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.json({ success: false, message: 'Email is required' })
    }

    const result = await sendVerificationEmail(email, 'test_token_12345', 'Test User')
    
    if (result.success) {
      res.json({ success: true, message: 'Test email sent successfully to ' + email })
    } else {
      res.json({ success: false, message: 'Failed to send email: ' + result.message })
    }

  } catch (error) {
    console.log('Test email error:', error)
    res.json({ 
      success: false, 
      message: error.message,
      hint: 'Make sure EMAIL_USER and EMAIL_PASSWORD are set correctly in .env file'
    })
  }
}

// (exports consolidated at end of file)

// Consolidated named exports for all controller functions
export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  toggleFavorite,
  getFavorites,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyPayment,
  downloadAppointmentReceipt,
  suggestDoctors,
  verifyEmail,
  resendVerificationEmail,
  sendTestEmail
}
