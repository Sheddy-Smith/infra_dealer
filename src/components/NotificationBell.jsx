import { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, Clock, AlertTriangle, Award } from 'lucide-react'
import { verificationAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const NotificationBell = () => {
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await verificationAPI.getNotifications({ limit: 10 })
      setNotifications(response.data.notifications)
      setUnreadCount(response.data.unread_count)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.read) {
        await verificationAPI.markNotificationRead(notification.id)
        setUnreadCount(prev => Math.max(0, prev - 1))
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, read: 1 } : n
        ))
      }

      // Navigate to link if exists
      if (notification.link) {
        navigate(notification.link)
      }

      setShowNotifications(false)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await verificationAPI.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: 1 })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'listing_expired':
      case 'expiry_reminder':
        return <Clock size={20} className="text-orange-500" />
      case 'kyc_expired':
      case 'kyc_expiry_reminder':
        return <AlertTriangle size={20} className="text-yellow-500" />
      case 'badge_earned':
        return <Award size={20} className="text-green-500" />
      case 'trust_score_warning':
        return <AlertTriangle size={20} className="text-red-500" />
      default:
        return <Bell size={20} className="text-blue-500" />
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl z-50 max-h-[32rem] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-blue-700 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-96">
              {notifications.length > 0 ? (
                <>
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-gray-800 text-sm">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Footer Actions */}
                  {unreadCount > 0 && (
                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAllRead()
                        }}
                        className="w-full text-primary hover:text-blue-700 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Mark all as read
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center">
                  <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationBell
