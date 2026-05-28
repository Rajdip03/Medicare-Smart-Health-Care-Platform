import axios from 'axios'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const token = jwt.sign((process.env.ADMIN_EMAIL || '') + (process.env.ADMIN_PASSWORD || ''), process.env.JWT_SECRET || 'medicare')

const url = 'http://localhost:4000/api/lab/orders/all'

const run = async () => {
  try {
    const res = await axios.get(url, { headers: { aToken: token } })
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
