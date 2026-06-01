import React, { useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'


const MyProfile = () => {

  const { userData, setUserData, token, backendURL, loadUserProfileData } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)

  const updateUserProfileData = async () => {
    try {
        const formData = new FormData();

        formData.append('name', userData.name);
        formData.append('phone', userData.phone);
        formData.append('address', JSON.stringify(userData.address));
        formData.append('gender', userData.gender);
        formData.append('dob', userData.dob);

    
            image && formData.append('image', image);
        

        const { data } = await axios.post(
            backendURL + '/api/user/update-profile',
            formData,
            { headers: { token } }
        );

        if (data.success) {
            toast.success(data.message);
            await loadUserProfileData();
            setIsEdit(false);
            setImage(false);
        }
    } catch (error) {
        console.log(error);
        toast.error(error.message);
    }
};


  const onSave = async () => {
    try {
      if (!token) return toast.error('Not authenticated')

      const formData = new FormData()
      formData.append('userId', userData._id)
      formData.append('name', userData.name || '')
      formData.append('phone', userData.phone || '')
      formData.append('dob', userData.dob || '')
      formData.append('gender', userData.gender || '')
      // address must be sent as string (backend parses JSON)
      formData.append('address', JSON.stringify(userData.address || { line1: '', line2: '' }))
      if (image) formData.append('image', image)

      const { data } = await axios.post(
        backendURL + '/api/user/update-profile',
        formData,
        {
          headers: {
            token,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (data.success) {
        toast.success('Profile updated')
        // refresh profile from server
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      } else {
        toast.error(data.message || 'Update failed')
      }

    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Update failed')
    }
  }


  return userData && (
    <div className='max-w-lg flex flex-col gap-2 text-sm'>
      

      {
        isEdit ? (
          <label htmlFor="image">
            <div className='inline-block relative cursor-pointer'>
              <img className='w-36 rounded opacity-75'
                src={image ? URL.createObjectURL(image) : userData.image}
                alt=""/>
                <img className='w-10 absolute bottom-12 right-12' src={image ? '' : assets.upload_icon} alt=''/>
              
            </div>

            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="image"
              hidden
            />
          </label>
        ) : (
          <img className="w-36 rounded" src={userData.image} alt="" />
        )
      }



      {/* Edited Related code(name edit) */}
      {
        isEdit
          ? <input className='bg-gray-100 text-3xl font-medium max-w-60 mt-4' type="text" value={userData.name} onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))} />
          : <p className='font-medium text-3xl text-neutral-900 mt-4'>{userData.name}</p>
      }

      {/* end here(name edit) */}

      <hr className='bg-zinc-400 h-[1px] border-none' />
      <div>
        <p className='text-neutral-600 underline mt-3'>CONTACT INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-800'>
          <p className='font-medium'>Email id:</p>
          <p className='text-blue-600'>{userData.email}</p>

          <p className='font-medium'>Phone:</p>
          {
            isEdit
              ? <input className='bg-gray-200 max-w-52' type="text" value={userData.phone} onChange={(e) => setUserData((prev) => ({ ...prev, phone: e.target.value }))} />
              : <p className='text-blue-500'>{userData.phone}</p>
          }

          <p className='font-medium'>Address:</p>
          {/* Object inside object  */}
          {
            isEdit
              ? <p>
                <input className='bg-gray-200' type="text" value={userData.address.line1} onChange={(e) => setUserData((prev) => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} />
                <br />
                <input className='bg-gray-200' type="text" value={userData.address.line2} onChange={(e) => setUserData((prev) => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} />

              </p>
              : <p className='text-gray-600'>
                {userData.address.line1}
                <br />
                {userData.address.line2}
              </p>
          }


        </div>
      </div>

      <div>
        <p className='text-neutral-600 underline mt-3'>BASIC INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-800'>
          <p className='font-medium'>Gender:</p>
          {
            isEdit
              ? <select className='max-w-20 bg-gray-200' onChange={(e) => setUserData((prev) => ({ ...prev, gender: e.target.value }))} value={userData.gender} >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
              : <p className='text-gray-500'>{userData.gender}</p>
          }
          <p className='font-medium'>Birthday:</p>
          {
            isEdit ?
              <input className='max-w-28 bg-gray-200' type="date" onChange={(e) => setUserData((prev) => ({ ...prev, dob: e.target.value }))} value={userData.dob} />
              : <p className='text-gray-500'>{userData.dob}</p>
          }
        </div>
      </div>

      {/* Here use buttmon */}
      <div className='mt-10'>
        {
          isEdit ?
            <button className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all' onClick={updateUserProfileData}>Save information</button>
            : <button className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all' onClick={() => setIsEdit(true)}>Edit</button>
        }
      </div>

    </div>
  )
}

export default MyProfile