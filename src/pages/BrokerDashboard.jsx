import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  Briefcase, TrendingUp, Users, Star, DollarSign, Clock,
  CheckCircle, XCircle, Eye, Phone, Mail, MapPin, Award,
  Filter, Search, Download, MoreVertical, MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const BrokerDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('assigned')
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState([])
  const [stats, setStats] = useState({
    activeJobs: 0,
    completedDeals: 0,
    commissionEarned: 0,
    averageRating: 0,
    totalReviews: 0
  })

  useEffect(() => {
    // Mock data - replace with actual API calls
    const fetchDashboardData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setStats({
          activeJobs: 5,
          completedDeals: 23,
          commissionEarned: 145000,
          averageRating: 4.7,
          totalReviews: 18
        })

        setAssignments([
          {
            id: 1,
            listing_id: 101,
            title: 'JCB 3DX Backhoe Loader - 2019',
            seller: 'Rajesh Kumar',
            location: 'Mumbai, Maharashtra',
            status: 'active',
            commission_rate: 2.5,
            assigned_date: '2024-12-10',
            expected_price: 1800000
          },
          {
            id: 2,
            listing_id: 102,
            title: 'Tata 2518 Tipper - 2018',
            seller: 'Amit Singh',
            location: 'Pune, Maharashtra',
            status: 'assigned',
            commission_rate: 2,
            assigned_date: '2024-12-09',
            expected_price: 1200000
          }
        ])
      } catch (error) {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const tabs = [
    { id: 'assigned', label: 'Assigned Jobs', count: stats.activeJobs },
    { id: 'leads', label: 'My Leads', count: 12 },
    { id: 'payments', label: 'Payments', count: 0 },
    { id: 'reviews', label: 'Reviews', count: stats.totalReviews }
  ]

  const getStatusBadge = (status) => {
    const statusConfig = {
      assigned: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Assigned' },
      active: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Active' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
    }
    
    const config = statusConfig[status] || statusConfig.assigned
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Check if broker is verified
  if (user?.role !== 'broker' || user?.kyc_status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <Clock size={64} className="mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl font-bold mb-4">KYC Verification Pending</h2>
          <p className="text-gray-600 mb-6">
            Your broker application is under review. You'll be notified once verified.
          </p>
          <button
            onClick={() => navigate('/profile?kyc=true')}
            className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Check Status
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <Award className="mr-3 text-primary" size={32} />
              Broker Dashboard
            </h1>
            <p className="text-gray-600">Manage your assignments and track your earnings</p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
              <CheckCircle size={16} className="mr-2" />
              Verified Broker
            </span>
          </div>
        </div>

        {/* Stats Cards - Element 4 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="text-blue-500" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.activeJobs}</p>
            <p className="text-sm text-gray-600">Active Jobs</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-500" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.completedDeals}</p>
            <p className="text-sm text-gray-600">Completed Deals</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-purple-500" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{(stats.commissionEarned / 1000).toFixed(0)}K</p>
            <p className="text-sm text-gray-600">Commission Earned</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <Star className="text-yellow-500" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.averageRating}</p>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Assigned Jobs Tab */}
            {activeTab === 'assigned' && (
              <div className="space-y-4">
                {assignments.map(assignment => (
                  <div key={assignment.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                          {getStatusBadge(assignment.status)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 gap-4 mb-2">
                          <span className="flex items-center">
                            <Users size={14} className="mr-1" />
                            {assignment.seller}
                          </span>
                          <span className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {assignment.location}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Assigned on: {new Date(assignment.assigned_date).toLocaleDateString()}
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical size={20} className="text-gray-400" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Expected Price</p>
                        <p className="font-semibold text-gray-800">₹{(assignment.expected_price / 100000).toFixed(1)}L</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Commission Rate</p>
                        <p className="font-semibold text-gray-800">{assignment.commission_rate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Your Earning</p>
                        <p className="font-semibold text-green-600">
                          ₹{((assignment.expected_price * assignment.commission_rate) / 100000).toFixed(2)}K
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/listings/${assignment.listing_id}`)}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-50 text-primary rounded-lg font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Eye size={16} className="mr-2" />
                        View Listing
                      </button>
                      <button className="flex-1 flex items-center justify-center px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-colors">
                        <Phone size={16} className="mr-2" />
                        Contact Seller
                      </button>
                      <button className="flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {assignments.length === 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Briefcase size={64} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Assignments</h3>
                    <p className="text-gray-500">You'll see new job assignments here</p>
                  </div>
                )}
              </div>
            )}

            {/* My Leads Tab */}
            {activeTab === 'leads' && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Users size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Leads Yet</h3>
                <p className="text-gray-500">Your generated leads will appear here</p>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Payment History</h3>
                <div className="text-center py-12">
                  <DollarSign size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Payments Yet</h3>
                  <p className="text-gray-500">Complete deals to earn commission</p>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Client Reviews</h3>
                <div className="text-center py-12">
                  <Star size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-500">Complete your first deal to get reviews</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Broker Profile</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Deals</span>
                  <span className="font-semibold">{stats.completedDeals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold">&lt; 2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">Jan 2024</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="w-full mt-4 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                View Public Profile
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center">
                  <Download size={18} className="mr-3 text-gray-600" />
                  <span>Download Report</span>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center">
                  <Mail size={18} className="mr-3 text-gray-600" />
                  <span>Message Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrokerDashboard
