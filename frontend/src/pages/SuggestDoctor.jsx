import React, { useState, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const SuggestDoctor = () => {
  const { backendURL } = useContext(AppContext)
  const navigate = useNavigate()
  const [disease, setDisease] = useState('')
  const [suggestedDoctors, setSuggestedDoctors] = useState([])
  const [speciality, setSpeciality] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSuggest = async (e) => {
    e.preventDefault()
    
    if (!disease.trim()) {
      toast.error('Please enter disease or symptom')
      return
    }

    try {
      setLoading(true)
      const { data } = await axios.post(
        backendURL + '/api/user/suggest-doctors',
        { disease }
      )

      if (data.success) {
        setSuggestedDoctors(data.doctors)
        setSpeciality(data.speciality)
        if (data.doctors.length > 0) {
          toast.success(`Found ${data.doctors.length} ${data.speciality}(s) for "${disease}"`)
        } else {
          toast.info(`No doctors found for "${data.speciality}". Try another search.`)
        }
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='py-16 px-4 sm:px-0'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Find Doctor by Symptom</h1>
        <p className='text-gray-600'>Describe your symptoms and we'll suggest the right specialist for you</p>
      </div>

      <div className='max-w-2xl mx-auto mb-12'>
        <form onSubmit={handleSuggest} className='flex flex-col gap-4'>
          <div>
            <label className='block text-gray-700 font-medium mb-2'>Your Symptoms or Disease</label>
            <input
              type='text'
              placeholder='e.g., headache, skin rash, stomach pain, pregnancy, baby care...'
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
            />
          </div>
          <button
            type='submit'
            disabled={loading}
            className='bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-all'
          >
            {loading ? 'Searching...' : 'Find Doctor'}
          </button>
        </form>
      </div>

      {speciality && (
        <div className='max-w-6xl mx-auto'>
          <p className='text-lg font-semibold text-gray-800 mb-4'>
            Recommended Specialists: <span className='text-primary'>{speciality}</span>
          </p>
          
          {suggestedDoctors.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {suggestedDoctors.map((doc) => (
                <div key={doc._id} className='bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer' onClick={() => navigate(`/appointments/${doc._id}`)}>
                  <img src={doc.image} alt={doc.name} className='w-full h-48 object-cover' />
                  <div className='p-4'>
                    <p className='text-lg font-semibold text-gray-800'>{doc.name}</p>
                    <p className='text-sm text-gray-600'>{doc.speciality}</p>
                    <p className='text-sm text-gray-500 mt-1'>{doc.degree}</p>
                    <p className='text-sm text-gray-500'>{doc.experience} experience</p>
                    <p className='text-primary font-semibold mt-2'>₹{doc.fees} Consultation</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/appointments/${doc._id}`)
                      }}
                      className='w-full mt-4 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all'
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-gray-600 text-center'>No doctors found for the selected speciality. Try searching with different symptoms.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default SuggestDoctor
