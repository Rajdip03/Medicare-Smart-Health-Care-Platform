import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AdminContext } from './context/AdminContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ChatBot from './components/ChatBot'
import BottomNav from './components/BottomNav'
import { Route, Routes  } from 'react-router-dom'
import Dashboard from './pages/Admin/Dashboard'
import AllApointments from './pages/Admin/AllApointments'
import AddDoctor from './pages/Admin/AddDoctor'
import DoctorsList from './pages/Admin/DoctorsList'
import LabTestsAdmin from './pages/Admin/LabTestsAdmin'
import LabOrdersAdmin from './pages/Admin/LabOrdersAdmin'
import WardManagement from './pages/Admin/WardManagement'
import BedManagement from './pages/Admin/BedManagement'
import Patients from './pages/Admin/Patients'
import { DoctorContext } from './context/DoctorContext.jsx'
import { AdminChatProvider } from './context/ChatContext'
import DoctorDashboard from './pages/Doctor/DoctorDashboard.jsx'
import DoctorAppointments from './pages/Doctor/DoctorAppointments.jsx'
import DoctorProfile from './pages/Doctor/DoctorProfile.jsx'
import VideoCall from './pages/Doctor/VideoCall.jsx'

const App = () => {

  const { aToken } = useContext(AdminContext)
  const {dToken}= useContext(DoctorContext) 

  const [showSidebar, setShowSidebar] = React.useState(false)

  return aToken || dToken ? (
    <AdminChatProvider>
      <div className='bg-[F8F9FD] min-h-screen'>
        <ToastContainer />
        <Navbar toggleSidebar={() => setShowSidebar(prev => !prev)} />

        {/* mobile overlay (click to close) */}
        {showSidebar && (
          <div onClick={() => setShowSidebar(false)} className='fixed inset-0 bg-black/40 z-40 md:hidden' />
        )}

        <div className='flex items-start'>
          <Sidebar show={showSidebar} onNavigate={() => setShowSidebar(false)} />

          <div className='flex-1 min-h-screen'>
            <Routes>
              {/* Admin Routes */}
              <Route path='/' element={<></>} />
              <Route path='/admin-dashboard' element={<Dashboard/>} />
              <Route path='/all-appointments' element={<AllApointments/>} />
              <Route path='/add-doctor' element={<AddDoctor/>} />
              <Route path='/doctor-list' element={<DoctorsList/>} />
              <Route path='/lab-tests' element={<LabTestsAdmin/>} />
              <Route path='/lab-orders' element={<LabOrdersAdmin/>} />
              <Route path='/wards' element={<WardManagement/>} />
              <Route path='/beds' element={<BedManagement/>} />
              <Route path='/patients' element={<Patients/>} />

              {/* Doctors Routes */}
               <Route path='/doctor-dashboard' element={<DoctorDashboard/>} />
               <Route path='/doctor-appointments' element={<DoctorAppointments/>} />
               <Route path='/doctor-profile' element={<DoctorProfile/>} />
               <Route path='/video/:meetingRoomId' element={<VideoCall/>} />

            </Routes>
          </div>
        </div>
        <ChatBot/>
        <BottomNav/>
      </div>
    </AdminChatProvider>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  )
}

export default App
