import { Routes, Route, Navigate } from 'react-router-dom'
import { useAdminAuth } from './contexts/AdminAuthContext'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import AdminLayout from './components/AdminLayout'
import Listings from './pages/Listings'
import KYC from './pages/KYC'
import Users from './pages/Users'
import Reports from './pages/Reports'
import Transactions from './pages/Transactions'
import Audit from './pages/Audit'
import Announcements from './pages/Announcements'

function App() {
  const { isAuthenticated, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <AdminLogin />} 
      />

      {/* Protected Routes */}
      {isAuthenticated ? (
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/kyc" element={<KYC />} />
          <Route path="/users" element={<Users />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  )
}

export default App
