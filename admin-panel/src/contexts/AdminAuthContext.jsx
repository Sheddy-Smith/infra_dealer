import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

const AdminAuthContext = createContext()

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token')
    
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await authAPI.verifyToken()
      if (response.data.admin && response.data.admin.role === 'admin') {
        setAdmin(response.data.admin)
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('admin_token')
      }
    } catch (error) {
      console.error('Auth verification failed:', error)
      localStorage.removeItem('admin_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      
      if (response.data.user.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied. Admin privileges required.'
        }
      }

      localStorage.setItem('admin_token', response.data.token)
      setAdmin(response.data.user)
      setIsAuthenticated(true)
      
      return {
        success: true,
        message: 'Login successful'
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setAdmin(null)
    setIsAuthenticated(false)
    navigate('/login')
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}
