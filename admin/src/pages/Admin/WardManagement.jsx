import React, { useEffect, useState, useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'

const WardManagement = () => {
  const { getWards, createWardAdmin, updateWardAdmin, deleteWardAdmin } = useContext(AdminContext)
  const [wards, setWards] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', type: 'General', capacity: 0, location: '', notes: '' })
  const [editing, setEditing] = useState(null)

  const load = async () => {
    setLoading(true)
    const data = await getWards()
    setWards(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (editing) {
      await updateWardAdmin(editing._id, form)
      setEditing(null)
    } else {
      await createWardAdmin(form)
    }
    setForm({ name: '', type: 'General', capacity: 0, location: '', notes: '' })
    await load()
  }

  const onEdit = (w) => {
    setEditing(w)
    setForm({ name: w.name, type: w.type, capacity: w.capacity, location: w.location, notes: w.notes })
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete ward?')) return
    await deleteWardAdmin(id)
    await load()
  }

  return (
    <div className='m-4'>
      <h1 className='text-2xl font-semibold mb-4'>Ward Management</h1>

      <div className='bg-white p-4 rounded shadow mb-6'>
        <form onSubmit={onSubmit} className='space-y-3'>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <input name='name' placeholder='Ward name' className='border p-2 rounded' value={form.name} onChange={onChange} required />
            <select name='type' value={form.type} onChange={onChange} className='border p-2 rounded'>
              <option>General</option>
              <option>ICU</option>
              <option>Maternity</option>
              <option>Pediatrics</option>
              <option>Other</option>
            </select>
            <input name='capacity' type='number' className='border p-2 rounded' value={form.capacity} onChange={onChange} />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <input name='location' placeholder='Location' className='border p-2 rounded' value={form.location} onChange={onChange} />
            <input name='notes' placeholder='Notes' className='border p-2 rounded' value={form.notes} onChange={onChange} />
          </div>

          <div>
            <button className='bg-[#36486B] text-white px-4 py-2 rounded mr-3'>{editing ? 'Save Changes' : 'Add Ward'}</button>
            {editing && <button onClick={() => { setEditing(null); setForm({ name: '', type: 'General', capacity: 0, location: '', notes: '' }) }} className='px-4 py-2 border rounded'>Cancel</button>}
          </div>
        </form>
      </div>

      <div className='bg-white rounded shadow p-3'>
        <h3 className='font-semibold mb-3'>All Wards</h3>
        {loading ? <p>Loading...</p> : (
          <ul className='space-y-3'>
            {wards.map(w => (
              <li key={w._id} className='p-3 border rounded flex items-center justify-between'>
                <div>
                  <div className='font-medium'>{w.name} <span className='text-sm text-gray-500'>({w.type})</span></div>
                  <div className='text-sm text-gray-500'>Capacity: {w.capacity} • {w.location}</div>
                </div>
                <div className='flex items-center gap-2'>
                  <button onClick={() => onEdit(w)} className='px-3 py-1 bg-yellow-200 rounded'>Edit</button>
                  <button onClick={() => onDelete(w._id)} className='px-3 py-1 bg-red-100 rounded'>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default WardManagement
