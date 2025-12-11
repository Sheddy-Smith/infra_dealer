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
    <header className="bg-primary shadow-md sticky top-0 z-50 safe-area-top">
      <div className="container">
        <div className="flex justify-between items-center h-14 md:h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Truck size={28} className="text-accent" />
            <span className="text-xl md:text-2xl font-bold text-white">InfraDealer</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-semibold hover:text-accent transition-colors ${isActive('/') ? 'text-accent' : 'text-white'}`}
            >
              Home
            </Link>
            <Link 
              to="/listings" 
              className={`font-semibold hover:text-accent transition-colors ${isActive('/listings') ? 'text-accent' : 'text-white'}`}
            >
              Browse Equipment
            </Link>
            <Link 
              to="/verified" 
              className={`font-semibold hover:text-accent transition-colors ${isActive('/verified') ? 'text-accent' : 'text-white'}`}
            >
              Verified
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/post-ad" 
                  className="btn btn-accent px-5 py-2 text-sm font-bold"
                >
                  <PlusCircle size={18} />
                  SELL
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white font-semibold hover:text-accent transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* User Menu */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <NotificationBell />
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-light hover:bg-primary-dark transition-colors text-white">
                  <User size={20} />
                  <span className="font-semibold">{user?.name || 'User'}</span>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 border border-border-light">
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-2.5 text-sm text-text-primary hover:bg-bg transition-colors font-semibold"
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
