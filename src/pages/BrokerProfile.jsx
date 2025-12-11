import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  User, MapPin, Briefcase, Star, Award, TrendingUp, CheckCircle,
  Phone, Mail, Calendar, Shield, MessageSquare
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const BrokerProfile = () => {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [broker, setBroker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetchBrokerProfile()
  }, [id])

  const fetchBrokerProfile = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setBroker({
        id: parseInt(id),
        name: 'Rahul Transport Services',
        email: 'rahul@transport.com',
        phone: '+91 98765 43210',
        city: 'Mumbai',
        state: 'Maharashtra',
        company_name: 'Rahul Transport Services Pvt Ltd',
        experience_years: '6-10',
        specialization: 'Tippers, Excavators, Loaders',
        working_cities: 'Mumbai, Pune, Nagpur, Nashik',
        verified: true,
        member_since: '2020-01-15',
        
        // Stats
        total_deals: 45,
        active_jobs: 3,
        success_rate: 94,
        average_rating: 4.8,
        total_reviews: 24,
        response_time: '< 2 hours',
        
        // Additional info
        about: 'Experienced heavy equipment broker specializing in construction and mining machinery. Have successfully closed 45+ deals across Maharashtra with a focus on customer satisfaction and transparent dealings.'
      })

      setReviews([
        {
          id: 1,
          client_name: 'Suresh Kumar',
          rating: 5,
          comment: 'Excellent service! Rahul helped me sell my excavator within 2 weeks. Very professional.',
          date: '2024-11-15',
          deal_type: 'Excavator Sale'
        },
        {
          id: 2,
          client_name: 'Priya Sharma',
          rating: 4,
          comment: 'Good communication and quick response. Found a buyer at a fair price.',
          date: '2024-10-28',
          deal_type: 'Tipper Sale'
        },
        {
          id: 3,
          client_name: 'Amit Patel',
          rating: 5,
          comment: 'Highly recommended! Very knowledgeable about equipment and market prices.',
          date: '2024-10-10',
          deal_type: 'Loader Sale'
        }
      ])
    } catch (error) {
      console.error('Error fetching broker profile:', error)
      toast.error('Failed to load broker profile')
    } finally {
      setLoading(false)
    }
  }

  const handleHireBroker = () => {
    if (!isAuthenticated) {
      toast.error('Please login to hire a broker')
      navigate('/login')
      return
    }

    // Show confirmation
    toast.success('Broker hire request sent! They will contact you shortly.')
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={16}
            className={index < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!broker) {
    return (
      <div className="container py-12 text-center">
        <User size={64} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold mb-4">Broker Not Found</h2>
        <p className="text-gray-600 mb-6">The broker profile you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/brokers')} className="btn btn-primary">
          Browse Brokers
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-800 text-white">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-5xl font-bold border-4 border-white/30">
                {broker.name[0]}
              </div>
              {broker.verified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                  <CheckCircle size={24} className="text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{broker.name}</h1>
                {broker.verified && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Shield size={14} className="mr-1" />
                    Verified
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-blue-100 mb-4">
                <span className="flex items-center">
                  <MapPin size={18} className="mr-2" />
                  {broker.city}, {broker.state}
                </span>
                <span className="flex items-center">
                  <Briefcase size={18} className="mr-2" />
                  {broker.experience_years} years experience
                </span>
                <span className="flex items-center">
                  <Calendar size={18} className="mr-2" />
                  Member since {new Date(broker.member_since).getFullYear()}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Star size={20} className="text-yellow-300 fill-current mr-2" />
                  <span className="text-xl font-bold">{broker.average_rating}</span>
                  <span className="text-blue-100 ml-2">({broker.total_reviews} reviews)</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="font-semibold">{broker.total_deals}</span>
                  <span className="text-blue-100 ml-2">Deals Closed</span>
                </div>
              </div>

              <p className="text-blue-100 mb-6 max-w-2xl">
                {broker.about}
              </p>

              <button
                onClick={handleHireBroker}
                className="bg-white text-primary hover:bg-blue-50 px-8 py-3 rounded-lg font-bold text-lg transition-colors inline-flex items-center"
              >
                <MessageSquare size={20} className="mr-2" />
                Hire This Broker
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Info */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <TrendingUp className="mr-2 text-primary" size={24} />
                Performance Stats
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-bold text-green-600">{broker.success_rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${broker.success_rate}%` }}
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-bold text-blue-600">{broker.response_time}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-600">Active Jobs</span>
                  <span className="font-bold text-gray-800">{broker.active_jobs}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed Deals</span>
                  <span className="font-bold text-gray-800">{broker.total_deals}</span>
                </div>
              </div>
            </div>

            {/* Specialization */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Award className="mr-2 text-primary" size={24} />
                Specialization
              </h2>
              <div className="flex flex-wrap gap-2">
                {broker.specialization.split(',').map((spec, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-primary px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {spec.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Working Areas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <MapPin className="mr-2 text-primary" size={24} />
                Working Cities
              </h2>
              <p className="text-gray-700">{broker.working_cities}</p>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Phone size={18} className="mr-3 text-gray-400" />
                  <span>{broker.phone}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Mail size={18} className="mr-3 text-gray-400" />
                  <span>{broker.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Reviews */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Star className="mr-3 text-yellow-500" size={28} />
                Client Reviews ({broker.total_reviews})
              </h2>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-800">{review.client_name}</h3>
                            <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded font-medium">
                              {review.deal_type}
                            </span>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrokerProfile
