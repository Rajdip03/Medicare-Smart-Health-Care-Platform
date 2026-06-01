import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { io } from 'socket.io-client'

const STUN_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }]

const VideoCall = () => {
  const { meetingRoomId } = useParams()
  const { backendURL, token } = useContext(AppContext)
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [camOn, setCamOn] = useState(true)
  const [speakerOn, setSpeakerOn] = useState(true)
  const [connected, setConnected] = useState(false)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const remoteAudioRef = useRef(null)
  const peerRef = useRef(null)
  const socketRef = useRef(null)
  const localStreamRef = useRef(null)
  const remoteStreamRef = useRef(null)

  const cleanupSession = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    if (peerRef.current) {
      peerRef.current.ontrack = null
      peerRef.current.onicecandidate = null
      peerRef.current.close()
      peerRef.current = null
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null
      remoteAudioRef.current.pause()
    }

    setConnected(false)
  }, [])

  const endCall = () => {
    cleanupSession()
    navigate('/my-appointments')
  }

  const toggleCam = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setCamOn((prev) => !prev)
    }
  }

  const toggleSpeaker = () => {
    setSpeakerOn((prev) => {
      const next = !prev
      if (remoteAudioRef.current) {
        remoteAudioRef.current.muted = !next
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.muted = true
      }
      return next
    })
  }

  const preparePeerConnection = useCallback((socket) => {
    const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS })

    const remoteStream = new MediaStream()
    peerRef.current = pc

    pc.ontrack = (event) => {
      console.debug('pc.ontrack event:', event)
      let stream = null

      if (event.streams && event.streams.length > 0) {
        stream = event.streams[0]
      } else if (event.track) {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream()
        }
        remoteStreamRef.current.addTrack(event.track)
        stream = remoteStreamRef.current
      }

      if (stream) {
        remoteStreamRef.current = stream
        console.debug('Remote stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, id: t.id })))
        // attach video and audio tracks separately to avoid browser quirks
        try {
          const videoTracks = stream.getVideoTracks()
          const audioTracks = stream.getAudioTracks()

          if (videoTracks && videoTracks.length > 0 && remoteVideoRef.current) {
            const vStream = new MediaStream(videoTracks)
            remoteVideoRef.current.srcObject = null
            remoteVideoRef.current.srcObject = vStream
            remoteVideoRef.current.muted = true
            remoteVideoRef.current.volume = 1
            remoteVideoRef.current.play().catch((e) => console.debug('remote video play suppressed:', e))
            console.debug('attached video stream with tracks:', videoTracks.map(t=>t.id))
          }

          if (audioTracks && audioTracks.length > 0 && remoteAudioRef.current) {
            const aStream = new MediaStream(audioTracks)
            const a = remoteAudioRef.current
            a.srcObject = null
            a.srcObject = aStream
            a.muted = !speakerOn
            a.volume = 1
            a.onplay = () => console.debug('remote audio: play')
            a.onpause = () => console.debug('remote audio: pause')
            a.onerror = (ev) => console.error('remote audio: error', ev)
            a.onvolumechange = () => console.debug('remote audio: volumechange muted=', a.muted)
            const playPromise = a.play()
            if (playPromise && playPromise.then) playPromise.catch((e) => console.debug('remote audio play suppressed:', e))
            console.debug('attached audio stream with tracks:', audioTracks.map(t=>t.id))
          }
        } catch (e) {
          console.debug('remote attach error', e)
        }
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          roomId: meetingRoomId,
          candidate: event.candidate
        })
      }
    }

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState
      if (state === 'connected') {
        setConnected(true)
      }
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        setConnected(false)
      }
    }

    return pc
  }, [meetingRoomId, speakerOn])

  const initCall = useCallback(async () => {
    if (!meetingRoomId || !token) {
      toast.error('Invalid room or unauthorized')
      navigate('/login')
      return
    }

    try {
      const { data } = await axios.get(
        `${backendURL}/api/user/video-room/${meetingRoomId}`,
        { headers: { token } }
      )

      if (!data.success) {
        toast.error(data.message || 'Unable to verify meeting room')
        navigate('/my-appointments')
        return
      }

      setAppointment(data.appointment)

      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = localStream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream
        try {
          // start local preview
          localVideoRef.current.muted = true
          localVideoRef.current.play().catch((e) => console.debug('local play suppressed:', e))
        } catch (e) {
          console.debug('local play error', e)
        }
      }

      // debug: ensure audio track exists
      const audioTracks = localStream.getAudioTracks()
      if (!audioTracks || audioTracks.length === 0) {
        toast.warn('No microphone found or permission denied. Audio will be unavailable.')
      }
      console.debug('Local stream tracks:', localStream.getTracks().map(t => ({ kind: t.kind, id: t.id })))

      const socket = io(backendURL, { transports: ['websocket'] })
      socketRef.current = socket

      const pc = preparePeerConnection(socket)
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream))

      socket.on('connect', () => {
        socket.emit('join-room', { roomId: meetingRoomId, userId: data.appointment.userId, role: 'patient' })
      })

      socket.on('user-connected', async ({ userId, role }) => {
        if (role === 'doctor') {
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          socket.emit('offer', {
            roomId: meetingRoomId,
            sdp: offer,
            userId: data.appointment.userId,
            role: 'patient'
          })
        }
      })

      socket.on('offer', async (payload) => {
        if (!payload?.sdp) return
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit('answer', {
          roomId: meetingRoomId,
          sdp: answer,
          userId: data.appointment.userId,
          role: 'patient'
        })
      })

      socket.on('answer', async (payload) => {
        if (!payload?.sdp) return
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
      })

      socket.on('ice-candidate', async (payload) => {
        if (!payload?.candidate) return
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
        } catch (error) {
          console.error('Error adding ICE candidate:', error)
        }
      })

      socket.on('user-disconnected', ({ userId }) => {
        toast.info('Remote participant disconnected')
      })
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message || 'Video initialization failed')
      navigate('/my-appointments')
    }
  }, [backendURL, meetingRoomId, navigate, preparePeerConnection, token])

  useEffect(() => {
    initCall()
    return () => {
      cleanupSession()
    }
  }, [cleanupSession, initCall])

  if (!appointment) {
    return (
      <div className='mt-16 text-center text-gray-700'>
        <p>Loading video room...</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-50 py-10'>
      <div className='mx-auto max-w-6xl rounded-3xl bg-white shadow-xl p-6'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-sm text-slate-500'>Room ID: {meetingRoomId}</p>
            <h1 className='text-2xl font-bold text-slate-900'>Video Consultation</h1>
            <p className='text-sm text-slate-600'>Doctor: {appointment.docData?.name || 'Doctor'}</p>
            <p className='text-sm text-slate-600'>Patient: {appointment.userData?.name || 'You'}</p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <button onClick={toggleCam} className='rounded-full bg-slate-900 px-4 py-2 text-white'>{camOn ? 'Camera Off' : 'Camera On'}</button>
            <button onClick={toggleSpeaker} className='rounded-full bg-slate-900 px-4 py-2 text-white'>{speakerOn ? 'Speaker Off' : 'Speaker On'}</button>
            <button onClick={endCall} className='rounded-full bg-red-600 px-4 py-2 text-white'>End Call</button>
          </div>
        </div>

        <div className='mt-8 grid gap-4 md:grid-cols-2'>
          <div className='rounded-2xl bg-slate-900 p-4'>
            <p className='text-sm text-slate-300 mb-2'>You</p>
            <video ref={localVideoRef} autoPlay playsInline muted className='h-72 w-full rounded-2xl object-cover bg-black' />
          </div>
          <div className='rounded-2xl bg-slate-900 p-4'>
            <p className='text-sm text-slate-300 mb-2'>Doctor</p>
            <video ref={remoteVideoRef} autoPlay playsInline className='h-72 w-full rounded-2xl object-cover bg-black' />
            <audio ref={remoteAudioRef} autoPlay controls className='mt-2 w-full' />
          </div>
        </div>

        <div className='mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4'>
          <p className='text-sm text-slate-700'>Call Status: <span className='font-semibold'>{connected ? 'Connected' : 'Connecting...'}</span></p>
          <p className='text-sm text-slate-600 mt-2'>Make sure your browser has camera and microphone permissions enabled.</p>
        </div>
      </div>
    </div>
  )
}

export default VideoCall
