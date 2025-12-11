import axios from 'axios'
import API_BASE_URL from '../config/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Admin Auth API
export const authAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  verifyToken: () => api.get('/admin/verify'),
}

// Admin Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getCharts: () => api.get('/admin/dashboard/charts'),
}

// Listings Management API
export const listingsAPI = {
  getPending: (params) => api.get('/admin/listings/pending', { params }),
  approveListing: (id) => api.post(`/admin/listings/${id}/approve`),
  rejectListing: (id, data) => api.post(`/admin/listings/${id}/reject`, data),
  getAllListings: (params) => api.get('/admin/listings', { params }),
  deleteListing: (id) => api.delete(`/admin/listings/${id}`),
}

// Broker KYC Management API
export const kycAPI = {
  getPendingKYC: (params) => api.get('/admin/kyc/pending', { params }),
  approveKYC: (userId, data) => api.post(`/admin/kyc/${userId}/approve`, data),
  rejectKYC: (userId, data) => api.post(`/admin/kyc/${userId}/reject`, data),
  getAllBrokers: (params) => api.get('/admin/brokers', { params }),
}

// User Management API
export const usersAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  suspendUser: (id) => api.post(`/admin/users/${id}/suspend`),
  activateUser: (id) => api.post(`/admin/users/${id}/activate`),
  addTokens: (data) => api.post('/admin/users/add-tokens', data),
}

// Reports & Complaints API
export const reportsAPI = {
  getReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (id, data) => api.post(`/admin/reports/${id}/resolve`, data),
  escalateReport: (id) => api.post(`/admin/reports/${id}/escalate`),
}

// Transaction Logs API
export const transactionsAPI = {
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  exportTransactions: (params) => api.get('/admin/transactions/export', { params, responseType: 'blob' }),
}

// Audit Trail API
export const auditAPI = {
  getAuditLogs: (params) => api.get('/admin/audit', { params }),
  exportAudit: (params) => api.get('/admin/audit/export', { params, responseType: 'blob' }),
}

// Notifications API
export const notificationsAPI = {
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  getAnnouncements: (params) => api.get('/admin/announcements', { params }),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
}

export default api
