import React, { useEffect, useState, useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'

const LabOrdersAdmin = () => {
  const { getAllLabOrdersAdmin, updateLabOrderStatusAdmin } = useContext(AdminContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await getAllLabOrdersAdmin()
    setOrders(res || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const changeStatus = async (id, status) => {
    const ok = await updateLabOrderStatusAdmin(id, status)
    if (ok) load()
  }

  return (
    <div className='p-6'>
      <h2 className='text-2xl font-semibold mb-4'>Lab Orders</h2>
      {loading && <p>Loading...</p>}
      {!loading && orders.length === 0 && <p>No orders</p>}
      <div className='space-y-3'>
        {orders.map(o => (
          <div key={o._id} className='p-4 border rounded flex items-center justify-between'>
            <div>
              <div className='font-semibold'>{o.labTestId?.name || 'Test'}</div>
              <div className='text-sm text-gray-600'>{o.patientName} • {new Date(o.scheduleDate).toLocaleString()}</div>
              <div className='text-sm text-gray-600'>User: {o.userId?.name || 'unknown'}</div>
            </div>
            <div className='flex items-center gap-2'>
              <select value={o.status} onChange={e => changeStatus(o._id, e.target.value)} className='border p-1'>
                <option value='booked'>Booked</option>
                <option value='completed'>Completed</option>
                <option value='cancelled'>Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LabOrdersAdmin
