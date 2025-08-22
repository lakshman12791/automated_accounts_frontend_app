import axios from 'axios'

const apiUrl = 'http://localhost:3002/api'


// Reusable Axios instance
const client = axios.create({
  baseURL: apiUrl,
  withCredentials: false,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

// Response interceptor to unwrap data and normalize errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      'Request failed'
    return Promise.reject(new Error(message))
  }
)

export default client


