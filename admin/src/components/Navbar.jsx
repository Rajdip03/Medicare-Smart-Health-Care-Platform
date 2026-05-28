import React, { use, useContext } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from 'react-router-dom'

const Navbar = (props) => {

  const { aToken, setAToken } = useContext(AdminContext)
  const { dToken, logout: doctorLogout } = useContext(DoctorContext)
  const navigate = useNavigate();


  const logout = () => {
    navigate('/login');
    if (aToken) {
      setAToken('')
      localStorage.removeItem('aToken')
    }
    if (dToken) {
      doctorLogout()
    }
  }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
        {/* Mobile: menu button */}
        <button onClick={() => typeof props?.toggleSidebar === 'function' ? props.toggleSidebar() : null} className='mr-2 p-2 rounded-md sm:hidden'>
          <svg xmlns="http://www.w3.org/2000/svg" className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
          </svg>
        </button>

        {
          aToken ? (
            <>
              <img className='w-28 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="" />
              <p className='border px-2 py-0.5 rounded-full border-gray-500 text-gray-600 hidden sm:inline'>
                Admin
              </p>
            </>
          ) : dToken ? (
            <>
              <img className='w-10 sm:w-12 cursor-pointer' src={assets.doctor_icon} alt="" />
              <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600 hidden sm:inline'>
                Doctor
              </p>
            </>
          ) : (
            <>
              <img className='w-28 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="" />
              <p className='border px-2 py-0.5 rounded-full border-gray-500 text-gray-600 hidden sm:inline'>
                Admin
              </p>
            </>
          )
        }
      </div>

      <button
        onClick={logout}
        className='bg-[#36486B] text-white text-sm px-4 sm:px-10 py-2 rounded-full'
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar
