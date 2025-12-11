import { useState, useEffect } from 'react'
import { X, Star, MapPin, Briefcase, CheckCircle, Award, TrendingUp, Phone, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

const HireBrokerModal = ({ show, onClose, listingId, listingCity }) => {
  const [brokers, setBrokers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBroker, setSelectedBroker] = useState(null)

  useEffect(() => {
    if (show) {
      fetchBrokers()
    }
  }, [show, listingCity])

  const fetchBrokers = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setBrokers([
        {
          id: 1,
          name: 'Rahul Transport Services',
          city: listingCity || 'Mumbai',
          rating: 4.8,
          reviews: 24,
          deals_closed: 45,
          experience_years: '6-10',
          specialization: 'Tippers, Excavators',
          verified: true,
          success_rate: 94,
          response_time: '< 2 hours'
        },
        {
          id: 2,
          name: 'Amit Heavy Equipment Broker',
          city: listingCity || 'Mumbai',
          rating: 4.6,
          reviews: 18,
          deals_closed: 32,
          experience_years: '3-5',
          specialization: 'All Heavy Equipment',
          verified: true,
          success_rate: 89,
          response_time: '< 4 hours'
        },
        {
          id: 3,
          name: 'Priya Machinery Solutions',
          city: listingCity || 'Mumbai',
          rating: 4.9,
          reviews: 31,
          deals_closed: 56,
          experience_years: '10+',
          specialization: 'Mining Equipment',
          verified: true,
          success_rate: 96,
          response_time: '< 1 hour'
        },
        {
          id: 4,
          name: 'Suresh Equipment Dealers',
          city: listingCity || 'Mumbai',
          rating: 4.5,
          reviews: 15,
          deals_closed: 28,
          experience_years: '3-5',
          specialization: 'Construction Equipment',
          verified: true,
          success_rate: 87,
          response_time: '< 3 hours'
        },
        {
          id: 5,
          name: 'Vikram Broker Network',
          city: listingCity || 'Mumbai',
          rating: 4.7,
          reviews: 22,
          deals_closed: 41,
          experience_years: '6-10',
          specialization: 'Cranes, Loaders',
          verified: true,
          success_rate: 92,
          response_time: '< 2 hours'
        }
      ])
    } catch (error) {
      console.error('Error fetching brokers:', error)
      toast.error('Failed to load brokers')
    } finally {
      setLoading(false)
    }
  }

  const handleHire = async (brokerId) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success('Broker hired successfully! They will contact you shortly.')
      onClose()
    } catch (error) {
      console.error('Error hiring broker:', error)
      toast.error('Failed to hire broker. Please try again.')
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-2xl font-bold mb-2">Hire a Verified Broker</h2>
          <p className="text-blue-100">
            Connect with top-rated brokers near {listingCity || 'your city'} to help you sell faster
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {brokers.map((broker) => (
                <div
                  key={broker.id}
                  className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
                    selectedBroker === broker.id ? 'border-primary bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start flex-1">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 flex-shrink-0">
                        {broker.name[0]}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-800">{broker.name}</h3>
                          {broker.verified && (
                            <CheckCircle size={18} className="text-green-500" title="Verified Broker" />
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {broker.city}
                          </span>
                          <span className="flex items-center">
                            <Briefcase size={14} className="mr-1" />
                            {broker.experience_years} exp
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                            <Star size={14} className="text-yellow-500 fill-current mr-1" />
                            <span className="font-semibold text-gray-800">{broker.rating}</span>
                            <span className="text-gray-600 text-xs ml-1">({broker.reviews} reviews)</span>
                          </div>
                          <span className="text-xs text-gray-500">• {broker.deals_closed} deals closed</span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Specialization:</strong> {broker.specialization}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-green-50 rounded-lg p-2">
                            <div className="flex items-center text-green-700">
                              <TrendingUp size={14} className="mr-1" />
                              <span className="text-xs font-semibold">Success Rate</span>
                            </div>
                            <p className="text-lg font-bold text-green-800">{broker.success_rate}%</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2">
                            <div className="flex items-center text-blue-700">
                              <Award size={14} className="mr-1" />
                              <span className="text-xs font-semibold">Response Time</span>
                            </div>
                            <p className="text-sm font-bold text-blue-800">{broker.response_time}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hire Button */}
                    <button
                      onClick={() => handleHire(broker.id)}
                      className="ml-4 bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
                    >
                      Hire Broker
                    </button>
                  </div>
                </div>
              ))}

              {brokers.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Brokers Available</h3>
                  <p className="text-gray-500">No verified brokers found in your area at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Award size={16} className="mr-2 text-primary" />
              <span>All brokers are verified and background-checked</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HireBrokerModal
