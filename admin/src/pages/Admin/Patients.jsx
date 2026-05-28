import React, { useEffect, useState, useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'

const Patients = () => {
  const { getUsersAdmin, createUserAdmin } = useContext(AdminContext)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [tempPassword, setTempPassword] = useState('')

  useEffect(() => {
    let t
    if (search) {
      setLoading(true)
      t = setTimeout(async () => {
        const users = await getUsersAdmin(search)
        setResults(users || [])
        setLoading(false)
      }, 300)
    } else {
      setResults([])
    }
    return () => clearTimeout(t)
  }, [search])

  const onCreate = async () => {
    if (!form.name || !form.email) return alert('Name and email required')
    const res = await createUserAdmin(form)
    if (res && res.success) {
      setTempPassword(res.tempPassword)
      setShowCreate(false)
      setForm({ name: '', email: '', phone: '' })
      setResults([res.user, ...results])
    }
  }

  return (
    <div className='m-4'>
      <h1 className='text-2xl font-semibold mb-4'>Patients</h1>

      <div className='bg-white p-4 rounded shadow mb-4'>
        <div className='flex gap-2 items-center'>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search by name / email / phone' className='border p-2 rounded w-full' />
          <button onClick={()=>setShowCreate(true)} className='px-4 py-2 bg-blue-600 text-white rounded'>Add patient</button>
        </div>

        {loading ? <p className='mt-3 text-sm text-gray-500'>Searching...</p> : (
          <ul className='mt-3 space-y-2'>
            {results.map(u => (
              <li key={u._id} className='p-2 border rounded'>
                <div className='flex justify-between'>
                  <div>
                    <div className='font-medium'>{u.name}</div>
                    <div className='text-sm text-gray-500'>{u.email} {u.phone ? `• ${u.phone}` : ''}</div>
                    <div className='text-xs text-gray-500'>ID: <code>{u._id}</code></div>
                  </div>
                </div>
              </li>
            ))}
            {results.length === 0 && search ? <li className='text-sm text-gray-500'>No patients found</li> : null}
          </ul>
        )}
      </div>

      {showCreate && (
        <div className='bg-white p-4 rounded shadow'>
          <h3 className='font-semibold mb-3'>Add patient</h3>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <input className='border p-2 rounded' placeholder='Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <input className='border p-2 rounded' placeholder='Email' value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            <input className='border p-2 rounded' placeholder='Phone' value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          </div>
          <div className='mt-3 flex gap-2'>
            <button onClick={onCreate} className='px-3 py-1 bg-green-200 rounded'>Create</button>
            <button onClick={()=>setShowCreate(false)} className='px-3 py-1 bg-gray-100 rounded'>Cancel</button>
          </div>
          {tempPassword ? <p className='mt-2 text-sm text-green-700'>Temporary password: <code>{tempPassword}</code></p> : null}
        </div>
      )}
    </div>
  )
}

export default Patients
