import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Phone, ArrowLeft, Shield, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const otpInputRefs = useRef([])
  const { sendOTP, login } = useAuth()
  const navigate = useNavigate()


  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(30)
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }
    
    setLoading(true)
    const result = await sendOTP(phone)
    setLoading(false)
    
    if (result.success) {
      setShowOtpInput(true)
      startResendTimer()
      toast.success('OTP sent successfully to +91 ' + phone)
      // Auto-focus first OTP input
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100)
    } else {
      toast.error(result.message || 'Failed to send OTP')
    }
  }

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split('')
    while (newOtp.length < 6) newOtp.push('')
    setOtp(newOtp)
    
    // Focus last filled input or next empty
    const lastFilledIndex = pastedData.length - 1
    otpInputRefs.current[Math.min(lastFilledIndex + 1, 5)]?.focus()
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    
    const otpString = otp.join('')
    if (otpString.length < 6) {
      toast.error('Please enter complete 6-digit OTP')
      return
    }
    
    setLoading(true)
    const result = await login(phone, otpString)
    setLoading(false)
    
    if (result.success) {
      toast.success('Login successful!')
      
      // Check if user needs onboarding (role selection)
      if (!result.user?.role || result.user.role === 'pending') {
        navigate('/onboarding')
      } else {
        navigate('/')
      }
    } else {
      toast.error(result.message || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      otpInputRefs.current[0]?.focus()
    }
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0) return
    
    setLoading(true)
    const result = await sendOTP(phone)
    setLoading(false)
    
    if (result.success) {
      startResendTimer()
      toast.success('OTP resent successfully')
      setOtp(['', '', '', '', '', ''])
      otpInputRefs.current[0]?.focus()
    } else {
      toast.error(result.message || 'Failed to resend OTP')
    }
  }

  const handleBack = () => {
    setShowOtpInput(false)
    setOtp(['', '', '', '', '', ''])
    setResendTimer(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Shield size={40} className="text-white" />
          </div>
        </div>
        
        {/* Header */}
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
          {showOtpInput ? 'Verify OTP' : 'Welcome Back'}
        </h2>
        <p className="text-center text-sm text-gray-600 mb-8">
          {showOtpInput 
            ? `We've sent a code to +91 ${phone}`
            : 'Sign in to buy, sell, or trade equipment'
          }
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 sm:px-10 shadow-2xl rounded-2xl border border-gray-100">
          {!showOtpInput ? (
            /* Phone Number Input Form */
            <form className="space-y-6" onSubmit={handleSendOTP}>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone size={20} className="text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">+91</span>
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    maxLength={10}
                    className="w-full pl-24 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  We'll send you a 6-digit OTP for verification
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full bg-primary hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>

              {/* Security Badge */}
              <div className="flex items-center justify-center text-xs text-gray-500 mt-4">
                <Shield size={14} className="mr-1.5 text-green-600" />
                <span>Your data is secure and encrypted</span>
              </div>
            </form>
          ) : (
            /* OTP Verification Form */
            <form className="space-y-6" onSubmit={handleVerifyOTP}>
              {/* Back Button */}
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span className="font-medium">Change number</span>
              </button>

              {/* OTP Input Boxes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                  Enter 6-Digit OTP
                </label>
                <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => otpInputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="w-full bg-primary hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Login'
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend OTP in <span className="font-semibold text-primary">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm text-primary hover:text-blue-700 font-semibold disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Demo Credentials */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 font-medium">Demo Account</span>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-gray-600 mb-2 text-center font-medium">Test Credentials</p>
              <div className="space-y-1 text-center">
                <p className="text-sm text-gray-700">
                  Phone: <span className="font-bold text-primary">9123456789</span>
                </p>
                <p className="text-sm text-gray-700">
                  OTP: <span className="font-bold text-primary">123456</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <p className="mt-6 text-center text-sm text-gray-600">
          By continuing, you agree to our{' '}
          <a href="#" className="text-primary hover:text-blue-700 font-medium">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary hover:text-blue-700 font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login
