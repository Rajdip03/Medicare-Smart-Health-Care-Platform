import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const BottomNav = () => {
  return (
    <nav className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40'>
      <div className='flex justify-around py-2'>
        <NavLink to='/admin-dashboard' className={({isActive})=>`flex flex-col items-center text-xs ${isActive? 'text-[#36486B]': 'text-gray-600'}`}>
          <img src={assets.home_icon} alt='' className='w-6 h-6' />
          <span>Home</span>
        </NavLink>
        <NavLink to='/beds' className={({isActive})=>`flex flex-col items-center text-xs ${isActive? 'text-[#36486B]': 'text-gray-600'}`}>
          <img src={assets.people_icon} alt='' className='w-6 h-6' />
          <span>Beds</span>
        </NavLink>
        <NavLink to='/patients' className={({isActive})=>`flex flex-col items-center text-xs ${isActive? 'text-[#36486B]': 'text-gray-600'}`}>
          <img src={assets.people_icon} alt='' className='w-6 h-6' />
          <span>Patients</span>
        </NavLink>
        <NavLink to='/wards' className={({isActive})=>`flex flex-col items-center text-xs ${isActive? 'text-[#36486B]': 'text-gray-600'}`}>
          <img src={assets.list_icon} alt='' className='w-6 h-6' />
          <span>Wards</span>
        </NavLink>
      </div>
    </nav>
  )
}

export default BottomNav
