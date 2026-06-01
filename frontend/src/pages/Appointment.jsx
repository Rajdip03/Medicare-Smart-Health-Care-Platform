import { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointment = () => {
  const { docId } = useParams()
  const { doctors, backendURL, token, getDoctorsData, addReview, getDoctorReviews, toggleFavorite, loadUserProfileData, userData, currencySymbol } = useContext(AppContext)
  const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null)

  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [slotDate, setSlotDate] = useState('')

  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [ratingCount, setRatingCount] = useState(0)

  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId)
    setDocInfo(docInfo)
  }



  const getAvailableSlots = async () => {
    setDocSlots([])
    setSlotIndex(0)
    setSlotTime('')
    setSlotDate('')

    //getting today date
    let today = new Date()

    for (let i = 0; i < 7; i++) {
      //getting current date with index
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)



      //setting and time of the date with index
      let endTime = new Date()
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21, 0, 0, 0)


      //setting hours
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      }
      else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      // compute slotDate key used by backend (day_month_year)
      const slotDateKey = `${currentDate.getDate()}_${currentDate.getMonth() + 1}_${currentDate.getFullYear()}`
      let timeSlots = []

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        const slotDate = `${currentDate.getDate()}_${currentDate.getMonth() + 1}_${currentDate.getFullYear()}`
        const slotTime = formattedTime

        // consider slot booked if docInfo has slots_booked for this date and time
        const isBooked = docInfo?.slots_booked && docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime)

        // only add if NOT booked
        if (!isBooked) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
            slotDate: slotDateKey
          })
        }

        //Increment current time by 30 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      if (timeSlots.length > 0) {
        setDocSlots(prev => ([...prev, timeSlots]))
      }
    }
  }

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment')
      // give the toast a moment to show before navigating
      setTimeout(() => navigate('/login'), 500)
      return
      // return navigate('/login');
    }

    if (!slotTime) {
      toast.warn('Please select an appointment time before booking.')
      return
    }

    const selectedGroup = docSlots[slotIndex]
    if (!selectedGroup || selectedGroup.length === 0) {
      toast.error('Please select a valid appointment date.')
      return
    }

    const selectedSlotDate = slotDate || selectedGroup[0].slotDate
    if (!selectedSlotDate) {
      toast.error('Unable to determine appointment date. Please try again.')
      return
    }

    try {
      const { data } = await axios.post(backendURL + '/api/user/book-appointment', { docId, slotDate: selectedSlotDate, slotTime }, {
        headers: {
          token
        }
      })
      if (data.success) {
        toast.success(data.message)
        if (typeof getDoctorsData === 'function') await getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }


    } catch (error) {
      toast.error(error.message);
    }

  }

  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])


  useEffect(() => {
    getAvailableSlots()
    if (docInfo) fetchReviews()
  }, [docInfo])

  const fetchReviews = async () => {
    try {
      const { reviews: revs, avgRating: avg, ratingCount: count } = await getDoctorReviews(docId)
      setReviews(revs)
      setAvgRating(avg)
      setRatingCount(count)
    } catch (error) {
      console.log(error)
    }
  }

  const submitReview = async () => {
    if (!token) return toast.warn('Login to submit review')
    const ok = await addReview(docId, newRating, newComment)
    if (ok) {
      setNewComment('')
      setNewRating(5)
      fetchReviews()
    }
  }

  if (!docInfo) return null;
  return (
    <div>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img src={docInfo.image} alt="" />
        </div>
        <div>
          <p className='text-xl font-semibold'>{docInfo.name}</p>
          <p className='text-sm text-gray-600'>{docInfo.degree} - {docInfo.speciality}</p>
          <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{docInfo.about}</p>
           <p className='mt-4'>Appointment fee: {currencySymbol}{Number(docInfo.fees || 0).toLocaleString()}</p>
          <div className='mt-4'>
            <p className='text-lg font-medium'>Rating: {avgRating}</p>
            <p className='text-sm text-gray-500'>({ratingCount} reviews)</p>
          </div>

          <div className='mt-3'>
            {reviews.length === 0 ? <p className='text-sm text-gray-500'>No reviews yet</p> : (
              <div className='space-y-3'>
                {reviews.map((r, idx) => (
                  <div key={idx} className='border p-3 rounded'>
                    <div className='flex items-center justify-between'>
                      <p className='font-medium'>{r.name}</p>
                      <p className='text-sm text-gray-500'>{new Date(r.date).toLocaleDateString()}</p>
                    </div>
                    <p className='text-sm text-yellow-600'>Rating: {r.rating}</p>
                    <p className='text-sm text-gray-700'>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

            <div className='mt-4'>
              <p className='font-medium'>Leave a review</p>
              <div className='mt-2 flex items-center gap-2'>
                <select value={newRating} onChange={(e)=>setNewRating(Number(e.target.value))} className='p-2 border'>
                  <option value={5}>5</option>
                  <option value={4}>4</option>
                  <option value={3}>3</option>
                  <option value={2}>2</option>
                  <option value={1}>1</option>
                </select>
                <textarea value={newComment} onChange={(e)=>setNewComment(e.target.value)} className='border p-2 w-full' placeholder='Write your review'></textarea>
                <button onClick={submitReview} className='px-4 py-2 bg-primary text-white rounded'>Submit</button>
              </div>
            </div>

          <div className='mt-2'>
            {token ? <button className='px-4 py-2'>Follow</button> : <button onClick={()=>navigate('/login')}>Login</button>}
          </div>
        </div>
      </div>
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {docSlots.length ? docSlots.map((slotGroup, idx) => (
            <div key={idx} onClick={() => {
              setSlotIndex(idx)
              setSlotTime('')
              setSlotDate(slotGroup[0]?.slotDate || '')
            }} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === idx ? 'bg-primary text-white' : 'border border-gray-300'}`}>
              <p>{slotGroup[0]?.datetime && dayOfWeek[slotGroup[0].datetime.getDay()]}</p>
              <p>{slotGroup[0]?.datetime && slotGroup[0].datetime.getDate()}</p>
            </div>
          )) : <p className='text-sm text-gray-500'>No slots</p>}
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots[slotIndex]?.map((item, index) => {
            const bookedForDate = docInfo?.slots_booked?.[item.slotDate];
            const isBooked = bookedForDate ? bookedForDate.includes(item.time) : false;
            return (
              <p key={index} onClick={() => { if (!isBooked) setSlotTime(item.time) }} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full ${isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : item.time === slotTime ? 'bg-primary text-white' : 'border border-gray-300 cursor-pointer'}`}>
                {item.time.toLowerCase()}
              </p>
            )
          })}
        </div>

        <button onClick={bookAppointment} disabled={!slotTime} className={`bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-8 ${!slotTime ? 'opacity-50 cursor-not-allowed' : ''}`}>Book an appointment</button>
      </div>

     
    </div>
  )
}

export default Appointment