import { createContext } from "react";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { toast } from 'react-toastify';

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const currencySymbol = "₹";
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const [doctors, setDoctors] = useState([]);
    const [token, _setToken] = useState(() => {
        const raw = localStorage.getItem('token')
        if (!raw || raw === 'false') return false
        return raw
    })

    // centralize token setter so localStorage stays in sync and 'false' string isn't treated as truthy
    const setToken = (val) => {
        if (val) {
            localStorage.setItem('token', val)
            _setToken(val)
        } else {
            localStorage.removeItem('token')
            _setToken(false)
        }
    }

    const [userData, setUserData] = useState(false);

    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendURL + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const loadUserProfileData = useCallback(async () => {
        try {
            const { data } = await axios.get(
                backendURL + '/api/user/get-profile',
                { headers: { token } }
            );

            if (data.success) {
                setUserData(data.userData);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }, [backendURL, token]);

    const toggleFavorite = async (docId) => {
        try {
            const { data } = await axios.post(
                backendURL + '/api/user/favorite',
                { docId },
                { headers: { token } }
            )
            if (data.success) {
                // refresh profile to get new favorites
                await loadUserProfileData()
                toast.success(data.message)
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

    const getFavorites = async () => {
        try {
            const { data } = await axios.get(backendURL + '/api/user/favorites', { headers: { token } })
            if (data.success) return data.favorites
            toast.error(data.message)
            return []
        } catch (error) {
            toast.error(error.message)
            return []
        }
    }

    const addReview = async (docId, rating, comment) => {
        try {
            const { data } = await axios.post(
                backendURL + '/api/doctor/add-review',
                { docId, rating, comment },
                { headers: { token } }
            )
            if (data.success) {
                toast.success(data.message)
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

    const getDoctorReviews = async (docId) => {
        try {
            const { data } = await axios.get(backendURL + `/api/doctor/reviews/${docId}`)
            if (data.success) {
                return { reviews: data.reviews, avgRating: data.avgRating, ratingCount: data.ratingCount }
            } else {
                toast.error(data.message)
                return { reviews: [], avgRating: 0, ratingCount: 0 }
            }
        } catch (error) {
            toast.error(error.message)
            return { reviews: [], avgRating: 0, ratingCount: 0 }
        }
    }

    const searchDoctors = async (opts = {}) => {
        try {
            const { data } = await axios.get(backendURL + '/api/doctor/search', { params: opts })
            if (data.success) return data
            toast.error(data.message)
            return { doctors: [], total: 0 }
        } catch (error) {
            toast.error(error.message)
            return { doctors: [], total: 0 }
        }
    }

    // Lab tests API
    const getLabTests = async () => {
        try {
            const { data } = await axios.get(backendURL + '/api/lab/list')
            if (data.success) return data.tests
            toast.error(data.message)
            return []
        } catch (error) {
            toast.error(error.message)
            return []
        }
    }

    const getLabTest = async (id) => {
        try {
            const { data } = await axios.get(backendURL + `/api/lab/${id}`)
            if (data.success) return data.test
            toast.error(data.message)
            return null 
        } catch (error) {
            toast.error(error.message)
            return null
        }
    }

    const bookLabTest = async ({ labTestId, scheduleDate, patientName, patientPhone, notes }) => {
        try {
            const { data } = await axios.post(backendURL + '/api/lab/book', { labTestId, scheduleDate, patientName, patientPhone, notes }, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
                return { success: true, order: data.order }
            }
            toast.error(data.message)
            return { success: false }
        } catch (error) {
            toast.error(error.message)
            return { success: false }
        }
    }

    const getUserLabOrders = async () => {
        try {
            const { data } = await axios.get(backendURL + '/api/lab/my-orders', { headers: { token } })
            if (data.success) return data.orders
            toast.error(data.message)
            return []
        } catch (error) {
            toast.error(error.message)
            return []
        }
    }

    const cancelLabOrder = async (orderId) => {
        try {
            const { data } = await axios.post(backendURL + '/api/lab/cancel', { orderId }, { headers: { token } })
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

    const value = {
        doctors,
        getDoctorsData,
        currencySymbol,
        token,
        setToken,
        backendURL,
        userData,
        setUserData,
        loadUserProfileData,
        toggleFavorite,
        getFavorites,
        addReview,
        getDoctorReviews,
        searchDoctors,
        getLabTests,
        getLabTest,
        bookLabTest,
        getUserLabOrders,
        cancelLabOrder
    }

    useEffect(() => {
        getDoctorsData();
    }, [])


    useEffect(() => {
        if (token) {
            loadUserProfileData();
        } else {
            setUserData(false);
        }
    }, [token, loadUserProfileData]);


    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider