import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import labRouter from './routes/labRoute.js'

//app config
const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

//middlewares
app.use(express.json())
app.use(cors())

//api endpoints
app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)
app.use('/api/lab', labRouter)

app.get('/',(req,res)=>{
    res.send('API WORKNG')
})

const io = new SocketIOServer(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || '*', process.env.ADMIN_URL || '*'],
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)

  socket.on('join-room', ({ roomId, userId, role }) => {
    if (!roomId) return
    console.log(`Socket ${socket.id} joining room ${roomId} as ${role} (userId=${userId})`)
    socket.join(roomId)
    socket.userId = userId
    socket.emit('joined-room', { roomId })
    socket.to(roomId).emit('user-connected', { userId, role })
  })

  socket.on('offer', (payload) => {
    console.log('Received offer from', socket.id, 'payload:', !!payload)
    if (!payload?.roomId) return
    console.log(`Forwarding offer to room ${payload.roomId}`)
    socket.to(payload.roomId).emit('offer', payload)
  })

  socket.on('answer', (payload) => {
    console.log('Received answer from', socket.id, 'payload:', !!payload)
    if (!payload?.roomId) return
    console.log(`Forwarding answer to room ${payload.roomId}`)
    socket.to(payload.roomId).emit('answer', payload)
  })

  socket.on('ice-candidate', (payload) => {
    console.log('Received ice-candidate from', socket.id)
    if (!payload?.roomId) return
    socket.to(payload.roomId).emit('ice-candidate', payload)
  })

  socket.on('disconnect', () => {
    const rooms = Array.from(socket.rooms)
    rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        socket.to(roomId).emit('user-disconnected', { userId: socket.userId })
      }
    })
    console.log('Socket disconnected:', socket.id)
  })
})

server.listen(port,()=>console.log('Server Started',port))