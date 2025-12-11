import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, Mail, Phone, MapPin, Building, Briefcase, Upload, 
  CheckCircle, ChevronRight, Award, TrendingUp, Users, Shield,
  FileText, CreditCard, Eye, ArrowLeft, Clock, Star
} from 'lucide-react'
import toast from 'react-hot-toast'

const BrokerRegister = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    city: '',
    state: '',
    
    // Step 2: Business Info
    company_name: '',
    experience_years: '',
    vehicles_handled: [],
    working_cities: '',
    specialization: '',
    
    // Step 3: Documents
    pan_doc: null,
    aadhar_doc: null,
    gst_doc: null,
    visiting_card: null,
    
    // Step 4: Bank Details
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    account_holder_name: '',
    upi_id: ''
  })

  const vehicleTypes = [
    'Excavators', 'Tippers', 'Loaders', 'Cranes', 'Bulldozers',
    'Backhoe Loaders', 'Motor Graders', 'Compactors', 'Concrete Mixers', 'Dumpers'
  ]

  const steps = [
    { number: 1, title: 'Personal Details', icon: User },
    { number: 2, title: 'Business Info', icon: Briefcase },
    { number: 3, title: 'Documents', icon: FileText },
    { number: 4, title: 'Bank Details', icon: CreditCard },
    { number: 5, title: 'Preview & Submit', icon: Eye }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVehicleToggle = (vehicle) => {
    setFormData(prev => ({
      ...prev,
      vehicles_handled: prev.vehicles_handled.includes(vehicle)
        ? prev.vehicles_handled.filter(v => v !== vehicle)
        : [...prev.vehicles_handled, vehicle]
    }))
  }

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB')
        return
      }
      setFormData(prev => ({ ...prev, [fieldName]: file }))
      toast.success(`${fieldName.replace('_', ' ')} uploaded successfully`)
    }
  }

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.name || !formData.phone || !formData.email || !formData.city || !formData.state) {
          toast.error('Please fill all personal details')
          return false
        }
        break
      case 2:
        if (!formData.company_name || !formData.experience_years || formData.vehicles_handled.length === 0) {
          toast.error('Please complete all business information')
          return false
        }
        break
      case 3:
        if (!formData.pan_doc || !formData.aadhar_doc) {
          toast.error('Please upload at least PAN and Aadhaar documents')
          return false
        }
        break
      case 4:
        if (!formData.account_number || !formData.ifsc_code || !formData.bank_name) {
          toast.error('Please fill all bank details')
          return false
        }
        break
      default:
        return true
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Broker registration submitted successfully!')
      toast.info('Your application is under review. You will be notified within 24-48 hours.')
      
      // Redirect to profile or dashboard
      navigate('/profile?kyc=true')
    } catch (error) {
      console.error('Error submitting registration:', error)
      toast.error('Failed to submit registration. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section - Element 1 */}
      {currentStep === 1 && (
        <div className="bg-gradient-to-r from-primary to-blue-800 text-white py-20">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <span className="flex items-center">
                  <Award size={20} className="mr-2" />
                  Become a Verified Broker
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
                Become a Verified<br />InfraDealer Broker
              </h1>
              
              <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
                Join India's largest heavy equipment marketplace and earn commission on every successful deal
              </p>

              {/* Highlights */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Shield size={40} className="mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Verified Badge</h3>
                  <p className="text-blue-100">Get a verified broker badge and build trust with clients</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <TrendingUp size={40} className="mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Active Listings</h3>
                  <p className="text-blue-100">Access premium listings and connect with verified sellers</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Award size={40} className="mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Earn Commission</h3>
                  <p className="text-blue-100">Earn 2-3% commission on every successful transaction</p>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(1)}
                className="bg-white text-primary px-12 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl inline-flex items-center"
              >
                Start Registration
                <ChevronRight size={20} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form - Element 2 */}
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.number
                const isCompleted = currentStep > step.number
                
                return (
                  <div key={step.number} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isActive ? 'bg-primary text-white ring-4 ring-blue-100' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? <CheckCircle size={24} /> : <Icon size={24} />}
                      </div>
                      <p className={`text-xs mt-2 font-medium text-center ${
                        isActive ? 'text-primary' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-1 flex-1 mx-2 rounded ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <User className="mr-3 text-primary" size={28} />
                  Personal Details
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Your city"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Your state"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Info */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Briefcase className="mr-3 text-primary" size={28} />
                  Business Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Business Name *
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Your company name"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience *
                      </label>
                      <select
                        name="experience_years"
                        value={formData.experience_years}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select experience</option>
                        <option value="0-2">0-2 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="6-10">6-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="e.g., Mining Equipment"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Vehicle Types You Handle * (Select multiple)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vehicleTypes.map(vehicle => (
                        <button
                          key={vehicle}
                          type="button"
                          onClick={() => handleVehicleToggle(vehicle)}
                          className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                            formData.vehicles_handled.includes(vehicle)
                              ? 'border-primary bg-blue-50 text-primary'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {vehicle}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Cities (comma separated)
                    </label>
                    <textarea
                      name="working_cities"
                      value={formData.working_cities}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="e.g., Mumbai, Pune, Nagpur"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <FileText className="mr-3 text-primary" size={28} />
                  Document Upload
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { name: 'pan_doc', label: 'PAN Card', required: true },
                    { name: 'aadhar_doc', label: 'Aadhaar Card', required: true },
                    { name: 'gst_doc', label: 'GST Certificate', required: false },
                    { name: 'visiting_card', label: 'Visiting Card', required: false }
                  ].map(doc => (
                    <div key={doc.name} className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors">
                      <Upload size={40} className="mx-auto mb-3 text-gray-400" />
                      <p className="font-medium mb-2">
                        {doc.label} {doc.required && <span className="text-red-500">*</span>}
                      </p>
                      {formData[doc.name] ? (
                        <div className="text-sm text-green-600 mb-3">
                          <CheckCircle size={16} className="inline mr-1" />
                          {formData[doc.name].name}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mb-3">PDF, JPG or PNG (Max 10MB)</p>
                      )}
                      <label className="inline-block bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
                        {formData[doc.name] ? 'Change File' : 'Upload'}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, doc.name)}
                        />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> All documents will be verified by our admin team. Please ensure documents are clear and readable.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Bank Details */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <CreditCard className="mr-3 text-primary" size={28} />
                  Bank Details for Payouts
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      name="account_holder_name"
                      value={formData.account_holder_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="As per bank records"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        name="account_number"
                        value={formData.account_number}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Your account number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code *
                      </label>
                      <input
                        type="text"
                        name="ifsc_code"
                        value={formData.ifsc_code}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="e.g., HDFC0001234"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="e.g., HDFC Bank"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID (Optional)
                    </label>
                    <input
                      type="text"
                      name="upi_id"
                      value={formData.upi_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="yourname@paytm"
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Secure:</strong> Your bank details are encrypted and will only be used for commission payouts.
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Preview & Submit */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Eye className="mr-3 text-primary" size={28} />
                  Review Your Application
                </h2>

                <div className="space-y-6">
                  {/* Personal Details Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">Personal Details</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-600">Name:</span> <span className="font-medium">{formData.name}</span></div>
                      <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{formData.phone}</span></div>
                      <div><span className="text-gray-600">Email:</span> <span className="font-medium">{formData.email}</span></div>
                      <div><span className="text-gray-600">City:</span> <span className="font-medium">{formData.city}, {formData.state}</span></div>
                    </div>
                  </div>

                  {/* Business Info Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">Business Information</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-600">Company:</span> <span className="font-medium">{formData.company_name}</span></div>
                      <div><span className="text-gray-600">Experience:</span> <span className="font-medium">{formData.experience_years} years</span></div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Vehicles:</span> 
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.vehicles_handled.map(v => (
                            <span key={v} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{v}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">Documents Uploaded</h3>
                    <div className="space-y-2 text-sm">
                      {formData.pan_doc && <div className="flex items-center text-green-600"><CheckCircle size={16} className="mr-2" /> PAN Card</div>}
                      {formData.aadhar_doc && <div className="flex items-center text-green-600"><CheckCircle size={16} className="mr-2" /> Aadhaar Card</div>}
                      {formData.gst_doc && <div className="flex items-center text-green-600"><CheckCircle size={16} className="mr-2" /> GST Certificate</div>}
                      {formData.visiting_card && <div className="flex items-center text-green-600"><CheckCircle size={16} className="mr-2" /> Visiting Card</div>}
                    </div>
                  </div>

                  {/* Bank Details Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">Bank Details</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-600">Account:</span> <span className="font-medium">****{formData.account_number.slice(-4)}</span></div>
                      <div><span className="text-gray-600">IFSC:</span> <span className="font-medium">{formData.ifsc_code}</span></div>
                      <div><span className="text-gray-600">Bank:</span> <span className="font-medium">{formData.bank_name}</span></div>
                      {formData.upi_id && <div><span className="text-gray-600">UPI:</span> <span className="font-medium">{formData.upi_id}</span></div>}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      By submitting this application, you agree to InfraDealer's <button className="underline font-medium">Terms of Service</button> and <button className="underline font-medium">Broker Agreement</button>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Previous
                </button>
              )}

              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  className="ml-auto flex items-center px-8 py-3 bg-primary hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Next Step
                  <ChevronRight size={18} className="ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ml-auto flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} className="mr-2" />
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrokerRegister
