import axios from 'axios'

const url = 'http://localhost:4000/api/lab/my-orders'

const run = async () => {
  try {
    const res = await axios.get(url)
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
