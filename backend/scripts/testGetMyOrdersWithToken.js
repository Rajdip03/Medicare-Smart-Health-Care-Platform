import axios from 'axios'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const secret = process.env.JWT_SECRET || 'medicare'
// Replace with a valid user ObjectId if you have one in DB
const fakeUserId = '64f8e9f6c2e8f3a1b2c3d4e5'
const token = jwt.sign({ id: fakeUserId }, secret)

const url = 'http://localhost:4000/api/lab/my-orders'

const run = async () => {
  try {
    const res = await axios.get(url, { headers: { token } })
    console.log('status', res.status)
    console.log(res.data)
  } catch (err) {
    if (err.response) {
      console.log('response status', err.response.status)
      console.log(err.response.data)
    } else {
      console.log('error', err.message)
    }
  }
}

run()
