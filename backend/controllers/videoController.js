import crypto from 'crypto'
import appointmentModel from '../models/appointmentModel.js'

const approveAppointment = async (req, res) => {
  try {
    const { appointmentId, docId } = req.body

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required' })
    }

    const appointmentData = await appointmentModel.findById(appointmentId)

    if (!appointmentData) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }

    if (appointmentData.docId !== docId) {
      return res.status(403).json({ success: false, message: 'Not authorized to approve this appointment' })
    }

    if (appointmentData.cancelled) {
      return res.status(400).json({ success: false, message: 'Cannot approve a cancelled appointment' })
    }

    // Ensure payment is completed before approving for video consultation
    if (!appointmentData.payment) {
      return res.status(400).json({ success: false, message: 'Cannot approve video consultation before payment is completed' })
    }

    const meetingRoomId = appointmentData.meetingRoomId || crypto.randomBytes(8).toString('hex')

    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      {
        consultationStatus: 'approved',
        meetingRoomId,
        appointmentId: appointmentData.appointmentId || appointmentData._id.toString(),
        patientId: appointmentData.userId,
        doctorId: appointmentData.docId
      },
      { new: true }
    )

    res.json({ success: true, appointment: updatedAppointment })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

const getUserRoomDetails = async (req, res) => {
  try {
    const { meetingRoomId } = req.params
    const { userId } = req.body

    if (!meetingRoomId) {
      return res.status(400).json({ success: false, message: 'Meeting room ID is required' })
    }

    const appointment = await appointmentModel.findOne({ meetingRoomId })

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }

    if (appointment.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' })
    }

    if (appointment.consultationStatus !== 'approved') {
      return res.status(403).json({ success: false, message: 'Video consultation is not approved yet' })
    }

    if (!appointment.payment) {
      return res.status(403).json({ success: false, message: 'Please complete payment before joining the video consultation' })
    }

    res.json({ success: true, appointment })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

const getDoctorRoomDetails = async (req, res) => {
  try {
    const { meetingRoomId } = req.params
    const { docId } = req.body

    if (!meetingRoomId) {
      return res.status(400).json({ success: false, message: 'Meeting room ID is required' })
    }

    const appointment = await appointmentModel.findOne({ meetingRoomId })

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }

    if (appointment.docId !== docId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' })
    }

    if (appointment.consultationStatus !== 'approved') {
      return res.status(403).json({ success: false, message: 'Video consultation is not approved yet' })
    }

    if (!appointment.payment) {
      return res.status(403).json({ success: false, message: 'Video consultation is available only after payment is completed' })
    }

    res.json({ success: true, appointment })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export { approveAppointment, getUserRoomDetails, getDoctorRoomDetails }
