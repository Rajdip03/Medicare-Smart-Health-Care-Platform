import doctorModel from "../models/doctorModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body

        const docData = await doctorModel.findById(docId)
        const newStatus = !docData.available
        await doctorModel.findByIdAndUpdate(docId, { available: newStatus })

        // notify followers who opted in
        try {
            const followers = await userModel.find({ favorites: docId, notifyOnFavorite: true }).select('email')
            const { sendDoctorAvailabilityNotification } = await import('../utils/emailService.js')
            for (const f of followers) {
                if (f && f.email) await sendDoctorAvailabilityNotification(f.email, docData.name, newStatus)
            }
        } catch (e) {
            console.log('Error notifying followers:', e.message)
        }

        res.json({ success: true, message: 'Availability Changed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const doctorList = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for doctor Login
const loginDoctor = async (req, res) => {
    try {

        const { email, password } = req.body
        const doctor = await doctorModel.findOne({ email }).select('+password')

        if (!doctor) {
            return res.json({ success: false, message: 'Invalid credentials' })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {

            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })

        } else {
            res.json({ success: false, message: 'Invalid credentials' })
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to get doctor appointments
const doctorAppointments = async (req, res) => {
    try {
        const { docId } = req.body

        const appointments = await appointmentModel.find({ docId })
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for doctor to cancel appointment
const cancelAppointmentDoctor = async (req, res) => {
    try {
        const { appointmentId, docId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        // Verify the appointment belongs to this doctor
        if (appointmentData.docId !== docId) {
            return res.json({ success: false, message: 'Not authorized to cancel this appointment' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot
        const { slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)
        let slots_booked = doctorData.slots_booked || {}

        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
            await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        }

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



// API to add review/rating for a doctor
const addReview = async (req, res) => {
    try {
        const { docId, rating, comment, userId } = req.body;
        if (!docId || !rating) return res.json({ success: false, message: 'Missing data' });

        const parsedRating = Number(rating);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) return res.json({ success: false, message: 'Invalid rating' });

        // get user name
        let name = 'Unknown';
        if (userId) {
            const user = await userModel.findById(userId);
            if (user) name = user.name || user.email || 'User';
        }

        await doctorModel.findByIdAndUpdate(docId, { $push: { reviews: { userId, name, rating: parsedRating, comment: comment || '', date: Date.now() } } });

        // recompute avg rating and count
        const doc = await doctorModel.findById(docId).select('reviews');
        const reviews = doc.reviews || [];
        const count = reviews.length;
        const avg = count ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / count) : 0;

        await doctorModel.findByIdAndUpdate(docId, { avgRating: Math.round(avg * 10) / 10, ratingCount: count });

        res.json({ success: true, message: 'Review added' });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get reviews for a doctor
const getReviews = async (req, res) => {
    try {
        const { docId } = req.params;
        if (!docId) return res.json({ success: false, message: 'Doctor id missing' });
        const doc = await doctorModel.findById(docId).select('reviews avgRating ratingCount');
        if (!doc) return res.json({ success: false, message: 'Doctor not found' });
        res.json({ success: true, reviews: doc.reviews || [], avgRating: doc.avgRating || 0, ratingCount: doc.ratingCount || 0 });
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



// API to get doctor profile
const getDoctorProfile = async (req, res) => {
    try {
        const { docId } = req.body
        const docData = await doctorModel.findById(docId).select('-password')
        if (!docData) return res.json({ success: false, message: 'Doctor not found' })
        res.json({ success: true, docData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update doctor profile
const updateDoctorProfile = async (req, res) => {
    try {
        const { docId, name, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        if (!docId || !name || !speciality || !degree || !experience || !about || !fees) {
            return res.json({ success: false, message: 'Data Missing' })
        }

        await doctorModel.findByIdAndUpdate(docId, {
            name,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: address ? address : undefined
        })

        if (imageFile) {
            const { v2: cloudinary } = await import('cloudinary')
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
            const imageUrl = imageUpload.secure_url
            await doctorModel.findByIdAndUpdate(docId, { image: imageUrl })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



// API to get doctor dashboard (appointments count, unique patients, recent appointments)
const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body

        // fetch appointments sorted by date descending
        const appointments = await appointmentModel.find({ docId }).sort({ date: -1 })

        const totalAppointments = appointments.length

        // build unique patients list using userId
        const patientsMap = new Map()
        for (const a of appointments) {
            if (a.userId && !patientsMap.has(a.userId)) {
                patientsMap.set(a.userId, a.userData || { name: 'Unknown', email: '' })
            }
        }

        const totalPatients = patientsMap.size

        // prepare an array of unique patient objects
        const patients = Array.from(patientsMap.values())

        // limit recent appointments to latest 10
        const latestAppointments = appointments.slice(0, 10)

        res.json({ success: true, dashData: { totalAppointments, totalPatients, patients, latestAppointments } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { changeAvailability, doctorList, loginDoctor, doctorAppointments, cancelAppointmentDoctor, getDoctorProfile, updateDoctorProfile, addReview, getReviews, doctorDashboard, searchDoctors }

// API to search doctors with filters and paging
const searchDoctors = async (req, res) => {
    try {
        const { q, speciality, minRating, available, sort, page = 1, limit = 20 } = req.query

        const filter = {}
        if (speciality) filter.speciality = speciality
        if (available === 'true') filter.available = true
        if (available === 'false') filter.available = false
        if (minRating) filter.avgRating = { $gte: Number(minRating) }

        // By default do not apply a projection — return full documents (password is already excluded by schema).
        // If a text search is used we need to include the text score _and_ the fields the frontend expects
        // (name, speciality, image, etc.). Using an inclusion-based projection avoids mixing inclusion with
        // schema-level exclusion which causes MongoDB projection errors.
        let projection = null
        const findQuery = q ? { $text: { $search: q }, ...filter } : filter

        let sortObj = {}
        if (q) {
            // If using text search, sort by score first (textScore)
            sortObj = { score: { $meta: 'textScore' } }
            // include the fields the frontend expects so images & other data are returned
            projection = {
                name: 1,
                speciality: 1,
                image: 1,
                available: 1,
                fees: 1,
                avgRating: 1,
                ratingCount: 1,
                score: { $meta: 'textScore' }
            }
        } else if (sort === 'rating') {
            sortObj = { avgRating: -1 }
        } else if (sort === 'fees-asc') {
            sortObj = { fees: 1 }
        } else if (sort === 'fees-desc') {
            sortObj = { fees: -1 }
        }

        const pageNum = Math.max(1, Number(page))
        const pageSize = Math.max(1, Math.min(100, Number(limit)))

        // build cursor and apply select only if we created an inclusion projection
        let cursor = doctorModel.find(findQuery).sort(sortObj).skip((pageNum - 1) * pageSize).limit(pageSize)
        if (projection) cursor = cursor.select(projection)
        const results = await cursor.exec()
        const total = await doctorModel.countDocuments(findQuery)

        res.json({ success: true, doctors: results, total, page: pageNum, limit: pageSize })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


