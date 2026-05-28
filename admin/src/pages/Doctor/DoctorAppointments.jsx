import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const DoctorAppointments = () => {

  const { dToken, appointments, getDoctorAppointments, cancelAppointmentDoctor, approveAppointment, doctorData, backendUrl } = useContext(DoctorContext)
  const [uploadingId, setUploadingId] = useState(null)
  const [prescriptionFile, setPrescriptionFile] = useState(null)
  const [notes, setNotes] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (dToken) {
      getDoctorAppointments()
    }
  }, [dToken])

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelAppointmentDoctor(appointmentId)
    }
  }

  const handleApproveAppointment = async (appointmentId) => {
    const result = await approveAppointment(appointmentId)
    if (result?.meetingRoomId) {
      navigate(`/video/${result.meetingRoomId}`)
    }
  }

  const handleJoinCall = (meetingRoomId) => {
    navigate(`/video/${meetingRoomId}`)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setPrescriptionFile(file)
    } else {
      toast.error('Please select a PDF file')
      setPrescriptionFile(null)
    }
  }

  const handleUploadPrescription = async (appointmentId) => {
    if (!prescriptionFile) {
      toast.error('Please select a prescription file')
      return
    }

    try {
      setUploadingId(appointmentId)
      const formData = new FormData()
      formData.append('appointmentId', appointmentId)
      formData.append('docId', doctorData._id)
      formData.append('prescription', prescriptionFile)
      formData.append('notes', notes)

      const { data } = await axios.post(
        backendUrl + '/api/doctor/upload-prescription',
        formData,
        { headers: { dtoken: dToken } }
      )

      if (data.success) {
        toast.success('Prescription uploaded successfully')
        setPrescriptionFile(null)
        setNotes('')
        setShowUploadModal(false)
        setSelectedAppointment(null)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploadingId(null)
    }
  }

  const openUploadModal = (appointment) => {
    setSelectedAppointment(appointment)
    setShowUploadModal(true)
  }

  return (
    <div className='w-full max-w-6xl'>
      <h1 className='text-2xl font-bold mb-6'>Patient Appointments</h1>

      {appointments && appointments.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {appointments.map((appt) => (
            <div key={appt._id} className='border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow'>
              {/* Patient Profile Picture */}
              <div className='w-full h-48 bg-gray-100 flex items-center justify-center'>
                {appt.userData?.image ? (
                  <img 
                    src={appt.userData.image} 
                    alt={appt.userData.name} 
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-4xl font-bold'>
                    {appt.userData?.name?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                )}
              </div>

              {/* Appointment Details */}
              <div className='p-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                  {appt.userData?.name || 'Unknown Patient'}
                </h3>
                
                <div className='space-y-2 mb-4 text-sm text-gray-600'>
                  <p><span className='font-medium text-gray-700'>Email:</span> {appt.userData?.email || 'N/A'}</p>
                  <p><span className='font-medium text-gray-700'>Phone:</span> {appt.userData?.phone || 'N/A'}</p>
                  <p><span className='font-medium text-gray-700'>Date:</span> {appt.slotDate}</p>
                  <p><span className='font-medium text-gray-700'>Time:</span> {appt.slotTime}</p>
                </div>

                {/* Status Badge */}
                <div className='mb-4'>
                  {appt.cancelled ? (
                    <span className='inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full'>
                      Cancelled
                    </span>
                  ) : (
                    <span className='inline-block px-3 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full'>
                      Confirmed
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className='space-y-2'>
                  {!appt.cancelled && (
                    <>
                      {appt.consultationStatus === 'approved' && appt.meetingRoomId ? (
                        <button
                          onClick={() => handleJoinCall(appt.meetingRoomId)}
                          className='w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded transition-colors'
                        >
                          Join Video Call
                        </button>
                      ) : appt.payment ? (
                        <button
                          onClick={() => handleApproveAppointment(appt._id)}
                          className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition-colors'
                        >
                          Approve for Video Call
                        </button>
                      ) : (
                        <div className='w-full bg-yellow-100 text-yellow-800 text-center font-semibold py-2 rounded'>
                          Awaiting patient payment to enable approval
                        </div>
                      )}
                      <button
                        onClick={() => openUploadModal(appt)}
                        className='w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition-colors'
                      >
                        Upload Prescription
                      </button>
                      <button
                        onClick={() => handleCancelAppointment(appt._id)}
                        className='w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition-colors'
                      >
                        Cancel Appointment
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg'>No appointments scheduled</p>
        </div>
      )}

      {/* Upload Prescription Modal */}
      {showUploadModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h2 className='text-xl font-bold mb-4'>Upload Prescription</h2>
            
            <div className='mb-4'>
              <p className='text-sm text-gray-600 mb-2'>
                Patient: <span className='font-semibold'>{selectedAppointment?.userData?.name}</span>
              </p>
              <p className='text-sm text-gray-600 mb-4'>
                Appointment: <span className='font-semibold'>{selectedAppointment?.slotDate} at {selectedAppointment?.slotTime}</span>
              </p>
            </div>

            {/* File Input */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Select PDF File
              </label>
              <input
                type='file'
                accept='.pdf'
                onChange={handleFileChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              {prescriptionFile && (
                <p className='text-sm text-green-600 mt-2'>
                  ✓ {prescriptionFile.name}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Add any additional notes...'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                rows='3'
              />
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setPrescriptionFile(null)
                  setNotes('')
                  setSelectedAppointment(null)
                }}
                className='flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={() => handleUploadPrescription(selectedAppointment._id)}
                disabled={uploadingId === selectedAppointment._id || !prescriptionFile}
                className='flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition-colors disabled:opacity-50'
              >
                {uploadingId === selectedAppointment._id ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorAppointments
