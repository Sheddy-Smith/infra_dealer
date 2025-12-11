import { Link, useLocation } from 'react-router-dom'
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const MobileBottomNav = () => {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const navItems = [
    {
      name: 'Home',
      icon: Home,
      path: '/',
      show: true
    },
    {
      name: 'Search',
      icon: Search,
      path: '/listings',
      show: true
    },
    {
      name: 'Sell',
      icon: PlusCircle,
      path: isAuthenticated ? '/post-ad' : '/login',
      show: true,
      highlight: true
    },
    {
      name: 'Chat',
      icon: MessageCircle,
      path: '/chats',
      show: false // Will be enabled later
    },
    {
      name: 'Account',
      icon: User,
      path: isAuthenticated ? '/profile' : '/login',
      show: true
    }
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile Bottom Navigation - OLX Style */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border-light z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.filter(item => item.show).map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            if (item.highlight) {
              // Special "Sell" button - OLX style prominent center button
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex flex-col items-center justify-center relative -mt-6"
                >
                  <div className="bg-accent hover:bg-accent-dark text-primary rounded-full p-4 shadow-lg transition-transform active:scale-95">
                    <Icon size={24} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-medium text-text-primary mt-1">
                    {item.name}
                  </span>
                </Link>
              )
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  active 
                    ? 'text-primary' 
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <Icon 
                  size={24} 
                  strokeWidth={active ? 2.5 : 2}
                  className="mb-1"
                />
                <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-16" />
    </>
  )
}

export default MobileBottomNav
