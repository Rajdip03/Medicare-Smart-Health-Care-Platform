import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const RelatedDoctors = ({docId, speciality}) => {
    const {doctors, userData, toggleFavorite, loadUserProfileData} = useContext(AppContext)
    const navigate= useNavigate()

    const [relDoc, setRelDoc] = useState([]);

    useEffect(()=>{
      if(doctors.length > 0 && speciality){
        const doctorsData=doctors.filter((doc)=>(doc.speciality === speciality && doc._id!==docId))
        setRelDoc(doctorsData)
      }

    },[doctors,speciality,docId])

    
  return (
     <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
            <h1 className='text-3xl font-medium'>Related Doctors</h1>
            <p className='sm:w-1/3 text-center text-sm'>Simpliy browse trough our extensive list of trusted doctor.</p>
            <div className='w-full  grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0' >
                {relDoc.slice(0, 5).map((item, index) => (
                    <div onClick={()=>{navigate(`/appointments/${item._id}`); scrollTo(0,0)}}  className='border  border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
                        <img className='bg-blue-200' src={item.image} alt="" />
                        <div className='p-4'>
                            <div className='flex items-center gap-2 text-sm text-green-500'>
                                <p className='w-2 h-2 bg-green-500 rounded-full'></p><p >Available</p>
                            </div>
                            <div className='flex items-center justify-between'>
                              <div>
                                <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                                <p className='text-gray-600 text-sm'>{item.speciality}</p>
                                <p className='text-sm text-yellow-600 mt-1'>{item.avgRating ? `${item.avgRating} ★ (${item.ratingCount || 0})` : 'No ratings yet'}</p>
                              </div>
                              <div>
                                <button onClick={async (e)=>{ e.stopPropagation(); if(!userData) return navigate('/login'); await toggleFavorite(item._id); await loadUserProfileData(); }} className={`text-sm px-2 py-1 rounded ${userData?.favorites && userData.favorites.includes(item._id) ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                                  {userData?.favorites && userData.favorites.includes(item._id) ? '★' : '+'}
                                </button>
                              </div>
                            </div>
                        </div>
                    </div>

                ))}
            </div>
            <button onClick={()=>{navigate('/doctors'); scrollTo(0,0)}} className='bg-blue-200 text-gray-600 px-12 py-3 rounded-full mt-10'>more</button>
        </div>
  )
}

export default RelatedDoctors