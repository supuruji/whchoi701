import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // Vite proxy will handle this
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any request modifications here (auth tokens, etc.)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded')
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data)
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout')
    }
    
    return Promise.reject(error)
  }
)

export default api