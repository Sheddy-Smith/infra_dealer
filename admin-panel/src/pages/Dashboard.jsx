import { useState, useEffect } from 'react'
import { dashboardAPI } from '../services/api'
import { 
  FileText, 
  Clock, 
  UserCheck, 
  AlertCircle,
  Coins,
  Flag,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalListings: 0,
    pendingApprovals: 0,
    verifiedBrokers: 0,
    kycPending: 0,
    tokensSold: 0,
    reportsOpen: 0,
    activeUsers: 0,
    totalRevenue: 0
  })
  const [charts, setCharts] = useState({
    dailyUsers: [],
    listingsByCategory: [],
    tokenRevenue: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, chartsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getCharts()
      ])
      
      setStats(statsRes.data)
      setCharts(chartsRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Listings',
      value: stats.totalListings,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+12%'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      urgent: stats.pendingApprovals > 0
    },
    {
      title: 'Verified Brokers',
      value: stats.verifiedBrokers,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'KYC Pending',
      value: stats.kycPending,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      urgent: stats.kycPending > 0
    },
    {
      title: 'Tokens Sold',
      value: stats.tokensSold,
      icon: Coins,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Open Reports',
      value: stats.reportsOpen,
      icon: Flag,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Dashboard Overview</h1>
        <p className="text-text-secondary mt-1">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`card hover:shadow-lg ${stat.urgent ? 'ring-2 ring-accent' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} className={stat.color} />
                </div>
                {stat.trend && (
                  <span className="text-sm font-semibold text-success">{stat.trend}</span>
                )}
              </div>
              <p className="text-text-secondary text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Active Users Chart */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={24} className="text-primary" />
            <h2 className="text-xl font-bold">Daily Active Users</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts.dailyUsers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#007BFF" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Listings by Category */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <FileText size={24} className="text-primary" />
            <h2 className="text-xl font-bold">Listings by Category</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.listingsByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#007BFF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Token Revenue Trend */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={24} className="text-primary" />
            <h2 className="text-xl font-bold">Token Revenue Trend</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts.tokenRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#2E7D32" strokeWidth={2} name="Revenue (₹)" />
              <Line type="monotone" dataKey="tokens" stroke="#FFC107" strokeWidth={2} name="Tokens Sold" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
