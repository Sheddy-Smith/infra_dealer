import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  UserCheck, 
  Flag, 
  Receipt, 
  FileSearch,
  Bell,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react'
import { useState } from 'react'

const AdminLayout = ({ children }) => {
  const { admin, logout } = useAdminAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/listings', icon: FileText, label: 'Listings' },
    { path: '/kyc', icon: UserCheck, label: 'KYC Queue' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/reports', icon: Flag, label: 'Reports' },
    { path: '/transactions', icon: Receipt, label: 'Transactions' },
    { path: '/audit', icon: FileSearch, label: 'Audit Trail' },
    { path: '/announcements', icon: Bell, label: 'Announcements' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-bg">
      {/* Top Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <Link to="/dashboard" className="flex items-center gap-2">
              <Shield size={28} className="text-primary" />
              <div>
                <span className="text-xl font-bold text-text-primary">InfraDealer</span>
                <span className="text-xs text-text-secondary block">Admin Panel</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="font-semibold text-text-primary">{admin?.name}</p>
              <p className="text-sm text-text-secondary">Administrator</p>
            </div>
            <button
              onClick={logout}
              className="btn btn-outline px-4 py-2 text-sm"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out z-30
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive(item.path)
                      ? 'bg-primary text-white font-semibold'
                      : 'text-text-primary hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminLayout
