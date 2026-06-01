
import{Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import SuggestDoctor from './pages/SuggestDoctor'
import VerifyEmail from './pages/VerifyEmail'
import LabTests from './pages/LabTests'
import VideoCall from './pages/VideoCall'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ChatBot from './components/ChatBot'
import { ChatProvider } from './context/ChatContext'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const App = () => {
  return (
    <ChatProvider>
      <div className='mx-4 sm:mx-[10%]'>
        <ToastContainer/>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/doctors' element={<Doctors/>}/>
          <Route path='/doctors/:speciality' element={<Doctors/>}/>
          <Route path='/suggest-doctor' element={<SuggestDoctor/>}/>
          <Route path='/verify-email' element={<VerifyEmail/>}/>
          <Route path='/lab-tests' element={<LabTests/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/about' element={<About/>}/>
          <Route path='/contact' element={<Contact/>}/>
          <Route path='/my-profile' element={<MyProfile/>}/>
          <Route path='/my-appointments' element={<MyAppointments/>}/>
          <Route path='/appointments/:docId' element={<Appointment/>}/>
          <Route path='/video/:meetingRoomId' element={<VideoCall/>}/>

         </Routes>
         <Footer/>
         <ChatBot/>
      </div>
    </ChatProvider>
  )
}

export default App