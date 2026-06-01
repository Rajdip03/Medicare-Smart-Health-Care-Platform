import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Doctors = () => {
  const { speciality } = useParams()
  const navigate = useNavigate()

  const {
    doctors,
    userData,
    toggleFavorite,
    loadUserProfileData,
    searchDoctors,
    getDoctorsData
  } = useContext(AppContext)

  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpeciality, setSelectedSpeciality] = useState(speciality || '')
  const [sortBy, setSortBy] = useState('')

  const applyFilter = () => {
    if (selectedSpeciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === selectedSpeciality))
    } else {
      setFilterDoc(doctors)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, selectedSpeciality])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchTerm && !selectedSpeciality && !sortBy) {
        await getDoctorsData?.()
        return
      }

      const params = {}
      if (searchTerm) params.q = searchTerm
      if (selectedSpeciality) params.speciality = selectedSpeciality
      if (sortBy) params.sort = sortBy

      const res = await searchDoctors(params)
      if (res?.doctors) setFilterDoc(res.doctors)
    }, 350)

    return () => clearTimeout(timer)
  }, [searchTerm, selectedSpeciality, sortBy])

  return (
    <div>
      <p className="text-gray-600">Browse through the doctors specialist.</p>

      {/* Search & Sort */}
      <div className="flex flex-wrap items-center gap-3 mt-4 mb-4">
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search doctors"
          className="border p-2 rounded w-full max-w-md"
        />

        <select
          value={selectedSpeciality}
          onChange={e => setSelectedSpeciality(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Specialities</option>
          {[...new Set(doctors.map(d => d.speciality))].map((s, i) => (
            <option key={i} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Sort</option>
          <option value="rating">Top Rated</option>
          <option value="fees-asc">Fees: Low → High</option>
          <option value="fees-desc">Fees: High → Low</option>
        </select>

        <button
          onClick={() => {
            setSearchTerm('')
            setSelectedSpeciality('')
            setSortBy('')
            getDoctorsData?.()
          }}
          className="px-3 py-2 border rounded"
        >
          Reset
        </button>
      </div>

      {/* Mobile filter button */}
      <button
        className={`py-1 px-3 border rounded text-sm sm:hidden ${showFilter ? 'bg-primary text-white' : ''
          }`}
        onClick={() => setShowFilter(!showFilter)}
      >
        Filters
      </button>

      {/* Doctors Grid */}
      <div className="grid grid-cols-auto gap-4 gap-y-6 mt-5">
        {filterDoc.map(item => (
          <div
            key={item._id}
            onClick={() => navigate(`/appointments/${item._id}`)}
            className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300"
          >
            <div className="bg-blue-200 h-48 flex items-center justify-center">
              <img
                src={item.image}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            </div>


            <div className="p-4">
              <p className="text-green-500 text-sm">● Available</p>

              <div className="flex justify-between items-start mt-2">
                <div>
                  <p className="text-lg font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.speciality}</p>
                  <p className="text-sm text-yellow-600 mt-1">
                    {item.avgRating
                      ? `${item.avgRating} ★ (${item.ratingCount || 0})`
                      : 'No ratings yet'}
                  </p>
                </div>

                <button
                  onClick={async e => {
                    e.stopPropagation()
                    if (!userData) return navigate('/login')
                    await toggleFavorite(item._id)
                    await loadUserProfileData()
                  }}
                  className={`text-sm px-2 py-1 rounded ${userData?.favorites?.includes(item._id)
                      ? 'bg-yellow-400'
                      : 'bg-gray-200'
                    }`}
                >
                  {userData?.favorites?.includes(item._id) ? '★' : '+'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Doctors
