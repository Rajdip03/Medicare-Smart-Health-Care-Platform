import React, { createContext, useState, useCallback } from 'react'

export const ChatContext = createContext()

// Chatbot responses based on keywords
const chatbotResponses = {
  greeting: {
    keywords: ['hi', 'hello', 'hey', 'greetings'],
    response: 'Hello! 👋 Welcome to Medicare. I can help you find doctors, book appointments, book lab tests, manage prescriptions, or answer questions about our services. What can I help you with?'
  },
  findDoctor: {
    keywords: ['find doctor', 'suggest doctor', 'which doctor', 'what doctor', 'doctor for', 'specialist for', 'need a doctor'],
    response: 'Great! You can find doctors by:\n1. Click "DOCTORS" to browse all doctors by specialty\n2. Use "SUGGEST DOCTOR" to describe your symptoms and get specialist recommendations\n3. Filter by specialization and rating\n4. View doctor details and patient reviews\n\nWhat symptoms are you experiencing?'
  },
  appointment: {
    keywords: ['book appointment', 'appointment', 'schedule', 'booking', 'reserve slot', 'consultation time'],
    response: 'To book an appointment:\n1. Find a doctor you like (check their specialty and ratings)\n2. Click "Book Appointment"\n3. Select your preferred date and time slot\n4. Confirm the booking\n5. Payment will be processed\n\nView all your appointments in "My Appointments" section.'
  },
  labTests: {
    keywords: ['lab test', 'blood test', 'lab order', 'test result', 'check-up', 'medical test', 'diagnostic'],
    response: 'We offer various lab tests! Visit "LAB TESTS" to:\n1. Browse all available tests\n2. See test prices and descriptions\n3. Schedule a convenient date and time\n4. Provide patient details and notes\n5. Track your lab orders\n\nCommon tests: Blood tests, Thyroid tests, Diabetes screening, and more. What test are you interested in?'
  },
  prescription: {
    keywords: ['prescription', 'medicine', 'medication', 'prescribe', 'drug', 'pharmaceutical'],
    response: 'You can manage your prescriptions through Medicare:\n1. View prescriptions from your doctor appointments\n2. Download or print your prescriptions\n3. Share prescriptions with pharmacies\n4. Track medication history\n\nVisit your profile to see all your prescriptions and medical records.'
  },
  payment: {
    keywords: ['pay', 'payment', 'online payment', 'fees', 'cost', 'price', 'razorpay', 'card', 'wallet'],
    response: 'We accept online payments via Razorpay:\n✓ Credit/Debit Cards (Visa, Mastercard, etc.)\n✓ Digital Wallets (Google Pay, Apple Pay, etc.)\n✓ UPI\n✓ Net Banking\n\nPayment is secure and charged only after confirmation.'
  },
  profile: {
    keywords: ['profile', 'account', 'edit profile', 'my profile', 'update information', 'personal details'],
    response: 'Manage your profile by:\n1. Click your profile picture (top right)\n2. Select "My Profile"\n3. Update personal information\n4. Upload profile picture\n5. View health records and medical history\n\nKeep your information updated for better medical recommendations!'
  },
  symptoms: {
    keywords: ['headache', 'fever', 'cough', 'pain', 'symptom', 'disease', 'sick', 'ill', 'rash', 'stomach', 'allergy', 'cold', 'flu'],
    response: 'For your symptoms, I recommend:\n1. Visit "SUGGEST DOCTOR" and describe your condition\n2. We\'ll suggest the right specialist\n3. Start with a General Physician or relevant specialist\n4. Book a consultation appointment\n\nDescribe your symptoms: What\'s bothering you?'
  },
  cancellation: {
    keywords: ['cancel', 'cancellation', 'cancel appointment', 'cancel lab', 'reschedule'],
    response: 'To cancel an appointment or lab test:\n1. Go to "My Appointments" or lab orders section\n2. Select the appointment/test to cancel\n3. Click the Cancel button\n4. Confirm cancellation\n5. Refund will be processed as per policy\n\nNote: Cancellations may have terms and conditions.'
  },
  videoCall: {
    keywords: ['video call', 'video consultation', 'online consultation', 'teleconsult', 'remote'],
    response: 'Video consultations:\n1. After booking an appointment, check if video option is available\n2. Click "Join Video Call" at consultation time\n3. Allow camera and microphone access\n4. Connect directly with your doctor\n\nVideo consultations offer privacy and convenience from home!'
  },
  availability: {
    keywords: ['available', 'slot', 'time', 'schedule', 'appointment time', 'availability'],
    response: 'To find available slots:\n1. Select a doctor\n2. Choose your preferred date\n3. Available time slots will appear\n4. Most doctors are available Monday-Friday, 9 AM to 9 PM\n5. Some doctors have weekend availability\n\nCheck the calendar for your preferred timing!'
  },
  help: {
    keywords: ['help', 'support', 'issue', 'problem', 'error', 'not working', 'bug', 'contact'],
    response: 'I\'m here to help! Tell me about your issue:\n- Trouble finding doctors?\n- Can\'t book appointments?\n- Lab test problems?\n- Payment issues?\n- Profile not updating?\n- Technical errors?\n\nDescribe your problem and I\'ll assist!'
  },
  thanks: {
    keywords: ['thank', 'thanks', 'thank you', 'appreciate', 'thanks a lot'],
    response: 'You\'re welcome! 😊 Happy to help. Is there anything else I can assist you with?'
  },
  hours: {
    keywords: ['hours', 'timing', 'open', 'close', 'working hours', 'consultation hours', 'when available'],
    response: 'Doctor availability varies by professional schedule:\n• Most doctors: Monday-Friday, 9 AM - 9 PM\n• Some doctors: Weekend availability too\n• Check each doctor\'s profile for exact hours\n• Book appointments for your preferred time slot\n\nWhen would you like to consult?'
  }
}

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! 👋 Welcome to Medicare Assistant.\n\nI can help you with:\n• 🩺 Finding & booking doctors\n• 📅 Managing appointments\n• 🧪 Booking lab tests\n• 💊 Prescription management\n• 🎥 Video consultations\n• 💳 Payment options\n\nWhat can I help you with today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])

  const generateBotResponse = useCallback((userMessage) => {
    const messageLower = userMessage.toLowerCase()

    // Check each response category for matching keywords
    for (const [key, value] of Object.entries(chatbotResponses)) {
      for (const keyword of value.keywords) {
        if (messageLower.includes(keyword)) {
          return value.response
        }
      }
    }

    // Default response if no match found
    return 'I\'m not sure about that. Try asking me about:\n• Finding doctors by specialty\n• Booking appointments\n• Scheduling lab tests\n• Prescription management\n• Payment options\n• Your profile\n• Cancellations\n\nOr describe your symptoms and I\'ll suggest the right specialist!'
  }, [])

  const addMessage = useCallback((text, sender = 'user') => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])

    // Auto-respond if user sent message
    if (sender === 'user') {
      setTimeout(() => {
        const botResponse = generateBotResponse(text)
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

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 1,
        text: 'Hello! 👋 Welcome to Medicare Assistant.\n\nI can help you with:\n• 🩺 Finding & booking doctors\n• 📅 Managing appointments\n• 🧪 Booking lab tests\n• 💊 Prescription management\n• 🎥 Video consultations\n• 💳 Payment options\n\nWhat can I help you with today?',
        sender: 'bot',
        timestamp: new Date()
      }
    ])
  }, [])

  return (
    <ChatContext.Provider value={{
      isOpen,
      setIsOpen,
      messages,
      addMessage,
      clearChat
    }}>
      {children}
    </ChatContext.Provider>
  )
}
