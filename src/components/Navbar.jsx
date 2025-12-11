import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, Truck, User, LogOut, PlusCircle, Wallet, LayoutDashboard } from 'lucide-react'
import NotificationBell from './NotificationBell'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Truck size={32} className="text-primary" />
            <span className="text-2xl font-bold text-text-primary">InfraDealer</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium hover:text-primary transition-colors ${isActive('/') ? 'text-primary font-semibold' : 'text-text-primary'}`}
            >
              Home
            </Link>
            <Link 
              to="/listings" 
              className={`font-medium hover:text-primary transition-colors ${isActive('/listings') ? 'text-primary font-semibold' : 'text-text-primary'}`}
            >
              Browse Equipment
            </Link>
            <Link 
              to="/verified" 
              className={`font-medium hover:text-primary transition-colors ${isActive('/verified') ? 'text-primary font-semibold' : 'text-text-primary'}`}
            >
              Verified
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/post-ad" 
                  className="btn btn-accent text-white px-5 py-2.5 text-sm"
                >
                  <PlusCircle size={18} />
                  Post Ad
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="btn btn-outline px-5 py-2.5 text-sm"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary text-white px-5 py-2.5 text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-5">
              <Link to="/wallet" className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-primary rounded-lg hover:bg-blue-100 transition-colors font-medium">
                <Wallet size={18} />
                <span>5 Tokens</span>
              </Link>
              <NotificationBell />
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-text-primary">
                  <User size={20} />
                  <span className="font-medium">{user?.name || 'User'}</span>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 border border-gray-100">
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-2.5 text-sm text-text-primary hover:bg-gray-50 transition-colors font-medium"
                  >
                    <User size={16} className="mr-3" />
                    My Profile
                  </Link>
                  <Link 
                    to="/my-listings" 
                    className="flex items-center px-4 py-2.5 text-sm text-text-primary hover:bg-gray-50 transition-colors font-medium"
                  >
                    <Truck size={16} className="mr-3" />
                    My Listings
                  </Link>
                  {user?.role === 'broker' && (
                    <Link 
                      to="/broker/dashboard" 
                      className="flex items-center px-4 py-2.5 text-sm text-text-primary hover:bg-gray-50 transition-colors font-medium"
                    >
                      <LayoutDashboard size={16} className="mr-3" />
                      Broker Dashboard
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="flex items-center px-4 py-2.5 text-sm text-text-primary hover:bg-gray-50 transition-colors font-medium"
                    >
                      <LayoutDashboard size={16} className="mr-3" />
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2.5 text-sm text-accent hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut size={16} className="mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <nav className="flex flex-col space-y-1">
              <Link 
                to="/" 
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/') ? 'bg-blue-50 text-primary' : 'text-text-primary hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/listings" 
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/listings') ? 'bg-blue-50 text-primary' : 'text-text-primary hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Equipment
              </Link>
              <Link 
                to="/verified" 
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/verified') ? 'bg-blue-50 text-primary' : 'text-text-primary hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Verified
              </Link>
              {isAuthenticated ? (
                <>
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <Link 
                      to="/post-ad" 
                      className="flex items-center px-4 py-3 rounded-lg font-medium bg-accent text-white hover:bg-accent-dark transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <PlusCircle size={18} className="mr-2" />
                      Post Ad
                    </Link>
                  </div>
                  <Link 
                    to="/wallet" 
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/wallet') ? 'bg-blue-50 text-primary' : 'text-text-primary hover:bg-gray-50'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Wallet
                  </Link>
                  <Link 
                    to="/my-listings" 
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/my-listings') ? 'bg-blue-50 text-primary' : 'text-text-primary hover:bg-gray-50'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Listings
                  </Link>
                  <Link 
                    to="/profile" 
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/profile') ? 'bg-blue-50 text-primary' : 'text-text-primary hover:bg-gray-50'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {user?.role === 'broker' && (
                    <Link 
                      to="/broker/dashboard" 
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/broker/dashboard') ? 'bg-blue-50 text-primary' : 'text-text-primary hover:bg-gray-50'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Broker Dashboard
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin') ? 'bg-blue-50 text-primary' : 'text-text-primary hover:bg-gray-50'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-200 px-4">
                    <div className="flex items-center space-x-2 text-primary font-semibold">
                      <Wallet size={18} />
                      <span>5 Tokens</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-accent hover:text-accent-dark transition-colors font-medium"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2 pt-2 mt-2 border-t border-gray-200">
                  <Link 
                    to="/login" 
                    className="block px-4 py-3 rounded-lg font-medium text-center border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block px-4 py-3 rounded-lg font-medium text-center bg-primary text-white hover:bg-primary-dark transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
