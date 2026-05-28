import React, { useEffect, useState, useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'

const LabTestsAdmin = () => {
  const { getLabTestsAdmin, addLabTestAdmin, updateLabTestAdmin, deleteLabTestAdmin } = useContext(AdminContext)
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', sampleType: '', preparation: '', available: true })

  const load = async () => {
    setLoading(true)
    const res = await getLabTestsAdmin()
    setTests(res || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', price: '', sampleType: '', preparation: '', available: true }); setShowForm(true) }
  const openEdit = (t) => { setEditing(t); setForm({ name: t.name, description: t.description, price: t.price, sampleType: t.sampleType, preparation: t.preparation, available: t.available }); setShowForm(true) }

  const handleSubmit = async () => {
    if (!form.name || !form.price) return alert('Name and price required')
    const payload = { ...form, price: Number(form.price) }
    let ok = false
    if (editing) {
      ok = await updateLabTestAdmin(editing._id, payload)
    } else {
      ok = await addLabTestAdmin(payload)
    }
    if (ok) { setShowForm(false); load() }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete test?')) return
    const ok = await deleteLabTestAdmin(id)
    if (ok) load()
  }

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-2xl font-semibold'>Lab Tests</h2>
        <button onClick={openAdd} className='bg-blue-600 text-white px-3 py-2 rounded'>Add Test</button>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && (
        <div className='grid grid-cols-1 gap-3'>
          {tests.map(t => (
            <div key={t._id} className='p-4 border rounded flex items-center justify-between'>
              <div>
                <div className='font-semibold'>{t.name} <span className='text-sm text-gray-500'>({t.sampleType})</span></div>
                <div className='text-sm text-gray-600'>{t.description}</div>
                <div className='text-sm font-bold mt-1'>₹{Number(t.price).toLocaleString()}</div>
              </div>
              <div className='flex gap-2'>
                <button onClick={() => openEdit(t)} className='px-3 py-1 bg-yellow-400 rounded'>Edit</button>
                <button onClick={() => handleDelete(t._id)} className='px-3 py-1 bg-red-500 text-white rounded'>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center'>
          <div className='bg-white p-6 rounded w-full max-w-lg'>
            <h3 className='text-xl font-semibold mb-2'>{editing ? 'Edit Test' : 'Add Test'}</h3>
            <div className='grid grid-cols-2 gap-3'>
              <input placeholder='Name' value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className='border p-2 col-span-2' />
              <input placeholder='Price' value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className='border p-2' />
              <input placeholder='Sample Type' value={form.sampleType} onChange={e => setForm({ ...form, sampleType: e.target.value })} className='border p-2' />
              <input placeholder='Preparation' value={form.preparation} onChange={e => setForm({ ...form, preparation: e.target.value })} className='border p-2' />
            </div>
            <textarea placeholder='Description' value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className='border w-full p-2 my-3' />
            <div className='flex gap-2'>
              <button onClick={handleSubmit} className='bg-green-600 text-white px-3 py-2 rounded'>Save</button>
              <button onClick={() => setShowForm(false)} className='bg-gray-300 px-3 py-2 rounded'>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LabTestsAdmin
