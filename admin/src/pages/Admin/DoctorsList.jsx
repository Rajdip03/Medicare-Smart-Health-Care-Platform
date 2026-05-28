import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {

    const { doctors, aToken, getAllDoctors,changeAvailability, updateDoctor, deleteDoctor } = useContext(AdminContext)

    const [showModal, setShowModal] = useState(false)
    const [selected, setSelected] = useState(null)
    const [formData, setFormData] = useState({ name: '', speciality: '', degree: '', experience: '', about: '', fees: '', address: '' })
    const [imageFile, setImageFile] = useState(null)

    useEffect(() => {
        if (aToken) {
            getAllDoctors()
        }
    }, [aToken])

    const openEdit = (doc) => {
        setSelected(doc)
        setFormData({ name: doc.name || '', speciality: doc.speciality || '', degree: doc.degree || '', experience: doc.experience || '', about: doc.about || '', fees: doc.fees || '', address: doc.address || '' })
        setImageFile(null)
        setShowModal(true)
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        const fd = new FormData()
        fd.append('docId', selected._id)
        Object.keys(formData).forEach(k => fd.append(k, formData[k]))
        if (imageFile) fd.append('image', imageFile)
        const ok = await updateDoctor(fd)
        if (ok) setShowModal(false)
    }

    const handleDelete = async (docId) => {
        if (!window.confirm('Delete this doctor?')) return
        await deleteDoctor(docId)
    }

    return (
       <div className='m-5 max-h-[90vh] overflow-y-scroll'>
    <h1 className='text-lg font-medium'>All Doctors</h1>
    <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {
            doctors.map((item, index) => (
                <div key={index} className='border border-indigo-200 rounded-xl max-w-56 overflow-hidden group'>
                    <img src={item.image} alt="" className='bg-indigo-50 group-hover:bg-primary transition-all duration-500' />

                    <div className='p-4'>
                        <p className='text-neutral-800 text-lg font-medium'>{item.name}</p>
                        <p className='text-zinc-600 text-sm'>{item.speciality}</p>

                        <div className='mt-2 flex items-center gap-1 text-sm'>
                            <input onChange={()=>changeAvailability(item._id)} type="checkbox" checked={item.available} />
                            <p>Available</p>
                        </div>

                        <div className='mt-3 flex items-center gap-2'>
                            <button onClick={()=>openEdit(item)} className='px-3 py-1 bg-yellow-400 rounded text-sm'>Edit</button>
                            <button onClick={()=>handleDelete(item._id)} className='px-3 py-1 bg-red-500 text-white rounded text-sm'>Delete</button>
                        </div>
                    </div>
                </div>
            ))
        }
    </div>

    {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center'>
            <div className='bg-white rounded p-6 w-full max-w-2xl'>
                <h2 className='text-lg font-medium mb-4'>Edit Doctor</h2>
                <form onSubmit={handleUpdate}>
                    <div className='grid grid-cols-2 gap-4'>
                        <input value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})} className='p-2 border' placeholder='Name' required />
                        <input value={formData.speciality} onChange={(e)=>setFormData({...formData,speciality:e.target.value})} className='p-2 border' placeholder='Speciality' required />
                        <input value={formData.degree} onChange={(e)=>setFormData({...formData,degree:e.target.value})} className='p-2 border' placeholder='Degree' />
                        <input value={formData.experience} onChange={(e)=>setFormData({...formData,experience:e.target.value})} className='p-2 border' placeholder='Experience' />
                        <input value={formData.fees} onChange={(e)=>setFormData({...formData,fees:e.target.value})} className='p-2 border' placeholder='Fees' />
                        <input value={formData.address} onChange={(e)=>setFormData({...formData,address:e.target.value})} className='p-2 border' placeholder='Address' />
                    </div>

                    <textarea value={formData.about} onChange={(e)=>setFormData({...formData,about:e.target.value})} className='w-full p-2 border mt-4' rows={4} placeholder='About'></textarea>

                    <div className='mt-4 flex items-center gap-4'>
                        <input onChange={(e)=>setImageFile(e.target.files[0])} type='file' />
                        <div className='ml-auto flex items-center gap-2'>
                            <button type='button' onClick={()=>setShowModal(false)} className='px-4 py-2 border rounded'>Cancel</button>
                            <button type='submit' className='px-4 py-2 bg-blue-600 text-white rounded'>Save</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )}

</div>

    )
}

export default DoctorsList
