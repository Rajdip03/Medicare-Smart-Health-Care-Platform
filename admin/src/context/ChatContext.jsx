import React, { createContext, useState, useCallback } from 'react'
import { useContext } from 'react'
import { AdminContext } from './AdminContext'
import { DoctorContext } from './DoctorContext'

export const AdminChatContext = createContext()

// Admin chatbot responses
const adminChatResponses = {
  greeting: {
    keywords: ['hi', 'hello', 'hey', 'greetings'],
    response: 'Hello Admin! 👋 Welcome to Medicare Admin Panel. I can help you with doctor management, appointments, lab tests, wards, beds, and patients. What do you need?'
  },
  addDoctor: {
    keywords: ['add doctor', 'register doctor', 'new doctor', 'create doctor', 'add physician'],
    response: 'To add a new doctor:\n1. Go to "Add Doctor" in the sidebar\n2. Fill in doctor details:\n   - Name and email\n   - Create password\n   - Select speciality\n3. Upload a professional profile picture\n4. Add address and consultation fees\n5. Click Submit\n\nThe doctor receives login credentials and can setup their profile.'
  },
  appointments: {
    keywords: ['appointments', 'appointments list', 'all appointments', 'view appointments', 'manage appointments'],
    response: 'To manage appointments:\n1. Go to "All Appointments" in sidebar\n2. View all patient bookings across all doctors\n3. See appointment status (Confirmed/Completed/Cancelled)\n4. Check patient and doctor details\n5. Cancel appointments if needed\n6. Click on appointments for more details'
  },
  dashboard: {
    keywords: ['dashboard', 'stats', 'statistics', 'overview', 'analytics', 'performance'],
    response: 'Admin Dashboard shows:\n📊 Total registered doctors\n📅 Total appointments booked\n👥 Total unique patients\n📋 Latest 5 appointments list\n\nGet a quick overview of platform activity and performance!'
  },
  doctors: {
    keywords: ['doctors', 'doctor list', 'all doctors', 'manage doctors', 'doctors list', 'physician list'],
    response: 'Doctor List Management:\n1. Go to "Doctors List"\n2. View all registered doctors\n3. See their specialty and ratings\n4. Toggle availability status (Active/Inactive)\n5. Edit doctor information\n6. Delete doctor accounts if needed\n\nKeep track of all medical professionals!'
  },
  labTests: {
    keywords: ['lab test', 'lab tests', 'diagnostic', 'medical test', 'test management', 'lab'],
    response: 'Lab Tests Management:\n1. Go to "Lab Tests" section\n2. View all available tests\n3. Add new lab tests (name, description, price)\n4. Edit test details\n5. Delete tests if needed\n6. Monitor test bookings\n\nManage your diagnostic testing services!'
  },
  labOrders: {
    keywords: ['lab order', 'lab orders', 'lab booking', 'test order', 'test booking'],
    response: 'Lab Orders Management:\n1. Go to "Lab Orders"\n2. View all patient lab test orders\n3. See order status and scheduling\n4. Track patient health data\n5. Monitor order completion\n6. Generate reports\n\nKeep track of all diagnostic orders!'
  },
  wardManagement: {
    keywords: ['ward', 'ward management', 'wards', 'ward list', 'patient ward'],
    response: 'Ward Management:\n1. Go to "Wards" section\n2. Add new hospital wards\n3. View all wards and their details\n4. Edit ward information\n5. Manage ward capacity\n6. Track ward occupancy\n\nOrganize hospital ward resources!'
  },
  bedManagement: {
    keywords: ['bed', 'bed management', 'beds', 'bed list', 'patient bed', 'bed allocation'],
    response: 'Bed Management:\n1. Go to "Beds" section\n2. Add beds to specific wards\n3. View all beds and status\n4. Mark beds as occupied/available\n5. Track bed allocation\n6. Manage emergency beds\n\nEfficiently manage hospital bed resources!'
  },
  patients: {
    keywords: ['patient', 'patients', 'patient list', 'patient management', 'patient info'],
    response: 'Patient Management:\n1. Go to "Patients" section\n2. View all registered patients\n3. Check patient profiles and medical history\n4. See patient appointments\n5. Monitor patient activity\n6. Access patient health records\n\nManage all patient information!'
  },
  doctorProfile: {
    keywords: ['doctor profile', 'edit doctor', 'update doctor', 'doctor settings', 'doctor info'],
    response: 'Doctor Profile Management (Doctor side):\n1. Doctors visit their profile page\n2. Update personal information\n3. Upload/change profile picture\n4. Modify address and fees\n5. Update availability status\n6. Manage consultation hours\n\nDoctors can update their profiles anytime!'
  },
  cancellation: {
    keywords: ['cancel', 'cancellation', 'cancel appointment', 'refund'],
    response: 'To cancel an appointment:\n1. Go to "All Appointments"\n2. Find the appointment to cancel\n3. Click the Cancel button\n4. The doctor\'s time slot is released\n5. Patient can be notified\n6. Refund processed as per policy'
  },
  availability: {
    keywords: ['availability', 'available', 'available slot', 'doctor availability', 'open slot'],
    response: 'Manage Doctor Availability:\n1. Go to "Doctors List"\n2. Find the doctor to update\n3. Click to toggle availability (Active/Inactive)\n4. When active, doctor can receive bookings\n5. When inactive, existing appointments remain\n\nKeep doctors available for patient bookings!'
  },
  help: {
    keywords: ['help', 'support', 'issue', 'problem', 'not working', 'error', 'bug'],
    response: 'I\'m here to help Admin! Tell me about:\n- Doctor management issues?\n- Problems with appointments?\n- Lab test management?\n- Ward/bed issues?\n- Patient management?\n- Dashboard problems?\n- Login issues?\n\nDescribe your issue and I\'ll assist!'
  },
  thanks: {
    keywords: ['thank', 'thanks', 'thank you', 'appreciate', 'appreciate it'],
    response: 'You\'re welcome! 😊 Happy to assist. Is there anything else you need help with?'
  }
}

