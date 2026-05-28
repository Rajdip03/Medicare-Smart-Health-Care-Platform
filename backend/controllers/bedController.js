import Ward from '../models/wardModel.js'
import Bed from '../models/bedModel.js'
import mongoose from 'mongoose'
import User from '../models/userModel.js'

// Wards
const listWards = async (req, res) => {
  try {
    const wards = await Ward.find({})
    res.json({ success: true, wards })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const createWard = async (req, res) => {
  try {
    const { name, type, capacity, location, notes } = req.body
    if (!name) return res.json({ success: false, message: 'Name required' })
    const ward = new Ward({ name, type, capacity, location, notes })
    await ward.save()
    res.json({ success: true, ward })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const updateWard = async (req, res) => {
  try {
    const { id } = req.params
    const update = req.body
    const ward = await Ward.findByIdAndUpdate(id, update, { new: true })
    if (!ward) return res.json({ success: false, message: 'Ward not found' })
    res.json({ success: true, ward })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const deleteWard = async (req, res) => {
  try {
    const { id } = req.params
    await Ward.findByIdAndDelete(id)
    res.json({ success: true })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Beds
const listBeds = async (req, res) => {
  try {
    const { wardId, status } = req.query
    const filter = {}
    if (wardId) filter.wardId = wardId
    if (status) filter.status = status
    // populate ward and patient details for admin convenience
    const beds = await Bed.find(filter).populate('wardId', 'name').populate('patientId', 'name phone email')
    res.json({ success: true, beds })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const createBed = async (req, res) => {
  try {
    const { wardId, bedNumber, type, notes } = req.body
    if (!wardId || !bedNumber) return res.json({ success: false, message: 'wardId and bedNumber are required' })
    const bed = new Bed({ wardId, bedNumber, type, notes })
    await bed.save()
    res.json({ success: true, bed })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const updateBed = async (req, res) => {
  try {
    const { id } = req.params
    const update = req.body
    update.lastUpdated = Date.now()
    const bed = await Bed.findByIdAndUpdate(id, update, { new: true })
    if (!bed) return res.json({ success: false, message: 'Bed not found' })
    res.json({ success: true, bed })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const deleteBed = async (req, res) => {
  try {
    const { id } = req.params
    await Bed.findByIdAndDelete(id)
    res.json({ success: true })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Assign/unassign bed
const assignBed = async (req, res) => {
  try {
    const { id } = req.params // bed id
    const { patientId: patientInput, appointmentId } = req.body

    const bed = await Bed.findById(id)
    if (!bed) return res.json({ success: false, message: 'Bed not found' })

    if (bed.status === 'occupied') return res.json({ success: false, message: 'Bed already occupied' })

    // Resolve patientInput to a valid user _id (accepts _id, email, or phone)
    let resolvedPatientId = null
    if (patientInput) {
      // If input looks like ObjectId, try to find by _id
      if (mongoose.isValidObjectId(patientInput)) {
        const user = await User.findById(patientInput)
        if (!user) return res.json({ success: false, message: 'User not found for given _id' })
        resolvedPatientId = user._id
      } else {
        // Try email or phone
        const user = await User.findOne({ $or: [{ email: patientInput }, { phone: patientInput }] })
        if (!user) return res.json({ success: false, message: 'No user found with given identifier. Provide patient _id, email, or phone.' })
        resolvedPatientId = user._id
      }
    }

    // Assign resolved values (do not assign raw invalid strings)
    bed.patientId = resolvedPatientId || null
    bed.appointmentId = appointmentId || null
    bed.status = (resolvedPatientId || appointmentId) ? 'occupied' : 'vacant'
    bed.lastUpdated = Date.now()
    await bed.save()

    // return bed with populated patient and ward details
    const populatedBed = await Bed.findById(bed._id).populate('wardId','name').populate('patientId','name phone email')
    res.json({ success: true, bed: populatedBed })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const unassignBed = async (req, res) => {
  try {
    const { id } = req.params
    const bed = await Bed.findById(id)
    if (!bed) return res.json({ success: false, message: 'Bed not found' })

    bed.patientId = null
    bed.appointmentId = null
    bed.status = 'vacant'
    bed.lastUpdated = Date.now()
    await bed.save()

    const populatedBed = await Bed.findById(bed._id).populate('wardId','name').populate('patientId','name phone email')
    res.json({ success: true, bed: populatedBed })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const wardAvailability = async (req, res) => {
  try {
    const { id } = req.params
    const total = await Bed.countDocuments({ wardId: id })
    const vacant = await Bed.countDocuments({ wardId: id, status: 'vacant' })
    const occupied = await Bed.countDocuments({ wardId: id, status: 'occupied' })
    res.json({ success: true, total, vacant, occupied })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export { listWards, createWard, updateWard, deleteWard, listBeds, createBed, updateBed, deleteBed, assignBed, unassignBed, wardAvailability }
