import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { listingsAPI, SERVER_BASE_URL } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  MapPin, 
  Phone, 
  Calendar, 
  Eye, 
  User, 
  Shield, 
  Clock,
  Lock,
  Check,
  Heart,
  Share2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  X,
  Maximize2,
  Home,
  Info,
  Briefcase
} from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import ListingCard from '../components/ListingCard'
import HireBrokerModal from '../components/HireBrokerModal'
import { getPageMeta, generateProductSchema, generateBreadcrumbSchema } from '../utils/seo'

const ListingDetail = () => {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  
  const [listing, setListing] = useState(null)
  const [relatedListings, setRelatedListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [contactUnlocked, setContactUnlocked] = useState(false)
  const [contactInfo, setContactInfo] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [showHireBrokerModal, setShowHireBrokerModal] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await listingsAPI.getListing(id)
        setListing(response.data.listing)
        
        // Fetch related listings
        if (response.data.listing) {
          const relatedRes = await listingsAPI.getListings({ 
            category: response.data.listing.category,
            limit: 6 
          })
          setRelatedListings(relatedRes.data.listings.filter(l => l.id !== parseInt(id)))
        }
      } catch (error) {
        console.error('Error fetching listing:', error)
        toast.error('Failed to load listing details')
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [id])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getDaysAgo = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  const handleUnlockContact = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to unlock seller contact')
      navigate('/login')
      return
    }

    setUnlocking(true)
    try {
      const response = await listingsAPI.unlockContact(id)
      setContactInfo(response.data.contact)
      setContactUnlocked(true)
      toast.success('Contact unlocked successfully')
    } catch (error) {
      console.error('Error unlocking contact:', error)
      toast.error(error.response?.data?.message || 'Failed to unlock contact')
    } finally {
      setUnlocking(false)
    }
  }

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please login to save favorites')
      return
    }
    setIsFavorited(!isFavorited)
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites')
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out this ${listing.category} on InfraDealer`,
          url: url
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    }
  }

  const handleReport = () => {
    if (!isAuthenticated) {
      toast.error('Please login to report listings')
      return
    }
    setShowReportModal(true)
  }

  const submitReport = () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting')
      return
    }
    toast.success('Thank you for reporting. We will review this listing.')
    setShowReportModal(false)
    setReportReason('')
  }

  const nextImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
    }
  }

  const prevImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="container py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Listing not found</h2>
        <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/listings')} className="btn btn-primary">
          Back to Listings
        </button>
      </div>
    )
  }

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : ['placeholder.jpg']

  const pageMeta = getPageMeta('listing-detail', { listing })
  const productSchema = generateProductSchema(listing)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://infradealer.com' },
    { name: 'Listings', url: 'https://infradealer.com/listings' },
    { name: listing.category, url: `https://infradealer.com/listings?category=${listing.category}` },
    { name: listing.title, url: `https://infradealer.com/listing/${listing.id}` }
  ])

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>{pageMeta.title}</title>
        <meta name="description" content={pageMeta.description} />
        <meta name="keywords" content={pageMeta.keywords} />
        <link rel="canonical" href={pageMeta.url} />
        
        <meta property="og:title" content={pageMeta.title} />
        <meta property="og:description" content={pageMeta.description} />
        <meta property="og:url" content={pageMeta.url} />
        <meta property="og:type" content="product" />
        {pageMeta.image && <meta property="og:image" content={pageMeta.image} />}
        <meta property="product:price:amount" content={listing.price} />
        <meta property="product:price:currency" content="INR" />
        
        <meta name="twitter:title" content={pageMeta.title} />
        <meta name="twitter:description" content={pageMeta.description} />
        {pageMeta.image && <meta name="twitter:image" content={pageMeta.image} />}
        <meta name="twitter:card" content="summary_large_image" />
        
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-3">
          <div className="flex items-center text-sm text-gray-600 overflow-x-auto">
            <Link to="/" className="hover:text-primary flex items-center">
              <Home size={16} className="mr-1" />
              Home
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link to="/listings" className="hover:text-primary">
              Listings
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link to={`/listings?category=${listing.category}`} className="hover:text-primary capitalize">
              {listing.category}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-800 truncate">IDR-{listing.id}</span>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Carousel/Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="relative">
                <img
                  src={images[currentImageIndex] !== 'placeholder.jpg' 
                    ? `${SERVER_BASE_URL}/uploads/${images[currentImageIndex]}` 
                    : 'https://via.placeholder.com/800x500?text=No+Image'
                  }
                  alt={listing.title}
                  className="w-full h-96 object-cover cursor-pointer"
                  onClick={() => setShowLightbox(true)}
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-md text-sm font-medium capitalize">
                  {listing.category}
                </div>

                {/* Zoom Button */}
                <button
                  onClick={() => setShowLightbox(true)}
                  className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-md"
                >
                  <Maximize2 size={20} />
                </button>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-md"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-md"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-md text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex p-4 space-x-2 overflow-x-auto scrollbar-hide">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image !== 'placeholder.jpg'
                        ? `${SERVER_BASE_URL}/uploads/${image}` 
                        : 'https://via.placeholder.com/100x100?text=No+Image'
                      }
                      alt={`${listing.title} ${index + 1}`}
                      className={`w-20 h-20 object-cover rounded cursor-pointer transition-all ${
                        currentImageIndex === index 
                          ? 'ring-2 ring-primary opacity-100' 
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Title & Summary Block */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{listing.title}</h1>
              <p className="text-gray-600 mb-4">{listing.make_model || 'Well maintained equipment'}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1 text-primary" />
                  <span>{listing.city}, {listing.area}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1 text-primary" />
                  <span>Posted {getDaysAgo(listing.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <Eye size={16} className="mr-1 text-primary" />
                  <span>{listing.views} views</span>
                </div>
              </div>
            </div>

            {/* Price & Negotiation Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {formatPrice(listing.price)}
                  </div>
                  {listing.negotiable && (
                    <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                      Negotiable
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Last updated {getDaysAgo(listing.updated_at || listing.created_at)}
                </div>
              </div>
            </div>

            {/* Specifications Table */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                {listing.make_model && (
                  <div className="border-b border-gray-200 pb-3">
                    <div className="text-sm text-gray-600 mb-1">Make / Model</div>
                    <div className="font-medium text-gray-800">{listing.make_model}</div>
                  </div>
                )}
                {listing.year && (
                  <div className="border-b border-gray-200 pb-3">
                    <div className="text-sm text-gray-600 mb-1">Year</div>
                    <div className="font-medium text-gray-800">{listing.year}</div>
                  </div>
                )}
                {listing.km && (
                  <div className="border-b border-gray-200 pb-3">
                    <div className="text-sm text-gray-600 mb-1">KMs Driven</div>
                    <div className="font-medium text-gray-800">{listing.km.toLocaleString()} km</div>
                  </div>
                )}
                {listing.fuel_type && (
                  <div className="border-b border-gray-200 pb-3">
                    <div className="text-sm text-gray-600 mb-1">Fuel Type</div>
                    <div className="font-medium text-gray-800 capitalize">{listing.fuel_type}</div>
                  </div>
                )}
                {listing.transmission && (
                  <div className="border-b border-gray-200 pb-3">
                    <div className="text-sm text-gray-600 mb-1">Transmission</div>
                    <div className="font-medium text-gray-800 capitalize">{listing.transmission}</div>
                  </div>
                )}
                {listing.owner_type && (
                  <div className="border-b border-gray-200 pb-3">
                    <div className="text-sm text-gray-600 mb-1">Owner Type</div>
                    <div className="font-medium text-gray-800 capitalize">{listing.owner_type}</div>
                  </div>
                )}
                <div className="border-b border-gray-200 pb-3">
                  <div className="text-sm text-gray-600 mb-1">Location</div>
                  <div className="font-medium text-gray-800">{listing.city}, {listing.area}</div>
                </div>
                <div className="border-b border-gray-200 pb-3">
                  <div className="text-sm text-gray-600 mb-1">Condition</div>
                  <div className="font-medium text-gray-800 capitalize">{listing.condition || 'Used'}</div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            {listing.description && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Description</h2>
                <div className={`text-gray-700 whitespace-pre-line ${!showFullDescription && listing.description.length > 500 ? 'line-clamp-6' : ''}`}>
                  {listing.description}
                </div>
                {listing.description.length > 500 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-primary hover:text-blue-700 font-medium mt-3"
                  >
                    {showFullDescription ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Seller Information Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User size={20} className="mr-2 text-primary" />
                Seller Information
              </h3>
              
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mr-4 text-white font-bold text-xl">
                  {listing.seller_name ? listing.seller_name[0].toUpperCase() : 'S'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-lg">{listing.seller_name || 'Verified Seller'}</div>
                  <div className="flex items-center mt-1">
                    <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded font-medium">
                      {listing.seller_type || 'Dealer'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  <span>{listing.city}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>Member since {new Date(listing.created_at).getFullYear()}</span>
                </div>
              </div>

              <Link 
                to={`/listings?seller=${listing.user_id}`}
                className="text-primary hover:text-blue-700 font-medium text-sm flex items-center"
              >
                View all ads from this seller
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>

            {/* Action Buttons - Unlock Contact */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {contactUnlocked ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center text-green-800 mb-3">
                    <Check size={20} className="mr-2" />
                    <span className="font-semibold">Contact Unlocked</span>
                  </div>
                  <a 
                    href={`tel:${contactInfo}`}
                    className="flex items-center text-green-700 hover:text-green-800 font-medium"
                  >
                    <Phone size={18} className="mr-2" />
                    <span className="text-lg">{contactInfo}</span>
                  </a>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleUnlockContact}
                    disabled={unlocking}
                    className="w-full bg-accent hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center mb-3 transition-colors disabled:opacity-50"
                  >
                    {unlocking ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Lock size={18} className="mr-2" />
                        Unlock Contact — ₹100
                      </>
                    )}
                  </button>
                  <div className="text-xs text-gray-500 text-center">
                    <p>• Uses 1 token from your wallet</p>
                    <p>• Your contact will be shared with seller</p>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleFavorite}
                  className={`flex flex-col items-center justify-center py-3 rounded-lg transition-colors ${
                    isFavorited 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Heart size={20} className={isFavorited ? 'fill-current' : ''} />
                  <span className="text-xs mt-1 font-medium">Save</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex flex-col items-center justify-center py-3 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Share2 size={20} />
                  <span className="text-xs mt-1 font-medium">Share</span>
                </button>

                <button
                  onClick={handleReport}
                  className="flex flex-col items-center justify-center py-3 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <AlertTriangle size={20} />
                  <span className="text-xs mt-1 font-medium">Report</span>
                </button>
              </div>
            </div>

            {/* Hire Broker Button - Element 5 */}
            {user?.id === listing.user_id && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Briefcase size={20} className="mr-2 text-primary" />
                  Need Help Selling?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Hire a verified broker to help you sell faster and get the best price
                </p>
                <button
                  onClick={() => setShowHireBrokerModal(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-primary hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-all"
                >
                  <Briefcase size={18} className="mr-2" />
                  Hire Broker for this Sale
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  • Top rated brokers • 2-3% commission • Fast sale
                </p>
              </div>
            )}

            {/* Safety & Tips Section */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start mb-3">
                <Info size={20} className="text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                <h4 className="font-semibold text-amber-900">Safety Tips</h4>
              </div>
              <ul className="text-sm text-amber-800 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Meet in safe, public places</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Never make advance payments</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Inspect equipment thoroughly</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>InfraDealer never asks for OTPs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Listings Section */}
        {relatedListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Similar Listings Near You</h2>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-6 pb-4">
                {relatedListings.slice(0, 6).map(relatedListing => (
                  <div key={relatedListing.id} className="flex-shrink-0 w-80">
                    <ListingCard listing={relatedListing} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
          >
            <X size={32} />
          </button>
          
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2"
          >
            <ChevronLeft size={40} />
          </button>

          <img
            src={images[currentImageIndex] !== 'placeholder.jpg'
              ? `${SERVER_BASE_URL}/uploads/${images[currentImageIndex]}`
              : 'https://via.placeholder.com/1200x800?text=No+Image'
            }
            alt={listing.title}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2"
          >
            <ChevronRight size={40} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Report this Listing</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Help us understand what's wrong with this listing.
            </p>

            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please describe the issue..."
              className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-primary focus:border-primary"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                className="flex-1 bg-accent hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hire Broker Modal */}
      <HireBrokerModal
        show={showHireBrokerModal}
        onClose={() => setShowHireBrokerModal(false)}
        listingId={listing.id}
        listingCity={listing.city}
      />
    </div>
  )
}

export default ListingDetail
