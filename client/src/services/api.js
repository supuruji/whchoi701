import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Email API
export const emailAPI = {
  // Register new email
  register: async (email) => {
    const response = await api.post('/email/register', { email })
    return response.data
  },

  // Get all emails (admin)
  getAll: async () => {
    const response = await api.get('/email/list')
    return response.data
  },

  // Unsubscribe email
  unsubscribe: async (email) => {
    const response = await api.delete(`/email/unsubscribe/${encodeURIComponent(email)}`)
    return response.data
  },

  // Check subscription status
  getStatus: async (email) => {
    const response = await api.get(`/email/status/${encodeURIComponent(email)}`)
    return response.data
  }
}

// Papers API
export const papersAPI = {
  // Get all papers with pagination
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get(`/papers?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get recent papers
  getRecent: async () => {
    const response = await api.get('/papers/recent')
    return response.data
  },

  // Search papers
  search: async (query) => {
    const response = await api.get(`/papers/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Get paper by ID
  getById: async (id) => {
    const response = await api.get(`/papers/${id}`)
    return response.data
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/papers/stats')
    return response.data
  }
}

// System API
export const systemAPI = {
  // Health check
  health: async () => {
    const response = await api.get('/health')
    return response.data
  },

  // Trigger manual crawl (admin)
  triggerCrawl: async () => {
    const response = await api.post('/admin/crawl')
    return response.data
  },

  // Get system status (admin)
  getStatus: async () => {
    const response = await api.get('/admin/status')
    return response.data
  }
}

// Utility function to handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        return data.message || '잘못된 요청입니다.'
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.'
      case 409:
        return data.message || '이미 존재하는 데이터입니다.'
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      default:
        return data.message || `오류가 발생했습니다 (${status})`
    }
  } else if (error.request) {
    // Request was made but no response received
    return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'
  } else {
    // Something else happened
    return error.message || '알 수 없는 오류가 발생했습니다.'
  }
}

export default api