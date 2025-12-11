import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { Shield, Lock, Phone, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminLogin = () => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAdminAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!phone || !password) {
      toast.error('Please enter both phone and password')
      return
    }

    setLoading(true)
    const result = await login({ phone, password })
    setLoading(false)

    if (result.success) {
      toast.success('Welcome to Admin Panel')
      navigate('/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-blue-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <Shield size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">InfraDealer</h1>
          <p className="text-blue-100 text-lg">Admin Panel</p>
        </div>

        {/* Login Card */}
        <div className="card shadow-2xl">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Admin Login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  type="tel"
                  placeholder="Enter admin phone number"
                  className="input pl-11"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  type="password"
                  placeholder="Enter admin password"
                  className="input pl-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <Shield size={20} />
                  Login to Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 flex items-start gap-2">
              <Shield size={16} className="mt-0.5 flex-shrink-0" />
              <span>
                This is a secure admin area. Only authorized personnel with admin role can access this panel.
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-100 mt-6 text-sm">
          &copy; {new Date().getFullYear()} InfraDealer. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
