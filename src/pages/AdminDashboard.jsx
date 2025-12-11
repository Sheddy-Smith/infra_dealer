import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { adminAPI, SERVER_BASE_URL } from '../services/api'
import { 
  Users, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Eye,
  Plus,
  Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    userCount: 0,
    listingStats: [],
    totalTokens: 0,
    recentTransactions: []
  })
  const [pendingListings, setPendingListings] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/'
      return
    }

    const fetchDashboardData = async () => {
      try {
        const response = await adminAPI.getDashboardStats()
        setStats(response.data.stats)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    const fetchPendingListings = async () => {
      try {
        const response = await adminAPI.getPendingListings()
        setPendingListings(response.data.listings)
      } catch (error) {
        console.error('Error fetching pending listings:', error)
        toast.error('Failed to load pending listings')
      }
    }

    fetchDashboardData()
    fetchPendingListings()
  }, [user])

  const handleApproveListing = async (id) => {
    setActionLoading(true)
    try {
      await adminAPI.approveListing(id)
      setPendingListings(prev => prev.filter(listing => listing.id !== id))
      toast.success('Listing approved successfully')
    } catch (error) {
      console.error('Error approving listing:', error)
      toast.error('Failed to approve listing')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectListing = async (id) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    setActionLoading(true)
    try {
      await adminAPI.rejectListing(id, reason)
      setPendingListings(prev => prev.filter(listing => listing.id !== id))
      toast.success('Listing rejected successfully')
    } catch (error) {
      console.error('Error rejecting listing:', error)
      toast.error('Failed to reject listing')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex space-x-1 mb-8 border-b">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'dashboard'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'listings'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Listings
          {pendingListings.length > 0 && (
            <span className="ml-2 bg-accent text-white text-xs px-2 py-1 rounded-full">
              {pendingListings.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'users'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'transactions'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Transactions
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold">{stats.userCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="text-primary" size={24} />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Listings</p>
                <p className="text-2xl font-bold">
                  {stats.listingStats.reduce((sum, stat) => sum + stat.count, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tokens in Circulation</p>
                <p className="text-2xl font-bold">{stats.totalTokens}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Approved Listings</p>
                <p className="text-2xl font-bold">
                  {stats.listingStats.find(stat => stat.status === 'approved')?.count || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Listings Tab */}
      {activeTab === 'listings' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Pending Listings</h2>
          
          {pendingListings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Listing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingListings.map(listing => (
                    <tr key={listing.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={listing.images && listing.images.length > 0 
                                ? `${SERVER_BASE_URL}/uploads/${listing.images[0]}` 
                                : 'https://via.placeholder.com/40x40?text=No+Image'
                              }
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {listing.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {listing.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{listing.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatPrice(listing.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(listing.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleApproveListing(listing.id)}
                          disabled={actionLoading}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleRejectListing(listing.id)}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircle size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
              <p>No pending listings</p>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">All Users</h2>
          <div className="text-center py-8 text-gray-500">
            <Users size={48} className="mx-auto mb-4" />
            <p>User management feature coming soon</p>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Recent Transactions</h2>
          
          {stats.recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance After
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentTransactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{transaction.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          transaction.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.change > 0 ? '+' : ''}{transaction.change}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.balance_after}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign size={48} className="mx-auto mb-4" />
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
