import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets'

const Dashboard = () => {

    const { aToken, getDashData, getAllAppointments, appointments, dashData } = useContext(AdminContext)

    useEffect(() => {
        if (aToken) {
            getDashData()
            getAllAppointments()
        }
    }, [aToken])

    // Format date → 11 Dec 2025
    const formatDate = (dateString) => {
        if (!dateString) return ""
        const d = new Date(dateString)
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
    }

    // Format time → 05:30 PM
    const formatTime = (timeString) => {
        if (!timeString) return ""
        try {
            const [hours, minutes] = timeString.split(":")
            const d = new Date()
            d.setHours(hours, minutes)
            return d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch {
            return timeString
        }
    }

    const latestAppointments = appointments?.length
        ? [...appointments].sort((a, b) => (b.date || 0) - (a.date || 0)).slice(0, 5)
        : []

    return dashData && (
        <div className="m-5">

            {/* TOP CARDS */}
            <div className='flex flex-wrap gap-4'>

                <div className='flex items-center gap-3 bg-white p-5 min-w-60 rounded-2xl shadow hover:shadow-lg transition-all cursor-pointer'>
                    <img src={assets.doctor_icon} alt="" className="w-12" />
                    <div>
                        <p className="text-xl font-semibold">{dashData.doctors}</p>
                        <p className="text-gray-600">Doctors</p>
                    </div>
                </div>

                <div className='flex items-center gap-3 bg-white p-5 min-w-60 rounded-2xl shadow hover:shadow-lg transition-all cursor-pointer'>
                    <img src={assets.appointments_icon} alt="" className="w-12" />
                    <div>
                        <p className="text-xl font-semibold">{dashData.appointments}</p>
                        <p className="text-gray-600">Appointments</p>
                    </div>
                </div>

                <div className='flex items-center gap-3 bg-white p-5 min-w-60 rounded-2xl shadow hover:shadow-lg transition-all cursor-pointer'>
                    <img src={assets.patients_icon} alt="" className="w-12" />
                    <div>
                        <p className="text-xl font-semibold">{dashData.patients}</p>
                        <p className="text-gray-600">Patients</p>
                    </div>
                </div>

            </div>

            {/* LATEST APPOINTMENTS */}
            <div className="mt-10">
                <h3 className="text-xl font-bold mb-4">Latest Appointments</h3>

                {latestAppointments.length === 0 ? (
                    <p className="text-sm text-gray-600">No recent appointments</p>
                ) : (
                    <ul className="space-y-3">

                        {latestAppointments.map((appt) => (
                            <li key={appt._id}
                                className="p-4 bg-white rounded-2xl shadow flex items-center justify-between hover:shadow-md transition-all"
                            >

                                <div className="flex items-center gap-4">
                                    
                                    {/* USER IMAGE */}
                                    <img
                                        src={appt.userData?.image || assets.default_user}
                                        alt=""
                                        className="w-12 h-12 rounded-full object-cover border shadow-sm"
                                    />

                                    <div>
                                        <p className="font-semibold text-lg">
                                            {appt.userData?.name || "Unknown User"}
                                        </p>

                                        <p className="text-sm text-gray-600">
                                            {formatDate(appt.slotDate)} • {formatTime(appt.slotTime)}
                                        </p>
                                    </div>
                                </div>

                                {/* STATUS BADGE */}
                                <span className={
                                    appt.cancelled
                                        ? "px-4 py-1 rounded-full text-sm bg-red-100 text-red-600"
                                        : "px-4 py-1 rounded-full text-sm bg-green-100 text-green-700"
                                }>
                                    {appt.cancelled ? "Cancelled" : "Scheduled"}
                                </span>
                            </li>
                        ))}

                    </ul>
                )}
            </div>

        </div>
    )
}

export default Dashboard
