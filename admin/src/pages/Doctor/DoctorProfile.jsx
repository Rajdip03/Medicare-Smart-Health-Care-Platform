import React, { useEffect, useState, useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'

const DoctorProfile = () => {
  const { dToken, doctorData, getDoctorProfile, updateDoctorProfile } = useContext(DoctorContext)

  const [form, setForm] = useState({
    name: '',
    speciality: '',
    degree: '',
    experience: '',
    about: '',
    fees: ''
  })

  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')

  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (dToken) {
      getDoctorProfile()
    }
  }, [dToken])

  
  useEffect(() => {
    if (doctorData) {
      setForm({
        name: doctorData.name || '',
        speciality: doctorData.speciality || '',
        degree: doctorData.degree || '',
        experience: doctorData.experience || '',
        about: doctorData.about || '',
        fees: doctorData.fees || ''
      })
      // split address into two parts by first comma
      const addr = doctorData.address || ''
      if (addr.includes(',')) {
        const parts = addr.split(',')
        setAddress1(parts[0].trim())
        setAddress2(parts.slice(1).join(',').trim())
      } else {
        setAddress1(addr) 
        setAddress2('')
      }

      setPreview(doctorData.image || null)
    }
  }, [doctorData])

  const onFileChange = (e) => {
    const f = e.target.files[0]
    setImageFile(f)
    if (f) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    }
  }

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('docId', doctorData._id)
    fd.append('name', form.name)
    fd.append('speciality', form.speciality)
    fd.append('degree', form.degree)
    fd.append('experience', form.experience)
    fd.append('about', form.about)
    fd.append('fees', form.fees)
    const combinedAddress = `${address1}${address2 ? ', ' + address2 : ''}`
    fd.append('address', combinedAddress)
    if (imageFile) fd.append('image', imageFile)

    await updateDoctorProfile(fd)
  }

  return (
    <div className='max-w-3xl mx-auto'>
      <h1 className='text-2xl font-semibold mb-4'>Doctor Profile</h1>
      <form onSubmit={onSubmit} className='space-y-4'>
        <div className='flex flex-col sm:flex-row items-center gap-4'>
          <div className='w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0'>
            {preview ? (
              <img src={preview} alt='preview' className='w-full h-full object-cover' />
            ) : (
              <div className='flex items-center justify-center w-full h-full text-xl text-gray-500'>No Image</div>
            )}
          </div>
          <input type='file' accept='image/*' onChange={onFileChange} />
        </div>

        <div>
          <label className='block mb-1'>Name</label>
          <input name='name' value={form.name} onChange={onChange} className='w-full border p-2 rounded' required />
        </div>

        <div>
          <label className='block mb-1'>Speciality</label>
          <input name='speciality' value={form.speciality} onChange={onChange} className='w-full border p-2 rounded' required />
        </div>

        <div>
          <label className='block mb-1'>Degree</label>
          <input name='degree' value={form.degree} onChange={onChange} className='w-full border p-2 rounded' required />
        </div>

        <div>
          <label className='block mb-1'>Experience</label>
          <input name='experience' value={form.experience} onChange={onChange} className='w-full border p-2 rounded' required />
        </div>

        <div>
          <label className='block mb-1'>About</label>
          <textarea name='about' value={form.about} onChange={onChange} className='w-full border p-2 rounded' rows={4} required />
        </div>

        <div>
          <label className='block mb-1'>Fees</label>
          <input name='fees' value={form.fees} onChange={onChange} className='w-full border p-2 rounded' required />
        </div>

        <div>
          <label className='block mb-1'>Address</label>
          <textarea name='address' value={form.address} onChange={onChange} className='w-full border p-2 rounded' rows={3} />
        </div>

        <button className='bg-[#36486B] text-white px-6 py-2 rounded w-full sm:w-auto'>Save Profile</button>
      </form>
    </div>
  )
}

export default DoctorProfile
