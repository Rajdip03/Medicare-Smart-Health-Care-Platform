import mongoose from 'mongoose'
import 'dotenv/config'
import LabTest from '../models/labTestModel.js'

const uri = process.env.MONGODB_URL || 'mongodb://localhost:27017/medicare'

const tests = [
  { name: 'Complete Blood Count', description: 'CBC with platelet count', price: 300, sampleType: 'Blood' },
  { name: 'Lipid Profile', description: 'Cholesterol, HDL, LDL, TG', price: 500, sampleType: 'Blood' },
  { name: 'Thyroid Panel', description: 'TSH, T3, T4', price: 450, sampleType: 'Blood' }
]

const run = async () => {
  try {
    await mongoose.connect(uri)
    console.log('DB connected')
    await LabTest.insertMany(tests)
    console.log('Seeded tests')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
