import React, { useContext, useState, useRef, useEffect } from 'react'
import { ChatContext } from '../context/ChatContext'
import { assets } from '../assets/assets'

const ChatBot = () => {
  const { isOpen, setIsOpen, messages, addMessage, clearChat } = useContext(ChatContext)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      addMessage(inputValue, 'user')
      setInputValue('')
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-40 w-14 h-14 flex items-center justify-center'
        title='Chat with Medicare Assistant'
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
          <div className='bg-primary text-white p-4 rounded-t-lg flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-xl'>🏥</span>
              <h3 className='font-semibold'>Medicare Assistant</h3>
            </div>
            <button
              onClick={clearChat}
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
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className='whitespace-pre-wrap text-sm'>{msg.text}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
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
              className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm'
            />
            <button
              type='submit'
              className='bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Send
            </button>
          </form>

          {/* Quick Suggestions */}
          <div className='border-t border-gray-200 px-4 py-2 bg-white text-xs text-gray-600 rounded-b-lg hidden md:block'>
            <p className='mb-2 font-medium'>Quick suggestions:</p>
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => addMessage('Find me a doctor')}
                className='bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs transition-colors'
                title='Find a doctor'
              >
                🩺 Find Doctor
              </button>
              <button
                onClick={() => addMessage('How to book appointment?')}
                className='bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs transition-colors'
                title='Book an appointment'
              >
                📅 Book Appointment
              </button>
              <button
                onClick={() => addMessage('Tell me about lab tests')}
                className='bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded text-xs transition-colors'
                title='Lab test information'
              >
                🧪 Lab Tests
              </button>
              <button
                onClick={() => addMessage('I have a headache')}
                className='bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded text-xs transition-colors'
                title='Describe symptoms'
              >
                🤒 My Symptoms
              </button>
              <button
                onClick={() => addMessage('How do I manage my profile?')}
                className='bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded text-xs transition-colors'
                title='Profile management'
              >
                👤 My Profile
              </button>
              <button
                onClick={() => addMessage('Payment options?')}
                className='bg-pink-100 hover:bg-pink-200 text-pink-700 px-2 py-1 rounded text-xs transition-colors'
                title='Payment information'
              >
                💳 Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatBot
