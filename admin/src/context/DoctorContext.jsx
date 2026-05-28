import { createContext } from "react";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '')
    const [appointments, setAppointments] = useState([])
    const [doctorData, setDoctorData] = useState(false)
    const [doctorDashData, setDoctorDashData] = useState(false)

    const logout = () => {
        setDToken('')
        localStorage.removeItem('dToken')
    }

    const getDoctorAppointments = async () => {
        try {
            const { data } = await axios.get(
                backendUrl + '/api/doctor/appointments',
                { headers: { dtoken: dToken } }
            )
            if (data.success) {
                setAppointments(data.appointments)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const cancelAppointmentDoctor = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/cancel-appointment',
                { appointmentId },
                { headers: { dtoken: dToken } }
            )
            if (data.success) {
                toast.success(data.message)
                await getDoctorAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const approveAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/approve-appointment',
                { appointmentId },
                { headers: { dtoken: dToken } }
            )
            if (data.success) {
                toast.success('Appointment approved for video consultation')
                await getDoctorAppointments()
                return data.appointment
            }
            toast.error(data.message)
            return null
        } catch (error) {
            toast.error(error.message)
            return null
        }
    }

    const getDoctorProfile = async () => {
        try {
            const { data } = await axios.get(
                backendUrl + '/api/doctor/get-profile',
                { headers: { dtoken: dToken } }
            )
            if (data.success) {
                setDoctorData(data.docData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const updateDoctorProfile = async (formData) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/update-profile',
                formData,
                { headers: { dtoken: dToken, 'Content-Type': 'multipart/form-data' } }
            )
            if (data.success) {
                toast.success(data.message)
                await getDoctorProfile()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getDoctorDashData = async () => {
        try {
            const { data } = await axios.get(
                backendUrl + '/api/doctor/dashboard',
                { headers: { dtoken: dToken } }
            )
            if (data.success) {
                setDoctorDashData(data.dashData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const value = {
        dToken, setDToken,
        backendUrl,
        logout,
        appointments,
        getDoctorAppointments,
        cancelAppointmentDoctor,
        approveAppointment,
        doctorData,
        getDoctorProfile,
        updateDoctorProfile,
        doctorDashData,
        getDoctorDashData
    }

return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider;
