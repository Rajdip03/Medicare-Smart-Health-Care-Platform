import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../context/AppContext'

const LabTests = () => {
    const { getLabTests, bookLabTest, currencySymbol, token } = useContext(AppContext)
    const [tests, setTests] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [scheduleDate, setScheduleDate] = useState('')
    const [patientName, setPatientName] = useState('')
    const [patientPhone, setPatientPhone] = useState('')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            const res = await getLabTests()
            setTests(res || [])
            setLoading(false)
        }
        load()
    }, [])

    const openBook = (test) => {
        setSelected(test)
        setScheduleDate('')
        setPatientName('')
        setPatientPhone('')
        setNotes('')
    }

    const handleBook = async () => {
        if (!token) return alert('Please login to book a test')
        if (!scheduleDate || !patientName) return alert('Please fill date and patient name')
        const { success } = await bookLabTest({ labTestId: selected._id, scheduleDate, patientName, patientPhone, notes })
        if (success) {
            setSelected(null)
        }
    }

    return (
        <div className='py-8'>
            <h2 className='text-2xl font-semibold mb-4'>Lab Tests</h2>
            {loading && <p>Loading...</p>}
            {!loading && tests.length === 0 && <p>No lab tests available.</p>}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {tests.map(t => (
                    <div key={t._id} className='border p-4 rounded'>
                        <h3 className='font-semibold text-lg'>{t.name}</h3>
                        <p className='text-sm text-gray-600'>{t.description}</p>
                        <p className='mt-2 font-bold'>{currencySymbol}{Number(t.price).toLocaleString()}</p>
                        <button onClick={() => openBook(t)} className='mt-3 bg-blue-600 text-white px-3 py-2 rounded'>Book</button>
                    </div>
                ))}
            </div>

            {selected && (
                <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center'>
                    <div className='bg-white p-6 rounded w-full max-w-md'>
                        <h3 className='text-xl font-semibold mb-2'>Book: {selected.name}</h3>
                        <label className='block mb-2'>Schedule Date</label>
                        <input type='datetime-local' value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className='w-full border p-2 mb-2' />
                        <label className='block mb-2'>Patient Name</label>
                        <input value={patientName} onChange={e => setPatientName(e.target.value)} className='w-full border p-2 mb-2' />
                        <label className='block mb-2'>Patient Phone</label>
                        <input value={patientPhone} onChange={e => setPatientPhone(e.target.value)} className='w-full border p-2 mb-2' />
                        <label className='block mb-2'>Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className='w-full border p-2 mb-4' />
                        <div className='flex gap-2'>
                            <button onClick={handleBook} className='bg-green-600 text-white px-3 py-2 rounded'>Confirm Booking</button>
                            <button onClick={() => setSelected(null)} className='bg-gray-300 px-3 py-2 rounded'>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LabTests
