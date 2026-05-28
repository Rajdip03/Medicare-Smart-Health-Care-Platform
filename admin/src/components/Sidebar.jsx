import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'



const Sidebar = ({ show = false, onNavigate = () => {} }) => {

  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)
  return (
    // Mobile: off-canvas drawer; Desktop (md+): static sidebar
    <div className={`bg-white border-r fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 md:static ${show ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className='overflow-y-auto min-h-screen'>
        {/* mobile close button */}
        <div className='flex items-center justify-end p-3 md:hidden'>
          <button onClick={onNavigate} className='p-2 rounded-md'>
            <svg xmlns="http://www.w3.org/2000/svg" className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
      {
        aToken && <ul className='text-[#515151] mt-5'>

          <NavLink
            to="/admin-dashboard"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-[72px] cursor-pointer ${isActive ? 'bg-[#F2F8FF] border-r-4 border-[#36486B]' : ''}`
            }
          >
            <img src={assets.home_icon} alt="" />
            <p>Dashboard</p>
          </NavLink>


          <NavLink to={'/all-appointments'} onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-[72px] cursor-pointer ${isActive ? 'bg-[#F2F8FF] border-r-4 border-[#36486B]' : ''}`
            }>
            <img src={assets.appointment_icon} alt="" />
            <p>Appointments</p>
          </NavLink>

          <NavLink to={'/add-doctor'} onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-[72px] cursor-pointer ${isActive ? 'bg-[#F2F8FF] border-r-4 border-[#36486B]' : ''}`
            }>
            <img src={assets.add_icon} alt="" />
            <p>Add Doctor</p>
          </NavLink>

          <NavLink to={'/doctor-list'} onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-[72px] cursor-pointer ${isActive ? 'bg-[#F2F8FF] border-r-4 border-[#36486B]' : ''}`
            }>
            <img src={assets.people_icon} alt="" />
            <p>Doctor List</p>
          </NavLink>

          <NavLink to={'/lab-tests'} onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-[72px] cursor-pointer ${isActive ? 'bg-[#F2F8FF] border-r-4 border-[#36486B]' : ''}`
            }>
            <img src={assets.home_icon} alt="" />
            <p>Lab Tests</p>
          </NavLink>

          <NavLink to={'/lab-orders'} onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-[72px] cursor-pointer ${isActive ? 'bg-[#F2F8FF] border-r-4 border-[#36486B]' : ''}`
            }>
            <img src={assets.appointment_icon} alt="" />
            <p>Lab Orders</p>
          </NavLink>

          <NavLink to={'/patients'} onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-[72px] cursor-pointer ${isActive ? 'bg-[#F2F8FF] border-r-4 border-[#36486B]' : ''}`
            }>
            <img src={assets.people_icon} alt="" />
            <p>Patients</p>
          </NavLink>

          <NavLink to={'/wards'} onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-[72px] cursor-pointer ${isActive ? 'bg-[#F2F8FF] border-r-4 border-[#36486B]' : ''}`
            }>
            <img src={assets.list_icon} alt="" />
            <p>Wards</p>
          </NavLink>

          <NavLink to={'/beds'} onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-[72px] cursor-pointer ${isActive ? 'bg-[#F2F8FF] border-r-4 border-[#36486B]' : ''}`
            }>
            <img src={assets.people_icon} alt="" />
            <p>Beds</p>
          </NavLink>

        </ul>
      }

      {/* For Doctor Section */}
      {
        dToken && <ul className='text-[#515151] mt-5'>

          <NavLink
            to="/doctor-dashboard"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-[72px] cursor-pointer ${isActive ? 'bg-[#F2F8FF] border-r-4 border-[#36486B]' : ''}`
            }
          >
            <img src={assets.home_icon} alt="" />
            <p>Dashboard</p>
          </NavLink>


          <NavLink to={'/doctor-appointments'} onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-[72px] cursor-pointer ${isActive ? 'bg-[#F2F8FF] border-r-4 border-[#36486B]' : ''}`
            }>
            <img src={assets.appointment_icon} alt="" />
            <p>Appointments</p>
          </NavLink>



          <NavLink to={'/doctor-profile'} onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-[72px] cursor-pointer ${isActive ? 'bg-[#F2F8FF] border-r-4 border-[#36486B]' : ''}`
            }>
            <img src={assets.people_icon} alt="" />
            <p>Profile</p>
          </NavLink>

        </ul>
      }

      </div>
    </div>
  )
}

export default Sidebar
