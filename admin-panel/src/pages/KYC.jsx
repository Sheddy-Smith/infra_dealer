import { useState, useEffect } from 'react'
import { Search, CheckCircle, XCircle, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { kycAPI } from '../services/api'

const KYC = () => {
  const [applications, setApplications] = useState([])
  const [brokers, setBrokers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'pending') {
        const data = await kycAPI.getPendingKYC()
        setApplications(data.applications || [])
      } else {
        const data = await kycAPI.getAllBrokers()
        setBrokers(data.brokers || [])
      }
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    const badge = prompt('Enter badge type (verified_broker/premium_broker):', 'verified_broker')
    if (!badge) return
    try {
      await kycAPI.approveKYC(userId, badge)
      toast.success('KYC approved successfully')
      fetchData()
    } catch (error) {
      toast.error('Failed to approve KYC')
    }
  }

  const handleReject = async (userId) => {
    const reason = prompt('Enter reason for rejection:')
    if (!reason) return
    try {
      await kycAPI.rejectKYC(userId, reason)
      toast.success('KYC rejected')
      fetchData()
    } catch (error) {
      toast.error('Failed to reject KYC')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">KYC Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Pending Applications
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All Brokers
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Broker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(activeTab === 'pending' ? applications : brokers).map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Shield size={20} className="text-blue-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        {item.badge && (
                          <span className="text-xs text-blue-600">{item.badge}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.company_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.kyc_status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : item.kyc_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.kyc_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {item.kyc_status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(activeTab === 'pending' ? applications : brokers).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No data found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default KYC
