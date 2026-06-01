import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'


const MyAppointments = () => {

  const { backendURL, token, getDoctorsData, getUserLabOrders, cancelLabOrder } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [labOrders, setLabOrders] = useState([])
  const [prescriptions, setPrescriptions] = useState({})
  const [loadingPrescription, setLoadingPrescription] = useState({})
  const navigate = useNavigate()

  const months = [
    "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const slotDateFormat = (slotDate) => {
    if (!slotDate || typeof slotDate !== 'string') return 'N/A';
    const dateArray = slotDate.split('_');
    if (dateArray.length < 3) return slotDate;
    return (
      dateArray[0] +
      " " +
      months[Number(dateArray[1])] +
      " " +
      dateArray[2]
    );
  };

  const getPrescription = async (appointmentId) => {
    try {
      setLoadingPrescription(prev => ({ ...prev, [appointmentId]: true }));
      
      const { data } = await axios.post(
        backendURL + '/api/user/prescription-by-appointment',
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        setPrescriptions(prev => ({ ...prev, [appointmentId]: data.prescription }));
      } else {
        toast.info(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoadingPrescription(prev => ({ ...prev, [appointmentId]: false }));
    }
  }

  const downloadPrescription = async (prescriptionId, fileName) => {
    try {
      const response = await axios.get(
        backendURL + `/api/user/download-prescription/${prescriptionId}`,
        { headers: { token }, responseType: 'blob' }
      );

      // Create a blob URL and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Prescription downloaded successfully');
    } catch (error) {
      console.log(error);
      toast.error('Failed to download prescription');
    }
  }

  const downloadAppointmentReceipt = async (appointmentId) => {
    try {
      const response = await axios.get(
        backendURL + `/api/user/download-receipt/${appointmentId}`,
        { headers: { token }, responseType: 'blob' }
      );

      // Create a blob URL and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appointment_receipt_${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Failed to download receipt');
    }
  }

  const downloadLabOrderReceipt = async (orderId) => {
    try {
      const response = await axios.get(
        backendURL + `/api/lab/download-receipt/${orderId}`,
        { headers: { token }, responseType: 'blob' }
      );

      // Create a blob URL and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lab_receipt_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Failed to download receipt');
    }
  }

  const getUserAppointments = async () => {
    try {

      const { data } = await axios.get(
        backendURL + '/api/user/appointments',
        { headers: { token } }
      );

      if (data.success) {
        const appts = Array.isArray(data.appointments) ? data.appointments : [];
        setAppointments(appts.reverse());
        console.log(appts);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  const consultationStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Video call approved. You can join now.'
      case 'pending':
        return 'Video call pending doctor approval.'
      case 'completed':
        return 'Video consultation completed.'
      case 'cancelled':
        return 'Video consultation cancelled.'
      default:
        return 'Video consultation status unknown.'
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendURL + '/api/user/cancel-appointment',
        { appointmentId }, { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        // refresh appointments and doctors so booked slots are released/updated
        await getUserAppointments();
        if (typeof getDoctorsData === 'function') await getDoctorsData();
      } else {
        toast.error(data.message);
      }

    }
    catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  const handleJoinVideoCall = (meetingRoomId) => {
    if (meetingRoomId) {
      navigate(`/video/${meetingRoomId}`)
    }
  }

  const initiatePayment = async (appointmentId, amount) => {
    try {
      // Create Razorpay order
      const { data: orderData } = await axios.post(
        backendURL + '/api/user/payment-razorpay',
        { appointmentId },
        { headers: { token } }
      )

      if (!orderData.success) {
        toast.error(orderData.message)
        return
      }

      // Load Razorpay script dynamically if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.crossOrigin = 'anonymous'
        script.onload = () => openRazorpay(orderData.order, appointmentId)
        script.onerror = () => toast.error('Failed to load payment system')
        document.head.appendChild(script)
      } else {
        openRazorpay(orderData.order, appointmentId)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const openRazorpay = (order, appointmentId) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SgRDOmv8dLoeRR',
      amount: order.amount,
      currency: 'INR',
      name: 'Medicare',
      description: 'Appointment Payment',
      order_id: order.id,
      handler: async (response) => {
        try {
          // Verify payment
          const { data } = await axios.post(
            backendURL + '/api/user/verify-payment',
            {
              appointmentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            },
            { headers: { token } }
          )

          if (data.success) {
            toast.success('Payment successful! Appointment confirmed.')
            await getUserAppointments()
          } else {
            toast.error(data.message)
          }
        } catch (error) {
          console.log(error)
          toast.error(error.message)
        }
      },
      prefill: {
        name: 'User Name',
        email: 'user@example.com'
      },
      theme: {
        color: '#5f63b8'
      },
      modal: {
        ondismiss: function() {
          toast.info('Payment cancelled')
        }
      }
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  const initiateLabPayment = async (orderId, amount) => {
    try {
      // Create Razorpay order for lab order
      const { data: orderData } = await axios.post(
        backendURL + '/api/lab/payment-razorpay',
        { orderId },
        { headers: { token } }
      )

      if (!orderData.success) {
        if (orderData.message === 'Payment already completed for this order') {
          toast.info('Payment already completed for this order')
          // Refresh lab orders to show updated status
          const lo = await getUserLabOrders()
          setLabOrders(lo || [])
        } else {
          toast.error(orderData.message)
        }
        return
      }

      // Load Razorpay script dynamically if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.crossOrigin = 'anonymous'
        script.onload = () => openLabRazorpay(orderData.order, orderId)
        script.onerror = () => toast.error('Failed to load payment system')
        document.head.appendChild(script)
      } else {
        openLabRazorpay(orderData.order, orderId)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const openLabRazorpay = (order, orderId) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SgRDOmv8dLoeRR',
      amount: order.amount,
      currency: 'INR',
      name: 'Medicare',
      description: 'Lab Test Payment',
      order_id: order.id,
      handler: async (response) => {
        try {
          // Verify payment
          const { data } = await axios.post(
            backendURL + '/api/lab/verify-payment',
            {
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            },
            { headers: { token } }
          )

          if (data.success) {
            toast.success('Payment successful! Lab order confirmed.')
            // Refresh lab orders
            const lo = await getUserLabOrders()
            setLabOrders(lo || [])
          } else {
            toast.error(data.message)
          }
        } catch (error) {
          console.log(error)
          toast.error(error.message)
        }
      },
      prefill: {
        name: 'User Name',
        email: 'user@example.com'
      },
      theme: {
        color: '#5f63b8'
      },
      modal: {
        ondismiss: function() {
          toast.info('Payment cancelled')
        }
      }
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }


  useEffect(() => {
    if (!token) return

    getUserAppointments()

    ;(async () => {
      const lo = await getUserLabOrders()
      setLabOrders(lo || [])
    })()

    const handleFocus = () => {
      getUserAppointments()
    }

    window.addEventListener('focus', handleFocus)

    const pendingVideo = appointments.some(
      (item) => item.payment && item.consultationStatus === 'pending'
    )

    const interval = pendingVideo ? setInterval(getUserAppointments, 8000) : null

    return () => {
      window.removeEventListener('focus', handleFocus)
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [token, appointments])



  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-800 border-b'>My appointments</p>
      <div>
        {appointments.map((item, index) => (
          <div className='gird grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
            <div>
              <img className='w-36 bg-indigo-200' src={item.docData?.image || ''} alt="" />
            </div>
            <div className='flex-1 text-sm text-zinc-700'>
              <p className='text-neutral-900 font-semibold'>{item.docData?.name || 'Unknown'}</p>
              <p>{item.docData?.speciality || ''}</p>
              <p className='text-zinc-800 font-medium mt-1'>Address:</p>
              {item.docData?.address ? (
                typeof item.docData.address === 'string' ? (
                  <p className='text-xs'>{item.docData.address}</p>
                ) : (
                  <>
                    <p className='text-xs'>{item.docData.address?.line1 || ''}</p>
                    <p className='text-xs'>{item.docData.address?.line2 || ''}</p>
                  </>
                )
              ) : (
                <p className='text-xs'>N/A</p>
              )}
              <p><span className='text-sm text-neutral-800 font-medium'>Date & Time:</span>{slotDateFormat(item.slotDate)}{item.slotTime ? ' | ' + item.slotTime : ''}</p>
            </div>
            <div></div>
            <div className='flex flex-col justify-end gap-2'>
              {!item.cancelled && (
                <>
                  {!item.payment ? (
                    <button onClick={() => initiatePayment(item._id, item.amount)} className='text-sm text-stone-600 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>
                  ) : (
                    <>
                      <div className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500 text-center'>
                        Payment Done
                      </div>
                      <button 
                        onClick={() => downloadAppointmentReceipt(item._id)}
                        className='text-sm text-center sm:min-w-48 py-2 border border-green-500 rounded text-green-600 hover:bg-green-500 hover:text-white transition-all duration-300'
                      >
                        📄 Download Receipt
                      </button>
                    </>
                  )}

                  {item.payment ? (
                    item.consultationStatus === 'approved' && item.meetingRoomId ? (
                      <button
                        onClick={() => handleJoinVideoCall(item.meetingRoomId)}
                        className='text-sm text-center sm:min-w-48 py-2 border rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-300'
                      >
                        Join Video Call
                      </button>
                    ) : item.consultationStatus === 'pending' ? (
                      <div className='text-sm text-center sm:min-w-48 py-2 border rounded bg-yellow-100 text-yellow-800'>
                        Payment received. Waiting for doctor approval to start the video consultation.
                      </div>
                    ) : null
                  ) : (
                    <div className='text-sm text-center sm:min-w-48 py-2 border rounded bg-yellow-100 text-yellow-800'>
                      Pay online first to activate video consultation.
                    </div>
                  )}

                  <button 
                    onClick={() => getPrescription(item._id)} 
                    className='text-sm text-center sm:min-w-48 py-2 border rounded hover:bg-blue-500 hover:text-white transition-all duration-300'
                  >
                    {loadingPrescription[item._id] ? 'Loading...' : 'View Prescription'}
                  </button>
                  {prescriptions[item._id] && (
                    <button
                      onClick={() => downloadPrescription(prescriptions[item._id]._id, prescriptions[item._id].fileName)}
                      className='text-sm text-center sm:min-w-48 py-2 border border-blue-500 rounded text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300'
                    >
                      ⬇ Download Prescription
                    </button>
                  )}
                  {!item.payment && (
                    <button onClick={() => cancelAppointment(item._id)} className='text-sm text-center sm:min-w-48 py-2 border rounded hover:bg-red-700 hover:text-white transition-all duration-300'>Cancel appointment</button>
                  )}
                </>
              )}

              {item.cancelled && (
                <div className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500 text-center'>
                  Appointment Cancelled
                </div>
              )}

            </div>
          </div>


        ))}
      </div>

      <p className='pb-3 mt-8 font-medium text-zinc-800 border-b'>My lab bookings</p>
      <div>
        {labOrders.map((o, i) => (
          <div key={i} className='gird grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b'>
            <div className='w-36 bg-indigo-100 p-3 rounded'>
              <p className='font-semibold'>{o.labTestId?.name}</p>
              <p className='text-sm text-gray-600'>{o.labTestId?.sampleType}</p>
            </div>
            <div className='flex-1 text-sm text-zinc-700'>
              <p className='text-neutral-900 font-semibold'>{o.patientName || 'Self'}</p>
              <p className='text-sm text-gray-600'>Scheduled: {new Date(o.scheduleDate).toLocaleString()}</p>
              <p className='text-sm text-gray-600'>Status: <span className={o.status === 'booked' ? 'text-yellow-600' : o.status === 'completed' ? 'text-green-600' : 'text-red-600'}>{o.status}</span></p>
            </div>
            <div className='flex flex-col justify-end'>
              {o.status === 'booked' && (
                <>
                  {!o.payment ? (
                    <button onClick={() => initiateLabPayment(o._id, o.labTestId?.price)} className='text-sm text-stone-600 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>
                  ) : (
                    <>
                      <div className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500 text-center'>
                        Payment Done
                      </div>
                      <button 
                        onClick={() => downloadLabOrderReceipt(o._id)}
                        className='text-sm text-center sm:min-w-48 py-2 border border-green-500 rounded text-green-600 hover:bg-green-500 hover:text-white transition-all duration-300'
                      >
                        📄 Download Receipt
                      </button>
                    </>
                  )}
                  {!o.payment && (
                    <button onClick={async () => { if (confirm('Cancel lab order?')) { const ok = await cancelLabOrder(o._id); if (ok) { const lo = await getUserLabOrders(); setLabOrders(lo || []) } } }} className='text-sm text-stone-600 text-center sm:min-w-48 py-2 border rounded hover:bg-red-700 hover:text-white transition-all duration-300'>Cancel booking</button>
                  )}
                </>
              )}
              {o.status !== 'booked' && o.payment && (
                <div className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500 text-center'>
                  Payment Done
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointments