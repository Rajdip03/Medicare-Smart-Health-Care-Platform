import  { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { backendURL } = useContext(AppContext)
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        const token = searchParams.get('token')

        if (!token) {
          setError('No verification token provided')
          setLoading(false)
          return
        }

        const { data } = await axios.post(
          backendURL + '/api/user/verify-email',
          { token }
        )

        if (data.success) {
          setVerified(true)
          toast.success('Email verified successfully!')
          setTimeout(() => {
            navigate('/my-profile')
          }, 2000)
        } else {
          setError(data.message)
          toast.error(data.message)
        }
      } catch (error) {
        console.log(error)
        setError(error.message)
        toast.error('Email verification failed')
      } finally {
        setLoading(false)
      }
    }

    verifyEmailToken()
  }, [searchParams, backendURL, navigate])

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>Email Verification</h2>
        </div>

        {loading ? (
          <div className='text-center py-12'>
            <div className='inline-flex items-center justify-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
            </div>
            <p className='mt-4 text-gray-600'>Verifying your email...</p>
          </div>
        ) : verified ? (
          <div className='rounded-lg bg-green-50 p-4 text-center'>
            <div className='text-4xl text-green-600 mb-4'>✓</div>
            <h3 className='text-lg font-medium text-green-800 mb-2'>Email Verified!</h3>
            <p className='text-sm text-green-700'>
              Your email has been successfully verified. You're being redirected to your profile...
            </p>
          </div>
        ) : (
          <div className='rounded-lg bg-red-50 p-4 text-center'>
            <div className='text-4xl text-red-600 mb-4'>✕</div>
            <h3 className='text-lg font-medium text-red-800 mb-2'>Verification Failed</h3>
            <p className='text-sm text-red-700 mb-4'>{error}</p>
            <button
              onClick={() => navigate('/login')}
              className='mt-4 w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
