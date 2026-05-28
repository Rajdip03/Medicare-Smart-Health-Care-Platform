import React, { useContext, useState, useRef, useEffect } from 'react'
import { AdminChatContext } from '../context/ChatContext'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'

const ChatBot = () => {
  const { isOpen, setIsOpen, messages, addMessage, clearChat } = useContext(AdminChatContext)
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)

  // Detect if doctor or admin is logged in
  const isDoctor = dToken && !aToken
  const isAdmin = aToken && !dToken

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])
   
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      addMessage(inputValue, 'user', isDoctor)
      setInputValue('')
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-40 w-14 h-14 flex items-center justify-center ${
          isDoctor ? 'bg-green-600' : 'bg-indigo-600'
        }`}
        title={`Chat with ${isDoctor ? 'Doctor' : 'Admin'} Assistant`}
      >
        {isOpen ? (
          <span className='text-xl'>✕</span>
        ) : (
          <span className='text-xl'>💬</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className='fixed bottom-24 right-6 w-96 max-w-[calc(100vw-24px)] bg-white rounded-lg shadow-2xl z-40 flex flex-col max-h-96'>
          {/* Header */}
          <div className={`text-white p-4 rounded-t-lg flex items-center justify-between ${
            isDoctor ? 'bg-green-600' : 'bg-indigo-600'
          }`}>
            <div className='flex items-center gap-2'>
              <span className='text-xl'>{isDoctor ? '⚕️' : '⚙️'}</span>
              <h3 className='font-semibold'>{isDoctor ? 'Doctor Assistant' : 'Admin Assistant'}</h3>
            </div>
            <button
              onClick={() => clearChat(isDoctor)}
              className='text-sm hover:opacity-80 transition-opacity'
              title='Clear chat'
            >
              🔄
            </button>
          </div>

          {/* Messages Container */}
          <div className='flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3'>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg break-words ${
                    msg.sender === 'user'
                      ? `text-white rounded-br-none ${isDoctor ? 'bg-green-600' : 'bg-indigo-600'}`
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className='whitespace-pre-wrap text-sm'>{msg.text}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      msg.sender === 'user' 
                        ? isDoctor ? 'text-green-100' : 'text-indigo-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className='border-t border-gray-200 p-3 bg-white rounded-b-lg flex gap-2'
          >
            <input
              type='text'
              placeholder='Ask me anything...'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm ${
                isDoctor ? 'focus:ring-green-600' : 'focus:ring-indigo-600'
              }`}
            />
            <button
              type='submit'
              className={`text-white px-4 py-2 rounded-lg transition-colors ${
                isDoctor ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Send
            </button>
          </form>

          {/* Quick Suggestions */}
          <div className='border-t border-gray-200 px-4 py-2 bg-white text-xs text-gray-600 hidden md:block rounded-b-lg'>
            <p className='mb-2 font-medium'>Quick suggestions:</p>
            <div className='flex flex-wrap gap-2'>
              {isDoctor ? (
                // Doctor suggestions
                <>
                  <button
                    onClick={() => addMessage('Show my appointments', 'user', true)}
                    className='bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs transition-colors'
                    title='View appointments'
                  >
                    📅 Appointments
                  </button>
                  <button
                    onClick={() => addMessage('How to upload prescription?', 'user', true)}
                    className='bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-2 py-1 rounded text-xs transition-colors'
                    title='Upload prescription'
                  >
                    💊 Prescriptions
                  </button>
                  <button
                    onClick={() => addMessage('Tell me about video consultations', 'user', true)}
                    className='bg-teal-100 hover:bg-teal-200 text-teal-700 px-2 py-1 rounded text-xs transition-colors'
                    title='Video consultations'
                  >
                    🎥 Video Call
                  </button>
                  <button
                    onClick={() => addMessage('How do I update my profile?', 'user', true)}
                    className='bg-cyan-100 hover:bg-cyan-200 text-cyan-700 px-2 py-1 rounded text-xs transition-colors'
                    title='Profile management'
                  >
                    👤 My Profile
                  </button>
                  <button
                    onClick={() => addMessage('Show my patients', 'user', true)}
                    className='bg-sky-100 hover:bg-sky-200 text-sky-700 px-2 py-1 rounded text-xs transition-colors'
                    title='Patient list'
                  >
                    👥 My Patients
                  </button>
                </>
              ) : (
                // Admin suggestions
                <>
                  <button
                    onClick={() => addMessage('How to add a doctor?', 'user', false)}
                    className='bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded text-xs transition-colors'
                    title='Add doctor'
                  >
                    🩺 Add Doctor
                  </button>
                  <button
                    onClick={() => addMessage('Show all appointments', 'user', false)}
                    className='bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded text-xs transition-colors'
                    title='View appointments'
                  >
                    📅 Appointments
                  </button>
                  <button
                    onClick={() => addMessage('Show doctors list', 'user', false)}
                    className='bg-pink-100 hover:bg-pink-200 text-pink-700 px-2 py-1 rounded text-xs transition-colors'
                    title='Doctor list'
                  >
                    🏥 Doctors
                  </button>
                  <button
                    onClick={() => addMessage('Tell me about lab tests', 'user', false)}
                    className='bg-rose-100 hover:bg-rose-200 text-rose-700 px-2 py-1 rounded text-xs transition-colors'
                    title='Lab tests'
                  >
                    🧪 Lab Tests
                  </button>
                  <button
                    onClick={() => addMessage('Ward and bed management', 'user', false)}
                    className='bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs transition-colors'
                    title='Ward/bed management'
                  >
                    🏨 Wards & Beds
                  </button>
                  <button
                    onClick={() => addMessage('Patient management', 'user', false)}
                    className='bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded text-xs transition-colors'
                    title='Patient management'
                  >
                    👥 Patients
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatBot
