import React, { useEffect, useState, useContext, useRef } from 'react'
import { AdminContext } from '../../context/AdminContext'

const BedManagement = () => {
  const { getWards, getBedsAdmin, createBedAdmin, deleteBedAdmin, assignBedAdmin, unassignBedAdmin, getUsersAdmin, createUserAdmin } = useContext(AdminContext)
  const [wards, setWards] = useState([])
  const [selectedWard, setSelectedWard] = useState('')
  const [beds, setBeds] = useState([])
  const [form, setForm] = useState({ wardId: '', bedNumber: '', type: 'Normal', notes: '' })
  const [loading, setLoading] = useState(true)
  const [showAssignFor, setShowAssignFor] = useState(null)
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchingPatients, setSearchingPatients] = useState(false)
  const [showAddPatientForm, setShowAddPatientForm] = useState(false)
  const [addPatientForm, setAddPatientForm] = useState({ name: '', email: '', phone: '' })
  const [createdTempPassword, setCreatedTempPassword] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const searchInputRef = useRef(null)

  const loadWards = async () => { const w = await getWards(); setWards(w || []) }
  const loadBeds = async (wardId) => {  
    setLoading(true)
    const b = await getBedsAdmin({ wardId })    
    setBeds(b || [])
    setLoading(false)
  }

  useEffect(() => { loadWards() }, [])
  useEffect(() => { if (selectedWard) loadBeds(selectedWard) }, [selectedWard])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addBed = async (e) => {
    e.preventDefault()
    await createBedAdmin(form)
    setForm({ wardId: selectedWard, bedNumber: '', type: 'Normal', notes: '' })
    await loadBeds(selectedWard)
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete bed?')) return
    await deleteBedAdmin(id)
    await loadBeds(selectedWard)
  }

  const onAssign = async (id) => { 
    // open inline assign UI for this bed
    setShowAssignFor(id)
    setPatientSearch('')
    setPatientResults([])
    setSelectedPatient(null)
  }

  // track mobile viewport
  useEffect(()=>{
    const onResize = ()=> setIsMobile(window.innerWidth < 640)
    onResize()
    window.addEventListener('resize', onResize)
    return ()=> window.removeEventListener('resize', onResize)
  }, [])

  // focus input when assign modal opens on mobile
  useEffect(()=>{
    if (showAssignFor && isMobile) {
      setTimeout(()=>{
        if (searchInputRef.current) searchInputRef.current.focus()
      }, 120)
    }
  }, [showAssignFor, isMobile])

  // debounced patient search
  useEffect(() => {
    let t
    if (patientSearch && showAssignFor) {
      setSearchingPatients(true)
      t = setTimeout(async () => {
        const users = await getUsersAdmin(patientSearch)
        setPatientResults(users || [])
        setSearchingPatients(false)
      }, 350)
    } else {
      setPatientResults([])
      setSearchingPatients(false)
    }
    return () => clearTimeout(t)
  }, [patientSearch, showAssignFor])

  const confirmAssign = async (bedId) => {
    // If no explicit selection but exactly one search result exists, use it
    let pid = selectedPatient
    if (!pid && patientResults.length === 1) pid = patientResults[0]._id

    if (!pid) {
      return alert('Please select a patient from the list (or press Enter to pick the first match).')
    }

    await assignBedAdmin(bedId, { patientId: pid })
    setShowAssignFor(null)
    setSelectedPatient(null)
    setPatientSearch('')
    await loadBeds(selectedWard)
  }

  const onUnassign = async (id) => {
    if (!window.confirm('Unassign bed?')) return
    await unassignBedAdmin(id)
    await loadBeds(selectedWard)
  }

  return (
    <div className='m-4'>
      <h1 className='text-2xl font-semibold mb-4'>Bed Management</h1>

      <div className='bg-white p-4 rounded shadow mb-6'>
        <form onSubmit={addBed} className='space-y-3'>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <select name='wardId' className='border p-2 rounded' value={selectedWard || form.wardId} onChange={(e)=>{ setSelectedWard(e.target.value); setForm({ ...form, wardId: e.target.value })}} required>
              <option value=''>Select Ward</option>
              {wards.map(w=>(<option key={w._id} value={w._id}>{w.name}</option>))}
            </select>
            <input name='bedNumber' placeholder='Bed Number' className='border p-2 rounded' value={form.bedNumber} onChange={onChange} required />
            <select name='type' value={form.type} onChange={onChange} className='border p-2 rounded'>
              <option>Normal</option>
              <option>ICU</option>
              <option>Ventilator</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <input name='notes' placeholder='Notes' className='border p-2 rounded w-full' value={form.notes} onChange={onChange} />
          </div>

          <div>
            <button className='bg-[#36486B] text-white px-4 py-2 rounded'>Add Bed</button>
          </div>
        </form>
      </div>

      <div className='bg-white rounded shadow p-3'>
        <h3 className='font-semibold mb-3'>Beds{selectedWard ? ` — ${wards.find(w=>w._id===selectedWard)?.name || ''}` : ''}</h3>
        <div className='mb-3'>
          <label className='text-sm mr-2'>Filter Ward:</label>
          <select value={selectedWard} onChange={(e)=>setSelectedWard(e.target.value)} className='border p-2 rounded'>
            <option value=''>--</option>
            {wards.map(w=>(<option key={w._id} value={w._id}>{w.name}</option>))}
          </select>
        </div>

        {loading ? <p>Loading...</p> : (
          <ul className='space-y-3'>
            {beds.map(b => (
              <li key={b._id} className='p-3 border rounded flex items-center justify-between'>
                <div>
                  <div className='font-medium'>{b.bedNumber} <span className='text-sm text-gray-500'>({b.type})</span></div>
                  <div className='text-sm text-gray-500'>Status: {b.status} {b.wardId?.name ? `• ${b.wardId.name}` : ''}</div>
                  {b.patientId ? (
                    <div className='text-sm text-gray-700 mt-1'>
                      <div><span className='font-semibold'>Patient ID:</span> <code className='text-xs'>{b.patientId._id}</code></div>
                      <div><span className='font-semibold'>Name:</span> {b.patientId.name || '—'}</div>
                      <div><span className='font-semibold'>Phone:</span> {b.patientId.phone || '—'}</div>
                    </div>
                  ) : null}
                </div>
                <div className='flex items-center gap-2'>
                  {b.status !== 'occupied' ? <button onClick={()=>onAssign(b._id)} className='px-3 py-1 bg-green-100 rounded'>Assign</button> : <button onClick={()=>onUnassign(b._id)} className='px-3 py-1 bg-yellow-100 rounded'>Unassign</button>}
                  <button onClick={()=>onDelete(b._id)} className='px-3 py-1 bg-red-100 rounded'>Delete</button>
                </div>
                {showAssignFor === b._id && (
                  <div className='hidden sm:block w-full mt-2 p-2 border rounded bg-gray-50'>
                    <div className='flex gap-2 items-center'>
                      <input
                        value={patientSearch}
                        onChange={e=>setPatientSearch(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (patientResults.length > 0) {
                              setSelectedPatient(patientResults[0]._id)
                              confirmAssign(showAssignFor)
                            } else {
                              alert('No patients found to select')
                            }
                          }
                        }}
                        placeholder='Search patients by name / email / phone'
                        className='border p-2 rounded w-full'
                      />
                      <button onClick={()=>{ setShowAssignFor(null); setPatientSearch('') }} className='px-3 py-1 bg-gray-100 rounded'>Cancel</button>
                    </div>

                    {patientResults.length>0 && !selectedPatient ? <p className='text-sm text-gray-500 mt-2'>Tip: press Enter to select the first result</p> : null}
                    {searchingPatients ? <p className='text-sm text-gray-500 mt-2'>Searching...</p> : (
                      <ul className='mt-2 max-h-40 overflow-auto'>
                        {patientResults.length === 0 && patientSearch ? <li className='text-sm text-gray-500'>No patients found</li> : patientResults.map(p => (
                          <li key={p._id} onClick={()=>setSelectedPatient(p._id)} className={`p-2 cursor-pointer ${selectedPatient===p._id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                            <div className='font-medium'>{p.name || '—'}</div>
                            <div className='text-sm text-gray-500'>{p.email || ''}{p.phone ? ` • ${p.phone}` : ''}</div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className='mt-2 flex gap-2'>
                      <button onClick={()=>confirmAssign(b._id)} className='px-3 py-1 bg-green-200 rounded'>Confirm assign</button>
                      <button onClick={()=>{ setShowAssignFor(null); setSelectedPatient(null) }} className='px-3 py-1 bg-gray-100 rounded'>Close</button>
                      <button onClick={()=>{ setShowAddPatientForm(true); setCreatedTempPassword('') }} className='px-3 py-1 bg-blue-100 rounded'>Add patient</button>
                    </div>

                    {showAddPatientForm && (
                      <div className='mt-3 p-3 border rounded bg-white'>
                        <h4 className='font-semibold mb-2'>Add patient</h4>
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3'>
                          <input value={addPatientForm.name} onChange={e=>setAddPatientForm({...addPatientForm, name: e.target.value})} placeholder='Name' className='border p-2 rounded' />
                          <input value={addPatientForm.email} onChange={e=>setAddPatientForm({...addPatientForm, email: e.target.value})} placeholder='Email' className='border p-2 rounded' />
                        <input value={addPatientForm.phone} onChange={e=>setAddPatientForm({...addPatientForm, phone: e.target.value})} placeholder='Phone' className='border p-2 rounded' />
                        </div>
                        <div className='flex gap-2'>
                          <button onClick={async ()=>{
                            if (!addPatientForm.name || !addPatientForm.email) return alert('Name and email required')
                            const res = await createUserAdmin(addPatientForm)
                            if (res && res.success) {
                              // auto-select and show temp password
                              setSelectedPatient(res.user._id)
                              setPatientResults([res.user])
                              setCreatedTempPassword(res.tempPassword || '')
                              setShowAddPatientForm(false)
                              setPatientSearch('')
                            }
                          }} className='px-3 py-1 bg-green-200 rounded'>Create</button>
                          <button onClick={()=>{ setShowAddPatientForm(false); setAddPatientForm({ name:'', email:'', phone:'' }) }} className='px-3 py-1 bg-gray-100 rounded'>Cancel</button>
                        </div>
                        {createdTempPassword ? <p className='mt-2 text-sm text-green-700'>Patient created. Temporary password: <code>{createdTempPassword}</code></p> : null}
                      </div>
                    )}
                  </div>
                )}

                {/* mobile assign modal */}
                {showAssignFor === b._id && isMobile && (
                  <div className='fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40'>
                    <div className='w-full max-w-md bg-white rounded p-4'>
                      <div className='flex items-center justify-between mb-3'>
                        <h4 className='font-semibold'>Assign Patient</h4>
                        <button onClick={()=>{ setShowAssignFor(null); setPatientSearch(''); setSelectedPatient(null) }} className='px-2 py-1 bg-gray-100 rounded'>Close</button>
                      </div>
                      <div>
                        <input ref={searchInputRef} value={patientSearch} onChange={e=>setPatientSearch(e.target.value)} placeholder='Search by name / email / phone' className='border p-2 rounded w-full' />
                        {searchingPatients ? <p className='text-sm text-gray-500 mt-2'>Searching...</p> : (
                          <ul className='mt-2 max-h-56 overflow-auto'>
                            {patientResults.length === 0 && patientSearch ? <li className='text-sm text-gray-500'>No patients found</li> : patientResults.map(p => (
                              <li key={p._id} onClick={()=>setSelectedPatient(p._id)} className={`p-2 cursor-pointer ${selectedPatient===p._id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                                <div className='font-medium'>{p.name || '—'}</div>
                                <div className='text-sm text-gray-500'>{p.email || ''}{p.phone ? ` • ${p.phone}` : ''}</div>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className='mt-3 flex gap-2'>
                          <button onClick={()=>confirmAssign(b._id)} className='px-3 py-1 bg-green-200 rounded'>Confirm</button>
                          <button onClick={()=>{ setShowAddPatientForm(true); setCreatedTempPassword('') }} className='px-3 py-1 bg-blue-100 rounded'>Add patient</button>
                        </div>

                        {showAddPatientForm && (
                          <div className='mt-3 p-3 border rounded bg-white'>
                            <h4 className='font-semibold mb-2'>Add patient</h4>
                              <div className='grid grid-cols-1 gap-3 mb-3'>
                              <input value={addPatientForm.name} onChange={e=>setAddPatientForm({...addPatientForm, name: e.target.value})} placeholder='Name' className='border p-2 rounded' />
                              <input value={addPatientForm.email} onChange={e=>setAddPatientForm({...addPatientForm, email: e.target.value})} placeholder='Email' className='border p-2 rounded' />
                              <input value={addPatientForm.phone} onChange={e=>setAddPatientForm({...addPatientForm, phone: e.target.value})} placeholder='Phone' className='border p-2 rounded' />
                            </div>
                            <div className='flex gap-2'>
                              <button onClick={async ()=>{
                                if (!addPatientForm.name || !addPatientForm.email) return alert('Name and email required')
                                const res = await createUserAdmin(addPatientForm)
                                if (res && res.success) {
                                  // auto-select and show temp password
                                  setSelectedPatient(res.user._id)
                                  setPatientResults([res.user])
                                  setCreatedTempPassword(res.tempPassword || '')
                                  setShowAddPatientForm(false)
                                  setPatientSearch('')
                                }
                              }} className='px-3 py-1 bg-green-200 rounded'>Create</button>
                              <button onClick={()=>{ setShowAddPatientForm(false); setAddPatientForm({ name:'', email:'', phone:'' }) }} className='px-3 py-1 bg-gray-100 rounded'>Cancel</button>
                            </div>
                            {createdTempPassword ? <p className='mt-2 text-sm text-green-700'>Patient created. Temporary password: <code>{createdTempPassword}</code></p> : null}
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default BedManagement
