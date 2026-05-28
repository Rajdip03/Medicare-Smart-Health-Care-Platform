import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"


export const AdminContext = createContext();

const AdminContextProvider = (props) => {

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '');

    const [doctors, setDoctors] = useState([])
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)    

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const getAllDoctors = async () => {

        try {

            const { data } = await axios.post(backendUrl + '/api/admin/all-doctors', {}, { headers: { aToken } })
            if (data?.success) {
                setDoctors(data.doctors)
                console.log(data.doctors)
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const changeAvailability = async (docId) => {

        try {

            const { data } = await axios.post(
                backendUrl + '/api/admin/change-availability',
                { docId }, { headers: { aToken } }
            )

            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }

    const updateDoctor = async (formData) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/update-doctor',
                formData,
                { headers: { aToken, 'Content-Type': 'multipart/form-data' } }
            )
            if (data.success) {
                toast.success(data.message)
                await getAllDoctors()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    const deleteDoctor = async (docId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/delete-doctor',
                { docId }, { headers: { aToken } }
            )

            if (data.success) {
                toast.success(data.message)
                await getAllDoctors()
                return true
            } else {
                toast.error(data.message)
                return false
            }

        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    const getAllAppointments = async () => {

        try {

            const { data } = await axios.get(
                backendUrl + '/api/admin/appointments',
                { headers: { aToken } }
            );

            if (data.success) {
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.message);
        }

    }

    // Lab admin methods
    const getLabTestsAdmin = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/lab/list-all', { headers: { aToken } })
            if (data.success) return data.tests
            toast.error(data.message)
            return []
        } catch (error) {
            toast.error(error.message)
            return []
        }
    }

    const addLabTestAdmin = async (formData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/lab/add', formData, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                return true
            }
            toast.error(data.message)
            return false
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    const updateLabTestAdmin = async (id, update) => {
        try {
            const { data } = await axios.put(backendUrl + `/api/lab/update/${id}`, update, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                return true
            }
            toast.error(data.message)
            return false
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    const deleteLabTestAdmin = async (id) => {
        try {
            const { data } = await axios.delete(backendUrl + `/api/lab/delete/${id}`, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                return true
            }
            toast.error(data.message)
            return false
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    const getAllLabOrdersAdmin = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/lab/orders/all', { headers: { aToken } })
            if (data.success) return data.orders
            toast.error(data.message)
            return []
        } catch (error) {
            toast.error(error.message)
            return []
        }
    }

    const updateLabOrderStatusAdmin = async (id, status) => {
        try {
            const { data } = await axios.put(backendUrl + `/api/lab/orders/status/${id}`, { status }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                return true
            }
            toast.error(data.message)
            return false
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    const cancelAppointmentAdmin = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/cancel-appointment',
                { appointmentId },
                { headers: { aToken } }
            );

            if (data.success) {
                toast.success(data.message);
                await getAllAppointments();
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.message);
        }
    }

    const getDashData = async () => {
    try {

        const { data } = await axios.get(
            backendUrl + '/api/admin/dashboard',
            { headers: { aToken } }
        )

        if (data.success) {
            setDashData(data.dashData)
        } else {
            toast.error(data.message)
        }

    } catch (error) {
        toast.error(error.message)
    }
}

// Ward & Bed APIs
const getWards = async () => {
    try {
        const { data } = await axios.get(backendUrl + '/api/admin/wards', { headers: { aToken } })
        if (data.success) return data.wards
        toast.error(data.message)
        return []
    } catch (error) {
        toast.error(error.message)
        return []
    }
}

const createWardAdmin = async (ward) => {
    try {
        const { data } = await axios.post(backendUrl + '/api/admin/wards', ward, { headers: { aToken } })
        if (data.success) {
            toast.success('Ward created')
            return data.ward
        }
        toast.error(data.message)
        return null
    } catch (error) {
        toast.error(error.message)
        return null
    }
}

const updateWardAdmin = async (id, update) => {
    try {
        const { data } = await axios.put(backendUrl + `/api/admin/wards/${id}`, update, { headers: { aToken } })
        if (data.success) {
            toast.success('Ward updated')
            return data.ward
        }
        toast.error(data.message)
        return null
    } catch (error) {
        toast.error(error.message)
        return null
    }
}

const deleteWardAdmin = async (id) => {
    try {
        const { data } = await axios.delete(backendUrl + `/api/admin/wards/${id}`, { headers: { aToken } })
        if (data.success) {
            toast.success('Ward deleted')
            return true
        }
        toast.error(data.message)
        return false
    } catch (error) {
        toast.error(error.message)
        return false
    }
}

const getBedsAdmin = async (opts = {}) => {
    try {
        const { data } = await axios.get(backendUrl + '/api/admin/beds', { params: opts, headers: { aToken } })
        if (data.success) return data.beds
        toast.error(data.message)
        return []
    } catch (error) {
        toast.error(error.message)
        return []
    }
}

const createBedAdmin = async (bed) => {
    try {
        const { data } = await axios.post(backendUrl + '/api/admin/beds', bed, { headers: { aToken } })
        if (data.success) {
            toast.success('Bed created')
            return data.bed
        }
        toast.error(data.message)
        return null
    } catch (error) {
        toast.error(error.message)
        return null
    }
}

const updateBedAdmin = async (id, update) => {
    try {
        const { data } = await axios.put(backendUrl + `/api/admin/beds/${id}`, update, { headers: { aToken } })
        if (data.success) {
            toast.success('Bed updated')
            return data.bed
        }
        toast.error(data.message)
        return null
    } catch (error) {
        toast.error(error.message)
        return null
    }
}

const deleteBedAdmin = async (id) => {
    try {
        const { data } = await axios.delete(backendUrl + `/api/admin/beds/${id}`, { headers: { aToken } })
        if (data.success) {
            toast.success('Bed deleted')
            return true
        }
        toast.error(data.message)
        return false
    } catch (error) {
        toast.error(error.message)
        return false
    }
}

const assignBedAdmin = async (id, payload) => {
    try {
        const { data } = await axios.patch(backendUrl + `/api/admin/beds/${id}/assign`, payload, { headers: { aToken } })
        if (data.success) {
            toast.success('Bed assigned')
            return data.bed
        }
        toast.error(data.message)
        return null
    } catch (error) {
        toast.error(error.message)
        return null
    }
}

const getUsersAdmin = async (search='') => {
    try {
        const { data } = await axios.get(backendUrl + `/api/admin/users`, { params: { search }, headers: { aToken } })
        if (data.success) return data.users
        toast.error(data.message)
        return []
    } catch (error) {
        toast.error(error.message)
        return []
    }
}

const createUserAdmin = async ({ name, email, phone }) => {
    try {
        const { data } = await axios.post(backendUrl + `/api/admin/users`, { name, email, phone }, { headers: { aToken } })
        if (data.success) {
            toast.success('Patient created')
            return data
        }
        toast.error(data.message)
        return null
    } catch (error) {
        toast.error(error.message)
        return null
    }
}

const unassignBedAdmin = async (id) => {
    try {
        const { data } = await axios.patch(backendUrl + `/api/admin/beds/${id}/unassign`, {}, { headers: { aToken } })
        if (data.success) {
            toast.success('Bed unassigned')
            return data.bed
        }
        toast.error(data.message)
        return null
    } catch (error) {
        toast.error(error.message)
        return null
    }
}

const getWardAvailability = async (id) => {
    try {
        const { data } = await axios.get(backendUrl + `/api/admin/wards/${id}/availability`, { headers: { aToken } })
        if (data.success) return data
        toast.error(data.message)
        return null
    } catch (error) {
        toast.error(error.message)
        return null
    }
}

    const value = {
        aToken,
        setAToken,
        backendUrl, doctors,
        getAllDoctors, changeAvailability, updateDoctor, deleteDoctor,
        appointments,setAppointments,getAllAppointments,
        cancelAppointmentAdmin,
        dashData,
        getDashData,
        // lab admin
        getLabTestsAdmin,
        addLabTestAdmin,
        updateLabTestAdmin,
        deleteLabTestAdmin,
        getAllLabOrdersAdmin,
        updateLabOrderStatusAdmin,
        // wards & beds
        getWards, createWardAdmin, updateWardAdmin, deleteWardAdmin,
        getBedsAdmin, createBedAdmin, updateBedAdmin, deleteBedAdmin, assignBedAdmin, unassignBedAdmin, getWardAvailability, getUsersAdmin, createUserAdmin
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;
