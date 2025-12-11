import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ShoppingCart, Store, Briefcase, CheckCircle, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'

const Onboarding = () => {
  const [selectedRole, setSelectedRole] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const roles = [
    {
      id: 'buyer',
      title: 'Buyer',
      icon: ShoppingCart,
      description: 'Looking to purchase heavy equipment for your projects',
      benefits: [
        'Browse verified listings',
        'Contact sellers directly',
        'Save favorite equipment',
        'Get price alerts'
      ],
      color: 'blue'
    },
    {
      id: 'seller',
      title: 'Seller',
      icon: Store,
      description: 'Want to sell your equipment and reach buyers nationwide',
      benefits: [
        'Post unlimited ads',
        'Manage your listings',
        'Track views & leads',
        'Get payment support'
      ],
      color: 'green'
    },
    {
      id: 'broker',
      title: 'Broker / Dealer',
      icon: Briefcase,
      description: 'Professional dealer or broker with multiple listings',
      benefits: [
        'Verified dealer badge',
        'Priority listing placement',
        'Advanced analytics',
        'Bulk upload tools'
      ],
      color: 'purple',
      badge: 'KYC Required'
    }
  ]

  const handleContinue = async () => {
    if (!selectedRole) {
      toast.error('Please select your role')
      return
    }

    setLoading(true)
    try {
      await authAPI.updateProfile({ role: selectedRole })
      toast.success('Profile updated successfully!')
      
      // Redirect based on role
      if (selectedRole === 'broker') {
        navigate('/profile?kyc=true')
      } else {
        navigate('/')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Welcome to InfraDealer! 👋
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let's personalize your experience. Choose your role to get started.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon
            const isSelected = selectedRole === role.id
            
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? `border-${role.color}-500 bg-${role.color}-50 shadow-xl scale-105`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-2 shadow-lg">
                    <CheckCircle size={24} />
                  </div>
                )}

                {/* Badge */}
                {role.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                      {role.badge}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${
                  isSelected ? `bg-${role.color}-500` : `bg-${role.color}-100`
                }`}>
                  <Icon size={32} className={isSelected ? 'text-white' : `text-${role.color}-600`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{role.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{role.description}</p>

                {/* Benefits */}
                <ul className="space-y-2">
                  {role.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <CheckCircle size={16} className={`mr-2 mt-0.5 flex-shrink-0 ${
                        isSelected ? `text-${role.color}-500` : 'text-gray-400'
                      }`} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className="bg-primary hover:bg-blue-700 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Setting up your account...
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={20} className="ml-3" />
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't worry, you can change your role anytime from your profile settings
        </p>
      </div>
    </div>
  )
}

export default Onboarding
