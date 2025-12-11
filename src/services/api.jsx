import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || 'Something went wrong'
    
    // Don't show toast for 401 errors (handled by auth context)
    if (error.response?.status !== 401) {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  sendOTP: (phone) => api.post('/auth/send-otp', phone),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data)
}

// Listings API
export const listingsAPI = {
  getListings: (params) => api.get('/listings', { params }),
  getListing: (id) => api.get(`/listings/${id}`),
  createListing: (data) => api.post('/listings', data),
  getUserListings: () => api.get('/listings/user/listings'),
  unlockContact: (id) => api.post(`/listings/${id}/unlock`)
}

// Wallet API
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  createOrder: (data) => api.post('/wallet/create-order', data),
  verifyPayment: (data) => api.post('/wallet/verify', data)
}

// Admin API
export const adminAPI = {
  getPendingListings: () => api.get('/admin/pending-listings'),
  approveListing: (id) => api.put(`/admin/approve-listing/${id}`),
  rejectListing: (id, reason) => api.put(`/admin/reject-listing/${id}`, { reason }),
  getUsers: () => api.get('/admin/users'),
  getTransactions: (params) => api.get('/admin/token-transactions', { params }),
  addTokens: (data) => api.post('/admin/add-tokens', data),
  getDashboardStats: () => api.get('/admin/dashboard-stats')
}

// Broker API
export const brokerAPI = {
  register: (data) => api.post('/brokers/register', data),
  getStats: () => api.get('/brokers/stats'),
  getAssignments: (status) => api.get('/brokers/assignments', { params: { status } }),
  getBrokersNearCity: (city) => api.get('/brokers/near-city', { params: { city } }),
  hireBroker: (data) => api.post('/brokers/hire', data),
  getBrokerProfile: (id) => api.get(`/brokers/profile/${id}`),
  submitReview: (data) => api.post('/brokers/review', data)
}

// Verification & Renewal API
export const verificationAPI = {
  renewListing: (id) => api.post(`/verification/renew/${id}`),
  getNotifications: (params) => api.get('/verification/notifications', { params }),
  markNotificationRead: (id) => api.put(`/verification/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/verification/notifications/read-all'),
  getLeaderboard: (params) => api.get('/verification/leaderboard', { params }),
  getBadgeInfo: () => api.get('/verification/badges/info'),
  reportIncident: (data) => api.post('/verification/report-incident', data)
}

// Upload API
export const uploadAPI = {
  uploadImages: (formData) => api.post('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export default api