// Doctor chatbot responses
const doctorChatResponses = {
  greeting: {
    keywords: ['hi', 'hello', 'hey', 'greetings'],
    response: 'Hello Doctor! 👋 Welcome to your Medicare Dashboard. I can help you with appointments, prescriptions, video consultations, and profile management. How can I assist?'
  },
  appointments: {
    keywords: ['appointment', 'appointments', 'patient appointment', 'upcoming appointment', 'patient booking'],
    response: 'Manage Your Appointments:\n1. Go to "Appointments" section\n2. View all scheduled appointments\n3. See patient details and reasons\n4. Approve appointments to start video call\n5. Cancel appointments if needed\n6. Sort by date and status\n\nStay organized with patient consultations!'
  },
  prescription: {
    keywords: ['prescription', 'medicine', 'medication', 'prescribe', 'upload prescription', 'drug'],
    response: 'Upload Prescriptions:\n1. In Appointments section, click "Upload Prescription"\n2. Select the patient appointment\n3. Upload PDF prescription file\n4. Add medical notes (optional)\n5. Submit\n6. Patient receives prescription notification\n\nProvide medications to your patients securely!'
  },
  videoCall: {
    keywords: ['video call', 'video consultation', 'video meeting', 'online consultation', 'teleconsult', 'join call'],
    response: 'Video Consultations:\n1. When appointment time arrives, click "Start Video"\n2. You\'ll be taken to video room\n3. Allow camera/microphone access\n4. Consult with patient directly\n5. Share screen if needed\n6. End call when done\n7. Upload prescription after consultation\n\nProvide remote consultations conveniently!'
  },
  dashboard: {
    keywords: ['dashboard', 'stats', 'statistics', 'overview', 'my stats', 'performance'],
    response: 'Your Doctor Dashboard shows:\n👥 Total patients you\'ve seen\n📅 Total appointments completed\n📋 Recent 5 appointments list\n👤 Patient information\n\nQuick overview of your practice activity!'
  },
  patients: {
    keywords: ['patient', 'patients', 'patient list', 'my patients', 'patient info', 'patient details'],
    response: 'View Your Patients:\n1. Check Dashboard for patient list\n2. See recent appointments\n3. View patient contact information\n4. Check appointment history\n5. Track your patient base growth\n\nKeep track of all your patients!'
  },
  profile: {
    keywords: ['profile', 'my profile', 'edit profile', 'doctor profile', 'personal info', 'settings'],
    response: 'Update Your Profile:\n1. Click "Doctor Profile"\n2. Update personal information\n3. Upload/change profile picture\n4. Modify address\n5. Set consultation fees\n6. Update availability hours\n7. Save changes\n\nKeep your profile accurate and professional!'
  },
  approveAppointment: {
    keywords: ['approve', 'approve appointment', 'confirm appointment', 'accept appointment'],
    response: 'To Approve an Appointment:\n1. In Appointments section\n2. Find the pending appointment\n3. Click "Approve" button\n4. You\'ll be taken to video call room\n5. Start consultation with patient\n6. Upload prescription after call\n\nStart your consultation!'
  },
  cancelAppointment: {
    keywords: ['cancel', 'cancel appointment', 'reschedule', 'cancellation'],
    response: 'To Cancel an Appointment:\n1. In Appointments section\n2. Find the appointment\n3. Click "Cancel" button\n4. Confirm cancellation\n5. Patient is notified\n6. Slot becomes available for rebooking\n\nHandle appointment changes easily!'
  },
  availability: {
    keywords: ['availability', 'available', 'working hours', 'consultation hours', 'schedule'],
    response: 'Your Availability:\n1. Go to "Doctor Profile"\n2. Set your consultation hours\n3. Update availability status\n4. Patients book during your available times\n5. Update hours as needed\n\nManage when you\'re available for patients!'
  },
  help: {
    keywords: ['help', 'support', 'issue', 'problem', 'not working', 'error', 'bug'],
    response: 'I\'m here to help Doctor! Tell me about:\n- Problems with appointments?\n- Video call issues?\n- Prescription upload problems?\n- Profile update issues?\n- Patient management?\n- Technical difficulties?\n\nDescribe your issue and I\'ll assist!'
  },
  thanks: {
    keywords: ['thank', 'thanks', 'thank you', 'appreciate'],
    response: 'You\'re welcome! 😊 Great to help. Is there anything else I can assist with?'
  }
}

