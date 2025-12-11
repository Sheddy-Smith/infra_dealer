import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Award, Star, MapPin, TrendingUp, Users, Shield, 
  CheckCircle, Building, Filter, Trophy
} from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const VerifiedPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState([])
  const [badges, setBadges] = useState([])
  const [selectedType, setSelectedType] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('')

  useEffect(() => {
    fetchLeaderboard()
    fetchBadgeInfo()
  }, [selectedType, selectedRegion])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setLeaderboard([
        {
          id: 1,
          name: 'Rahul Transport Services',
          city: 'Mumbai',
          state: 'Maharashtra',
          badge: 'trusted_broker',
          rating: 4.9,
          total_sales: 56,
          trust_score: 98
        },
        {
          id: 2,
          name: 'Shivam Heavy Equipment',
          city: 'Pune',
          state: 'Maharashtra',
          badge: 'trusted_dealer',
          rating: 4.8,
          total_sales: 45,
          trust_score: 95
        },
        {
          id: 3,
          name: 'Amit Singh',
          city: 'Nagpur',
          state: 'Maharashtra',
          badge: 'verified_seller',
          rating: 4.7,
          total_sales: 12,
          trust_score: 92
        },
        {
          id: 4,
          name: 'Priya Machinery Solutions',
          city: 'Indore',
          state: 'Madhya Pradesh',
          badge: 'trusted_broker',
          rating: 4.9,
          total_sales: 67,
          trust_score: 99
        },
        {
          id: 5,
          name: 'Kumar Construction Equipment',
          city: 'Bhopal',
          state: 'Madhya Pradesh',
          badge: 'trusted_dealer',
          rating: 4.6,
          total_sales: 38,
          trust_score: 90
        }
      ])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchBadgeInfo = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setBadges([
        {
          type: 'verified_seller',
          name: 'Verified Seller',
          icon: '✅',
          description: 'Identity & documents verified by InfraDealer',
          criteria: 'Complete KYC with valid PAN and business documents',
          color: 'blue'
        },
        {
          type: 'trusted_dealer',
          name: 'Trusted Dealer',
          icon: '🏢',
          description: 'Established dealer with proven track record',
          criteria: '5+ successful sales with verified identity',
          color: 'green'
        },
        {
          type: 'verified_broker',
          name: 'Verified Broker',
          icon: '✅',
          description: 'Background-checked professional broker',
          criteria: 'Complete broker KYC verification',
          color: 'purple'
        },
        {
          type: 'trusted_broker',
          name: 'Trusted Broker',
          icon: '⭐',
          description: 'Top-rated broker with excellent service',
          criteria: '3+ completed deals with 4.0+ rating',
          color: 'yellow'
        }
      ])
    } catch (error) {
      console.error('Error fetching badge info:', error)
    }
  }

  const getBadgeIcon = (badge) => {
    switch(badge) {
      case 'verified_seller':
        return <CheckCircle size={20} className="text-blue-500" />
      case 'trusted_dealer':
        return <Building size={20} className="text-green-500" />
      case 'verified_broker':
        return <Shield size={20} className="text-purple-500" />
      case 'trusted_broker':
        return <Award size={20} className="text-yellow-500" />
      default:
        return <CheckCircle size={20} className="text-gray-500" />
    }
  }

  const getBadgeName = (badge) => {
    const badgeMap = {
      'verified_seller': 'Verified Seller',
      'trusted_dealer': 'Trusted Dealer',
      'verified_broker': 'Verified Broker',
      'trusted_broker': 'Trusted Broker'
    }
    return badgeMap[badge] || badge
  }

  const getRankIcon = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-800 text-white py-16">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <Trophy size={64} className="mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Verified Sellers & Brokers
            </h1>
            <p className="text-xl text-blue-100">
              Meet our top-rated, verified professionals across India
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Badge Information Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Award className="mr-3 text-primary" size={28} />
            Badge Types & Criteria
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {badges.map((badge) => (
              <div
                key={badge.type}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{badge.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{badge.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <strong>Criteria:</strong> {badge.criteria}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <span className="font-semibold text-gray-700">Filter by:</span>
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">All Types</option>
              <option value="broker">Brokers Only</option>
              <option value="dealer">Dealers Only</option>
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">All Regions</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Karnataka">Karnataka</option>
            </select>

            {(selectedType !== 'all' || selectedRegion) && (
              <button
                onClick={() => {
                  setSelectedType('all')
                  setSelectedRegion('')
                }}
                className="text-primary hover:text-blue-700 font-medium text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-blue-700 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Trophy className="mr-3" size={28} />
              Top Verified Professionals
            </h2>
            <p className="text-blue-100 mt-2">
              Ranked by rating, sales, and trust score
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaderboard.map((member, index) => (
                <div
                  key={member.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/brokers/${member.id}`)}
                >
                  <div className="flex items-center gap-6">
                    {/* Rank */}
                    <div className="text-3xl font-bold text-gray-300 w-16 text-center">
                      {getRankIcon(index)}
                    </div>

                    {/* Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                      {member.name[0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                        {getBadgeIcon(member.badge)}
                        <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded font-semibold">
                          {getBadgeName(member.badge)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {member.city}, {member.state}
                        </span>
                        <span className="flex items-center">
                          <Star size={14} className="mr-1 text-yellow-500 fill-current" />
                          {member.rating} Rating
                        </span>
                        <span className="flex items-center">
                          <TrendingUp size={14} className="mr-1" />
                          {member.total_sales} Sales
                        </span>
                      </div>
                    </div>

                    {/* Trust Score */}
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Trust Score</div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${member.trust_score}%` }}
                          />
                        </div>
                        <span className="font-bold text-green-600">{member.trust_score}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {leaderboard.length === 0 && (
                <div className="text-center py-12">
                  <Users size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Found</h3>
                  <p className="text-gray-500">Try adjusting your filters</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-primary text-white rounded-xl p-8 text-center">
          <Award size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Want to Become Verified?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join our verified community! Complete your KYC verification and build your reputation
            to earn badges and climb the leaderboard.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/profile?kyc=true')}
              className="bg-white text-primary hover:bg-blue-50 px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Complete KYC Verification
            </button>
            <button
              onClick={() => navigate('/broker/register')}
              className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Become a Broker
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifiedPage
