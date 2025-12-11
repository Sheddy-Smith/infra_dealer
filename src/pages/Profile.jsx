import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI, walletAPI, SERVER_BASE_URL } from '../services/api'
import { 
  User, Mail, Phone, MapPin, Building, FileText, Camera, Save, LogOut, 
  Heart, Wallet as WalletIcon, ShoppingBag, TrendingUp, CheckCircle, 
  Clock, AlertCircle, Edit3, Upload, Shield, Trash2, Settings, 
  CreditCard, Activity, Award, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import ListingCard from '../components/ListingCard'


const Profile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const showKYC = searchParams.get('kyc') === 'true'
  
  const [activeTab, setActiveTab] = useState(showKYC ? 'kyc' : 'profile')
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    city: '',
    state: '',
    company_name: '',
    gst_number: '',
    pan_number: '',
    profile_photo: null
  })
  const [kycData, setKycData] = useState({
    business_name: '',
    address: '',
    city: '',
    pincode: '',
    pan_doc: null,
    aadhar_doc: null,
    gst_doc: null,
    status: 'pending'
  })
  const [walletBalance, setWalletBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [favorites, setFavorites] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch profile
        const profileResponse = await authAPI.getProfile()
        const userData = profileResponse.data.user
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          city: userData.city || '',
          state: userData.state || '',
          company_name: userData.company_name || '',
          gst_number: userData.gst_number || '',
          pan_number: userData.pan_number || '',
          profile_photo: userData.profile_photo || null
        })
        
        if (userData.profile_photo) {
          setPhotoPreview(`${SERVER_BASE_URL}/uploads/${userData.profile_photo}`)
        }

        // Fetch wallet balance
        try {
          const walletResponse = await walletAPI.getBalance()
          setWalletBalance(walletResponse.data.balance || 0)
          setTransactions(walletResponse.data.transactions?.slice(0, 5) || [])
        } catch (err) {
          console.log('Wallet data not available')
        }

        // Mock favorites and activities (replace with API calls when available)
        setFavorites([])
        setActivities([
          { id: 1, action: 'Created a listing', timestamp: new Date(), icon: 'plus' },
          { id: 2, action: 'Bought 3 tokens', timestamp: new Date(Date.now() - 86400000), icon: 'wallet' }
        ])

      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load profile data')
      } finally {
        setInitialLoading(false)
      }
    }

    fetchAllData()
  }, [])


  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      setProfileData(prev => ({ ...prev, profile_photo: file }))
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleKYCFileUpload = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB')
        return
      }
      setKycData(prev => ({ ...prev, [fieldName]: file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData()
      Object.keys(profileData).forEach(key => {
        if (profileData[key]) {
          formData.append(key, profileData[key])
        }
      })

      await authAPI.updateProfile(formData)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleKYCSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData()
      Object.keys(kycData).forEach(key => {
        if (kycData[key] && key !== 'status') {
          formData.append(key, kycData[key])
        }
      })

      // Mock KYC submission (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('KYC documents submitted for verification!')
      setKycData(prev => ({ ...prev, status: 'pending' }))
    } catch (error) {
      console.error('Error submitting KYC:', error)
      toast.error('Failed to submit KYC documents')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (newRole) => {
    try {
      await authAPI.updateProfile({ role: newRole })
      toast.success('Role updated successfully!')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // Mock delete account (implement actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Account deleted successfully')
      logout()
      navigate('/')
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  const getProfileCompletion = () => {
    const fields = ['name', 'email', 'city', 'profile_photo']
    if (user?.role === 'broker') {
      fields.push('company_name', 'gst_number')
    }
    const completed = fields.filter(field => profileData[field]).length
    return Math.round((completed / fields.length) * 100)
  }

  const getActivityIcon = (type) => {
    switch(type) {
      case 'plus': return <ShoppingBag size={16} className="text-blue-500" />
      case 'wallet': return <WalletIcon size={16} className="text-green-500" />
      case 'edit': return <Edit3 size={16} className="text-orange-500" />
      default: return <Activity size={16} className="text-gray-500" />
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const completionPercentage = getProfileCompletion()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <User size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white text-primary p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <Camera size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profileData.name || 'Your Name'}</h1>
                {user?.role === 'broker' && (
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Award size={14} className="mr-1" />
                    Verified Broker
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-blue-100 mb-3">
                <Phone size={16} />
                <span>{user?.phone}</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm capitalize">
                  {user?.role || 'User'}
                </span>
                {profileData.city && (
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {profileData.city}
                  </span>
                )}
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => setActiveTab('profile')}
              className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
            >
              <Edit3 size={18} className="mr-2" />
              Edit Profile
            </button>
          </div>

          {/* Profile Completion Indicator */}
          {completionPercentage < 100 && (
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm font-bold">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {!profileData.name && <span className="bg-white/20 px-2 py-1 rounded">Add name</span>}
                {!profileData.email && <span className="bg-white/20 px-2 py-1 rounded">Add email</span>}
                {!profileData.city && <span className="bg-white/20 px-2 py-1 rounded">Add location</span>}
                {!profileData.profile_photo && <span className="bg-white/20 px-2 py-1 rounded">Upload photo</span>}
                {user?.role === 'broker' && kycData.status === 'pending' && (
                  <span className="bg-white/20 px-2 py-1 rounded">Complete KYC</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'profile', label: 'Profile Info', icon: User },
              { id: 'wallet', label: 'Wallet', icon: WalletIcon },
              { id: 'favorites', label: 'Saved Items', icon: Heart },
              ...(user?.role === 'broker' ? [{ id: 'kyc', label: 'KYC Documents', icon: Shield }] : []),
              { id: 'activity', label: 'My Activity', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} className="mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Profile Info Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <User className="mr-2 text-primary" size={24} />
                  Personal Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Your city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={profileData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Your state"
                    />
                  </div>

                  {(user?.role === 'seller' || user?.role === 'broker') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          name="company_name"
                          value={profileData.company_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Your company name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GST Number
                        </label>
                        <input
                          type="text"
                          name="gst_number"
                          value={profileData.gst_number}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="GST Number (Optional)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PAN Number
                        </label>
                        <input
                          type="text"
                          name="pan_number"
                          value={profileData.pan_number}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="PAN Number (Optional)"
                        />
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full bg-primary hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Wallet Tab */}
            {activeTab === 'wallet' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <WalletIcon className="mr-2 text-primary" size={24} />
                  Wallet & Tokens
                </h2>

                {/* Balance Card */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Current Balance</p>
                      <p className="text-4xl font-bold">{walletBalance} Tokens</p>
                      <p className="text-sm opacity-75 mt-1">₹{walletBalance * 100} value</p>
                    </div>
                    <CreditCard size={48} className="opacity-50" />
                  </div>
                  <button
                    onClick={() => navigate('/wallet')}
                    className="mt-4 bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Buy Tokens
                  </button>
                </div>

                {/* Transaction History */}
                <h3 className="font-semibold mb-4">Recent Transactions</h3>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((txn, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            <TrendingUp size={20} className={txn.type === 'credit' ? 'text-green-600' : 'text-red-600'} />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">{txn.description}</p>
                            <p className="text-sm text-gray-500">{new Date(txn.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`font-semibold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.type === 'credit' ? '+' : '-'}{txn.amount} tokens
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <WalletIcon size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No transactions yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Heart className="mr-2 text-primary" size={24} />
                  Saved Listings
                </h2>

                {favorites.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {favorites.map(listing => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart size={64} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved items yet</h3>
                    <p className="text-gray-500 mb-6">Start saving your favorite equipment</p>
                    <button
                      onClick={() => navigate('/listings')}
                      className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      Browse Listings
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* KYC Tab (Broker only) */}
            {activeTab === 'kyc' && user?.role === 'broker' && (
              <form onSubmit={handleKYCSubmit} className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Shield className="mr-2 text-primary" size={24} />
                  KYC Verification
                </h2>

                {/* KYC Status */}
                <div className={`mb-6 p-4 rounded-lg border-2 ${
                  kycData.status === 'approved' ? 'bg-green-50 border-green-200' :
                  kycData.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center">
                    {kycData.status === 'approved' ? (
                      <CheckCircle size={24} className="text-green-600 mr-3" />
                    ) : kycData.status === 'pending' ? (
                      <Clock size={24} className="text-yellow-600 mr-3" />
                    ) : (
                      <AlertCircle size={24} className="text-gray-600 mr-3" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {kycData.status === 'approved' ? 'KYC Approved' :
                         kycData.status === 'pending' ? 'KYC Under Review' :
                         'KYC Not Submitted'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {kycData.status === 'approved' ? 'Your documents are verified' :
                         kycData.status === 'pending' ? 'We will review your documents within 24-48 hours' :
                         'Complete KYC to get verified dealer badge'}
                      </p>
                    </div>
                  </div>
                </div>

                {kycData.status !== 'approved' && (
                  <>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name *
                        </label>
                        <input
                          type="text"
                          value={kycData.business_name}
                          onChange={(e) => setKycData(prev => ({ ...prev, business_name: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Your business name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={kycData.city}
                          onChange={(e) => setKycData(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="City"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Address *
                        </label>
                        <textarea
                          value={kycData.address}
                          onChange={(e) => setKycData(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Full business address"
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          value={kycData.pincode}
                          onChange={(e) => setKycData(prev => ({ ...prev, pincode: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="6-digit pincode"
                          maxLength={6}
                        />
                      </div>
                    </div>

                    <h3 className="font-semibold mb-4">Upload Documents</h3>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      {['pan_doc', 'aadhar_doc', 'gst_doc'].map((docType) => (
                        <div key={docType} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                          <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                          <p className="text-sm font-medium mb-2 capitalize">{docType.replace('_', ' ')}</p>
                          <label className="text-xs text-primary hover:text-blue-700 cursor-pointer">
                            {kycData[docType] ? 'Change File' : 'Upload'}
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => handleKYCFileUpload(e, docType)}
                            />
                          </label>
                          {kycData[docType] && (
                            <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || kycData.status === 'pending'}
                      className="w-full bg-primary hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload size={18} className="mr-2" />
                          Submit for Verification
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Activity className="mr-2 text-primary" size={24} />
                  My Activity
                </h2>

                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start p-4 bg-gray-50 rounded-lg">
                        <div className="mr-3 mt-1">{getActivityIcon(activity.icon)}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{activity.action}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Activity size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Settings className="mr-2 text-primary" size={24} />
                  Account Settings
                </h2>

                <div className="space-y-6">
                  {/* Change Role */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold mb-3">Change Role</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['buyer', 'seller', 'broker'].map(role => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(role)}
                          className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                            user?.role === role
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logout */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <button
                      onClick={logout}
                      className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                    >
                      <LogOut size={18} className="mr-2" />
                      Logout
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
                    <h3 className="font-semibold text-red-800 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-600 mb-3">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center text-red-600 hover:text-red-700 font-medium"
                    >
                      <Trash2 size={18} className="mr-2" />
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/my-listings')}
                  className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <ShoppingBag size={20} className="text-blue-600 mr-3" />
                    <span className="font-medium">My Listings</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>

                <button
                  onClick={() => navigate('/wallet')}
                  className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <WalletIcon size={20} className="text-green-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">Wallet Balance</p>
                      <p className="text-sm text-gray-600">{walletBalance} tokens</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>

                <button
                  onClick={() => setActiveTab('favorites')}
                  className="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Heart size={20} className="text-red-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">Saved Items</p>
                      <p className="text-sm text-gray-600">{favorites.length} items</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Account Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">Jan 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Status</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification</span>
                  <span className="font-medium">
                    {user?.role === 'broker' && kycData.status === 'approved' ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-gray-500">Not Verified</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertCircle size={24} className="text-red-600 mr-3" />
              <h3 className="text-xl font-bold">Delete Account?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All your data, listings, and wallet balance will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  handleDeleteAccount()
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
