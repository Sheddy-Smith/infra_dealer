import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { walletAPI } from '../services/api'
import { 
  Wallet as WalletIcon, Plus, History, CreditCard, CheckCircle, 
  TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, 
  ShieldCheck, Info, AlertCircle, Download, RefreshCw, Clock,
  Award, Lock, Zap, Gift, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const Wallet = () => {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [purchasedTokens, setPurchasedTokens] = useState(0)
  const [selectedTokens, setSelectedTokens] = useState(5)
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('all') // all, credit, debit
  const [showRefundPolicy, setShowRefundPolicy] = useState(false)

  const tokenPackages = [
    { 
      tokens: 1, 
      price: 100, 
      popular: false,
      savings: 0,
      icon: Lock
    },
    { 
      tokens: 5, 
      price: 450, 
      popular: true,
      savings: 50,
      icon: Zap,
      badge: 'Most Popular'
    },
    { 
      tokens: 10, 
      price: 850, 
      popular: false,
      savings: 150,
      icon: Award,
      badge: 'Best Value'
    },
    { 
      tokens: 25, 
      price: 2000, 
      popular: false,
      savings: 500,
      icon: Gift,
      badge: '₹500 Off'
    }
  ]

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await walletAPI.getBalance()
        setBalance(response.data.balance || 0)
        setTransactions(response.data.transactions || [])
      } catch (error) {
        console.error('Error fetching wallet balance:', error)
        toast.error('Failed to load wallet data')
      } finally {
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [])

  const handlePurchaseTokens = async () => {
    setPurchasing(true)
    try {
      const response = await walletAPI.createOrder({ tokens: selectedTokens })
      const { order, key_id } = response.data

      // Initialize Razorpay
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'InfraDealer',
        description: `Purchase ${selectedTokens} tokens`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await walletAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })

            if (verifyResponse.data.success) {
              const newBalance = verifyResponse.data.newBalance
              setBalance(newBalance)
              setPurchasedTokens(selectedTokens)
              setShowPaymentModal(false)
              setShowSuccessModal(true)
              
              // Refresh transactions
              const balanceResponse = await walletAPI.getBalance()
              setTransactions(balanceResponse.data.transactions || [])
              
              toast.success(`${selectedTokens} tokens added successfully!`)
            }
          } catch (error) {
            toast.error('Payment verification failed')
          }
        },
        prefill: {
          contact: user?.phone,
          email: user?.email
        },
        theme: {
          color: '#1565C0'
        },
        modal: {
          ondismiss: function() {
            setPurchasing(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed. Please try again.')
        setPurchasing(false)
      })
      rzp.open()
    } catch (error) {
      console.error('Error purchasing tokens:', error)
      toast.error('Failed to initiate purchase')
      setPurchasing(false)
    }
  }

  const getFilteredTransactions = () => {
    if (filter === 'all') return transactions
    if (filter === 'credit') return transactions.filter(t => t.type === 'credit' || t.type === 'purchase')
    if (filter === 'debit') return transactions.filter(t => t.type === 'debit' || t.type === 'unlock')
    return transactions
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'credit':
      case 'purchase':
        return <ArrowDownCircle size={20} className="text-green-600" />
      case 'debit':
      case 'unlock':
        return <ArrowUpCircle size={20} className="text-red-600" />
      case 'refund':
        return <RefreshCw size={20} className="text-blue-600" />
      default:
        return <Clock size={20} className="text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const filteredTransactions = getFilteredTransactions()
  const selectedPackage = tokenPackages.find(p => p.tokens === selectedTokens)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Token Wallet</h1>
            <p className="text-gray-600">Manage your tokens and view transaction history</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh Balance
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Balance Card - Element 1 */}
            <div className="bg-gradient-to-br from-blue-600 via-primary to-blue-800 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-2">Available Balance</p>
                    <div className="flex items-baseline">
                      <span className="text-6xl font-bold">{balance}</span>
                      <span className="text-2xl ml-2 text-blue-100">tokens</span>
                    </div>
                    <p className="text-blue-100 mt-2 flex items-center">
                      <Info size={14} className="mr-1" />
                      1 Token = ₹100 | Total Value: ₹{balance * 100}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <WalletIcon size={32} />
                  </div>
                </div>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-white text-primary px-6 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg flex items-center justify-center"
                >
                  <Plus size={20} className="mr-2" />
                  Buy Tokens
                </button>
              </div>
            </div>

            {/* Token Pricing & Packs - Element 2 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Token Packages</h2>
                <button
                  onClick={() => setShowRefundPolicy(true)}
                  className="text-sm text-primary hover:text-blue-700 flex items-center"
                >
                  <ShieldCheck size={16} className="mr-1" />
                  Refund Policy
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tokenPackages.map((pkg) => {
                  const Icon = pkg.icon
                  const isSelected = selectedTokens === pkg.tokens
                  
                  return (
                    <div
                      key={pkg.tokens}
                      onClick={() => setSelectedTokens(pkg.tokens)}
                      className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-blue-50 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      {/* Badge */}
                      {pkg.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                            pkg.popular 
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                              : pkg.savings >= 500
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          }`}>
                            {pkg.badge}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-primary' : 'bg-gray-100'
                        }`}>
                          <Icon size={24} className={isSelected ? 'text-white' : 'text-gray-600'} />
                        </div>
                        {isSelected && (
                          <CheckCircle size={24} className="text-primary" />
                        )}
                      </div>

                      <div className="mb-3">
                        <div className="flex items-baseline mb-1">
                          <span className="text-3xl font-bold text-gray-800">{pkg.tokens}</span>
                          <span className="text-gray-500 ml-2">Tokens</span>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-2xl font-bold text-gray-800">₹{pkg.price}</span>
                        {pkg.savings > 0 && (
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-600">
                              Save ₹{pkg.savings}
                            </div>
                            <div className="text-xs text-gray-500 line-through">
                              ₹{pkg.tokens * 100}
                            </div>
                          </div>
                        )}
                      </div>

                      {pkg.savings > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center text-sm text-gray-600">
                            <Sparkles size={14} className="mr-1 text-yellow-500" />
                            <span className="font-medium">
                              ₹{(pkg.price / pkg.tokens).toFixed(2)} per token
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Note:</strong> Prices include GST. All transactions are secure and encrypted.
                </p>
                <div className="flex items-start text-xs text-gray-600">
                  <ShieldCheck size={14} className="mr-2 mt-0.5 flex-shrink-0 text-green-600" />
                  <span>100% secure payment gateway powered by Razorpay. Your data is protected with bank-grade encryption.</span>
                </div>
              </div>
            </div>

            {/* Transaction History - Element 5 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <History size={24} className="mr-2 text-primary" />
                  Transaction History
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('credit')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'credit' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Credits
                  </button>
                  <button
                    onClick={() => setFilter('debit')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'debit' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Debits
                  </button>
                </div>
              </div>

              {filteredTransactions.length > 0 ? (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center flex-1">
                        <div className="mr-4">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {transaction.description || `${transaction.type} Transaction`}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-gray-500">
                              {formatDate(transaction.created_at)}
                            </p>
                            {transaction.ref && (
                              <span className="text-xs text-gray-400 font-mono">
                                Ref: {transaction.ref.slice(0, 12)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`text-lg font-bold ${
                          transaction.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.change > 0 ? '+' : ''}{transaction.change}
                        </p>
                        <p className="text-xs text-gray-500">
                          Balance: {transaction.balance_after}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No transactions yet</h3>
                  <p className="text-gray-500 mb-6">Your transaction history will appear here</p>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Buy Your First Tokens
                  </button>
                </div>
              )}
            </div>

            {/* How Tokens Work */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
              <h2 className="text-xl font-bold mb-6 text-gray-800">How Tokens Work</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Browse Equipment</h3>
                    <p className="text-gray-600 text-sm">Explore our extensive collection of heavy equipment and machinery listings.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Find Equipment</h3>
                    <p className="text-gray-600 text-sm">Find equipment that meets your requirements and budget.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Unlock Contact</h3>
                    <p className="text-gray-600 text-sm">Use 1 token (₹100) to unlock seller's contact information instantly.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0 font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Connect & Deal</h3>
                    <p className="text-gray-600 text-sm">Connect directly with sellers to discuss details and finalize your purchase.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4 text-gray-800">Quick Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp size={20} className="text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Total Purchased</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {transactions.filter(t => t.type === 'credit' || t.type === 'purchase').reduce((sum, t) => sum + Math.abs(t.change), 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingDown size={20} className="text-red-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Total Used</span>
                  </div>
                  <span className="font-bold text-red-600">
                    {transactions.filter(t => t.type === 'debit' || t.type === 'unlock').reduce((sum, t) => sum + Math.abs(t.change), 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <CreditCard size={20} className="text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Transactions</span>
                  </div>
                  <span className="font-bold text-blue-600">{transactions.length}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4 text-gray-800 flex items-center">
                <CreditCard size={20} className="mr-2" />
                Payment Methods
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-white font-bold text-sm">RZP</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Razorpay</div>
                    <div className="text-xs text-gray-500">Secure payment gateway</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-white font-bold text-sm">UPI</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">UPI Payments</div>
                    <div className="text-xs text-gray-500">GooglePay, PhonePe, Paytm</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-white font-bold text-sm">CARD</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Cards</div>
                    <div className="text-xs text-gray-500">Credit/Debit cards</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start">
                  <ShieldCheck size={16} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-800">
                    All payments are processed securely through Razorpay with SSL encryption
                  </p>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
              <h3 className="font-bold mb-2 text-lg">Need Help?</h3>
              <p className="text-sm text-white/90 mb-4">
                Our support team is available 24/7 to assist you with any queries
              </p>
              <button className="w-full bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal - Element 3 */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Confirm Purchase</h3>
              <p className="text-sm text-gray-600 mt-1">Review your token package details</p>
            </div>

            <div className="p-6">
              {selectedPackage && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 mb-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {React.createElement(selectedPackage.icon, { size: 32, className: 'text-primary mr-3' })}
                      <div>
                        <p className="text-2xl font-bold text-gray-800">{selectedPackage.tokens} Tokens</p>
                        {selectedPackage.savings > 0 && (
                          <p className="text-sm text-green-600 font-medium">Save ₹{selectedPackage.savings}</p>
                        )}
                      </div>
                    </div>
                    {selectedPackage.badge && (
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                        {selectedPackage.badge}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Token Package</span>
                      <span className="font-semibold">{selectedPackage.tokens} Tokens</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Package Price</span>
                      <span className="font-semibold">₹{selectedPackage.price}</span>
                    </div>
                    {selectedPackage.savings > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">You Save</span>
                        <span className="font-semibold text-green-600">-₹{selectedPackage.savings}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-800">Total Amount</span>
                        <span className="font-bold text-2xl text-primary">₹{selectedPackage.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle size={18} className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-800">
                    By proceeding, you agree to our <button className="underline font-medium">Terms of Service</button> and <button className="underline font-medium">Refund Policy</button>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchaseTokens}
                  disabled={purchasing}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {purchasing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} className="mr-2" />
                      Pay ₹{selectedPackage?.price}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - Element 4 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl text-center p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-6">
              {purchasedTokens} tokens have been added to your wallet
            </p>

            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Tokens Purchased</span>
                <span className="text-2xl font-bold text-primary">{purchasedTokens}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New Balance</span>
                <span className="text-2xl font-bold text-green-600">{balance}</span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Refund Policy Modal - Element 7 */}
      {showRefundPolicy && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Refund & Dispute Policy</h3>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-3">Refund Eligibility</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle size={18} className="mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    <span>Refunds available within 7 days of token unlock</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={18} className="mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    <span>Full refund if seller contact is fake or listing is fraudulent</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={18} className="mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    <span>Partial refund for duplicate listings (50% token value)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-3">Dispute Process</h4>
                <ol className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-sm">1</span>
                    <div>
                      <p className="font-medium text-gray-800">Submit Dispute</p>
                      <p className="text-sm">Contact support with transaction reference and reason</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-sm">2</span>
                    <div>
                      <p className="font-medium text-gray-800">Investigation</p>
                      <p className="text-sm">Our team reviews your case within 24-48 hours</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-sm">3</span>
                    <div>
                      <p className="font-medium text-gray-800">Resolution</p>
                      <p className="text-sm">Tokens refunded if dispute is valid</p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Unused tokens never expire and can be refunded at any time with a 5% processing fee.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowRefundPolicy(false)}
                className="w-full bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Wallet
