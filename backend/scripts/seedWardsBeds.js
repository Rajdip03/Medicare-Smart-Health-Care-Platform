import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '..', '.env') })
import Ward from '../models/wardModel.js'
import Bed from '../models/bedModel.js'

const MONGO = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare'
console.log('Using Mongo URI:', MONGO)

async function seed() {
  await mongoose.connect(MONGO)
  console.log('connected')

  await Ward.deleteMany({})
  await Bed.deleteMany({})

  const wards = [
    { name: 'General Ward A', type: 'General', capacity: 10, location: 'Block A' },
    { name: 'ICU 1', type: 'ICU', capacity: 4, location: 'Block B' },
    { name: 'Maternity Ward', type: 'Maternity', capacity: 6, location: 'Block C' }
  ]

  const created = await Ward.insertMany(wards)
  console.log('wards created', created.length)

  const beds = []
  created.forEach(w => {
    for (let i = 1; i <= (w.capacity || 3); i++) {
      beds.push({ wardId: w._id, bedNumber: `B-${w._id.toString().slice(-4)}-${i}`, type: w.type === 'ICU' ? 'ICU' : 'Normal' })
    }
  })

  const createdBeds = await Bed.insertMany(beds)
  console.log('beds created', createdBeds.length)

  await mongoose.disconnect()
  console.log('done')
}

seed().catch(e=>{console.error(e); process.exit(1)})