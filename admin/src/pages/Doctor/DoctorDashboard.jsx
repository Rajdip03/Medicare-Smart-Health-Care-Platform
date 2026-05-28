import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'

const DoctorDashboard = () => {
  const { dToken, doctorDashData, getDoctorDashData } = useContext(DoctorContext)

  useEffect(() => {
    if (dToken) getDoctorDashData()
  }, [dToken])

  return (
    <div className='m-5'>
      <h1 className='text-2xl font-semibold mb-4'>Doctor Dashboard</h1>

      {doctorDashData ? (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl'>
            <div className='p-6 bg-white rounded shadow'>
              <p className='text-sm text-gray-600'>Total Patients</p>
              <p className='text-3xl font-bold'>{doctorDashData.totalPatients}</p>
            </div>

            <div className='p-6 bg-white rounded shadow'>
              <p className='text-sm text-gray-600'>Total Appointments</p>
              <p className='text-3xl font-bold'>{doctorDashData.totalAppointments}</p>
            </div>
          </div>

          <div className='mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='bg-white rounded shadow p-6'>
              <h2 className='text-lg font-semibold mb-3'>Patients</h2>
              {doctorDashData.patients && doctorDashData.patients.length > 0 ? (
                <ul className='space-y-3'>
                  {doctorDashData.patients.map((p, idx) => (
                    <li key={idx} className='flex items-center gap-3'>
                      <div className='w-12 h-12 rounded-full overflow-hidden bg-gray-100'>
                        {p.image ? (
                          <img src={p.image} alt={p.name} className='w-full h-full object-cover' />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-sm text-gray-600'>{(p.name && p.name.charAt(0)) || 'P'}</div>
                        )}
                      </div>
                      <div>
                        <div className='font-medium'>{p.name || p.email}</div>
                        <div className='text-sm text-gray-500'>{p.email}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-gray-500'>No patients yet</p>
              )}
            </div>

            <div className='bg-white rounded shadow p-6'>
              <h2 className='text-lg font-semibold mb-3'>Recent Appointments</h2>
              {doctorDashData.latestAppointments && doctorDashData.latestAppointments.length > 0 ? (
                <ul className='space-y-3'>
                  {doctorDashData.latestAppointments.map((a) => (
                    <li key={a._id} className='border rounded p-3'>
                      <div className='flex items-start gap-3'>
                        <div className='w-12 h-12 rounded-full overflow-hidden bg-gray-100'>
                          {a.userData?.image ? (
                            <img src={a.userData.image} alt={a.userData.name} className='w-full h-full object-cover' />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-sm text-gray-600'>{(a.userData?.name && a.userData.name.charAt(0)) || 'P'}</div>
                          )}
                        </div>
                        <div className='flex-1'>
                          <div className='font-medium'>{a.userData?.name || a.userData?.email || 'Unknown'}</div>
                          <div className='text-sm text-gray-500'>{a.userData?.email}</div>
                          <div className='text-sm text-gray-700 mt-1'>{a.slotDate} | {a.slotTime}</div>
                        </div>
                        <div className='text-sm'>
                          {a.cancelled ? <span className='text-red-600'>Cancelled</span> : <span className='text-green-600'>Confirmed</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-gray-500'>No recent appointments</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className='text-gray-600'>Loading...</p>
      )}
    </div>
  )
}

export default DoctorDashboard