export const AdminChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! 👋 I\'m your Medicare Assistant.\n\nI can help with:\n• 🩺 Doctor Management\n• 📅 Appointments\n• 🧪 Lab Tests\n• 🏥 Wards & Beds\n• 👥 Patient Management\n• 📊 Dashboard Stats\n\nWhat do you need?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])

  const generateBotResponse = useCallback((userMessage, isDoctor = false) => {
    const messageLower = userMessage.toLowerCase()
    const responses = isDoctor ? doctorChatResponses : adminChatResponses

    for (const [key, value] of Object.entries(responses)) {
      for (const keyword of value.keywords) {
        if (messageLower.includes(keyword)) {
          return value.response
        }
      }
    }

    if (isDoctor) {
      return 'I\'m not sure about that. Try asking about:\n- Your appointments\n- Uploading prescriptions\n- Video consultations\n- Your dashboard\n- Your patient list\n- Profile management\n\nWhat can I help with?'
    } else {
      return 'I\'m not sure about that. Try asking about:\n- Adding doctors\n- Managing appointments\n- Lab tests\n- Wards & beds\n- Patients\n- Dashboard stats\n\nWhat can I help with?'
    }
  }, [])

  const addMessage = useCallback((text, sender = 'user', isDoctor = false) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])

    if (sender === 'user') {
      setTimeout(() => {
        const botResponse = generateBotResponse(text, isDoctor)
        const botMessage = {
          id: Date.now() + 1,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      }, 500)
    }
  }, [generateBotResponse])

  const clearChat = useCallback((isDoctor = false) => {
    setMessages([
      {
        id: 1,
        text: isDoctor 
          ? 'Hello! 👋 I\'m your Medicare Assistant.\n\nI can help with:\n• 📅 Appointments\n• 💊 Prescriptions\n• 🎥 Video Calls\n• 👤 Your Profile\n• 👥 Your Patients\n• 📊 Dashboard\n\nWhat do you need?' 
          : 'Hello! 👋 I\'m your Medicare Assistant.\n\nI can help with:\n• 🩺 Doctor Management\n• 📅 Appointments\n• 🧪 Lab Tests\n• 🏥 Wards & Beds\n• 👥 Patient Management\n• 📊 Dashboard Stats\n\nWhat do you need?',
        sender: 'bot',
        timestamp: new Date()
      }
    ])
  }, [])

  return (
    <AdminChatContext.Provider value={{
      isOpen,
      setIsOpen,
      messages,
      addMessage,
      clearChat
    }}>
      {children}
    </AdminChatContext.Provider>
  )
}
