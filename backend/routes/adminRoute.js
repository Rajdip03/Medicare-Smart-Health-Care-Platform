import express from 'express'
import { addDoctor,allDoctors,loginAdmin, appointmentsAdmin, cancelAppointmentAdmin,adminDashboard, updateDoctor, deleteDoctor, getUsers, createUser } from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'
import { changeAvailability } from '../controllers/doctorController.js'

const adminRouter = express.Router()

adminRouter.post('/add-doctor',authAdmin, upload.single('image'), addDoctor)
adminRouter.post('/login', loginAdmin)
adminRouter.post('/all-doctors',authAdmin,allDoctors)
adminRouter.post('/change-availability',authAdmin,changeAvailability)
adminRouter.get('/appointments',authAdmin,appointmentsAdmin)   
adminRouter.post('/cancel-appointment',authAdmin,cancelAppointmentAdmin)
adminRouter.get('/dashboard',authAdmin,adminDashboard)

// users search for admin
adminRouter.get('/users', authAdmin, getUsers)
// create user/patient by admin
adminRouter.post('/users', authAdmin, createUser)
adminRouter.post('/update-doctor',authAdmin, upload.single('image'), updateDoctor)
adminRouter.post('/delete-doctor',authAdmin, deleteDoctor)

// Ward & Bed management
import { listWards, createWard, updateWard, deleteWard, listBeds, createBed, updateBed, deleteBed, assignBed, unassignBed, wardAvailability } from '../controllers/bedController.js'

adminRouter.get('/wards', authAdmin, listWards)
adminRouter.post('/wards', authAdmin, createWard)
adminRouter.put('/wards/:id', authAdmin, updateWard)
adminRouter.delete('/wards/:id', authAdmin, deleteWard)

adminRouter.get('/beds', authAdmin, listBeds) // filter by wardId/status
adminRouter.post('/beds', authAdmin, createBed)
adminRouter.put('/beds/:id', authAdmin, updateBed)
adminRouter.delete('/beds/:id', authAdmin, deleteBed)
adminRouter.patch('/beds/:id/assign', authAdmin, assignBed)
adminRouter.patch('/beds/:id/unassign', authAdmin, unassignBed)
adminRouter.get('/wards/:id/availability', authAdmin, wardAvailability)

export default adminRouter
