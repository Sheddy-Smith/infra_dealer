import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { listingsAPI } from '../services/api'
import { Search, MapPin, Shield, Award, CheckCircle, ChevronRight, TrendingUp } from 'lucide-react'
import ListingCard from '../components/ListingCard'
import LoadingSpinner from '../components/LoadingSpinner'

const Home = () => {
  const navigate = useNavigate()
  const [featuredListings, setFeaturedListings] = useState([])
  const [latestListings, setLatestListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)

  const categories = [
    { id: 'trucks', name: 'Trucks', icon: '🚚' },
    { id: 'buses', name: 'Buses', icon: '🚌' },
    { id: 'dumpers', name: 'Dumpers', icon: '🚛' },
    { id: 'tippers', name: 'Tippers', icon: '🏗️' },
    { id: 'excavator', name: 'Excavators', icon: '🦾' },
    { id: 'road-roller', name: 'Rollers', icon: '🚧' },
    { id: 'crushers', name: 'Crushers', icon: '⚙️' },
    { id: 'crane', name: 'Cranes', icon: '🏗️' },
    { id: 'loaders', name: 'Loaders', icon: '🚜' },
    { id: 'others', name: 'Others', icon: '📦' }
  ]

  const cities = [
    { id: 'indore', name: 'Indore' },
    { id: 'bhopal', name: 'Bhopal' },
    { id: 'mumbai', name: 'Mumbai' },
    { id: 'delhi', name: 'Delhi' },
    { id: 'ahmedabad', name: 'Ahmedabad' },
    { id: 'nagpur', name: 'Nagpur' },
    { id: 'jaipur', name: 'Jaipur' },
    { id: 'pune', name: 'Pune' },
    { id: 'raipur', name: 'Raipur' },
    { id: 'hyderabad', name: 'Hyderabad' }
  ]

  const whyInfraDealer = [
    {
      icon: <Shield size={40} className="text-primary" />,
      title: '30-Day Active Listings',
      description: 'Every listing stays live for 30 days, ensuring only genuine and current deals appear on the platform'
    },
    {
      icon: <Award size={40} className="text-primary" />,
      title: '₹100 Token Contact Unlock',
      description: 'Unlock seller contacts using affordable ₹100 tokens, eliminating spam and fake leads'
    },
    {
      icon: <CheckCircle size={40} className="text-primary" />,
      title: 'KYC Verified Brokers',
      description: 'Hire verified brokers with admin-backed KYC verification and rating-driven reputation'
    }
  ]

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const [featuredRes, latestRes] = await Promise.all([
          listingsAPI.getListings({ limit: 6, featured: true }),
          listingsAPI.getListings({ limit: 9, sort: 'newest' })
        ])
        setFeaturedListings(featuredRes.data.listings.slice(0, 6))
        setLatestListings(latestRes.data.listings)
      } catch (error) {
        console.error('Error fetching listings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  // Auto-slide for featured carousel
  useEffect(() => {
    if (featuredListings.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredListings.length / 4))
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [featuredListings])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCity) params.set('city', selectedCity)
    navigate(`/listings?${params.toString()}`)
  }

  return (
    <div className="bg-bg">
      {/* Hero Search Section - OLX Style */}
      <section className="bg-gradient-to-br from-blue-600 via-primary to-blue-700 text-white py-16 md:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
              Where Heavy Machines Meet Genuine Buyers
            </h1>
            <p className="text-lg md:text-xl mb-2 text-blue-50 font-medium">
              India's First Dedicated Marketplace for Commercial Vehicles & Heavy Machinery
            </p>
            <p className="text-md text-blue-100 mb-8">
              Verified Sellers • ₹100 Token System • 30-Day Active Listings • KYC Verified Brokers
            </p>
            
            {/* Big Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-2xl p-2 md:p-3 flex flex-col md:flex-row gap-2 md:gap-0 animate-fade-in">
              <div className="flex-1 flex items-center px-4 md:border-r border-gray-200">
                <Search size={20} className="text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search trucks, tippers, excavators..."
                  className="w-full py-3 outline-none text-gray-800 text-base placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center px-4 md:border-r border-gray-200 min-w-[180px]">
                <MapPin size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                <select
                  className="w-full py-3 outline-none text-gray-700 bg-transparent cursor-pointer"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="">All India</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-accent text-white px-8 py-3 rounded-lg font-bold text-base md:text-lg">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Category Chips - Scrollable Horizontal */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container">
          <h3 className="text-xl font-bold text-text-primary mb-4">Browse by Category</h3>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 pb-2 min-w-max">
              {categories.map(category => (
                <Link
                  key={category.id}
                  to={`/listings?category=${category.id}`}
                  className="flex flex-col items-center justify-center bg-gray-50 hover:bg-primary hover:shadow-md transition-all rounded-xl p-5 min-w-[110px] group border border-gray-100"
                >
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{category.icon}</div>
                  <span className="font-semibold text-sm text-center text-text-primary group-hover:text-white">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings Carousel */}
      {!loading && featuredListings.length > 0 && (
        <section className="py-12 bg-bg">
          <div className="container">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-text-primary">Featured Listings</h2>
                <p className="text-text-secondary mt-1">Handpicked verified equipment</p>
              </div>
              <Link to="/listings" className="text-primary hover:text-primary-dark font-semibold flex items-center gap-1 transition-colors">
                View All <ChevronRight size={20} />
              </Link>
            </div>
            
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(featuredListings.length / 4) }).map((_, slideIndex) => (
                    <div key={slideIndex} className="min-w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredListings.slice(slideIndex * 4, slideIndex * 4 + 4).map(listing => (
                          <ListingCard key={listing.id} listing={listing} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Carousel Indicators */}
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: Math.ceil(featuredListings.length / 4) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentSlide === index ? 'bg-primary w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Listings Grid */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-text-primary">Latest Listings</h2>
              <p className="text-text-secondary mt-1">Fresh equipment added today</p>
            </div>
            <Link to="/listings" className="text-primary hover:text-primary-dark font-semibold flex items-center gap-1 transition-colors">
              View All <ChevronRight size={20} />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ad/Promo Banner */}
      <section className="py-16 bg-gradient-to-r from-accent to-red-600">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between text-white gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Want to Sell Your Equipment?</h2>
              <p className="text-xl text-red-50">Post your ad for 30 days and reach thousands of verified buyers • Optional broker hire available</p>
            </div>
            <Link to="/post-ad" className="btn bg-white text-accent hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg shadow-xl whitespace-nowrap">
              Post Your Ad Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by City */}
      <section className="py-12 bg-bg">
        <div className="container">
          <h2 className="text-3xl font-bold text-text-primary mb-2 text-center">Browse by City</h2>
          <p className="text-text-secondary text-center mb-8">Find equipment in your area</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {cities.map((city) => (
              <Link
                key={city.id}
                to={`/listings?city=${city.id}`}
                className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-primary hover:shadow-md transition-all group"
              >
                <MapPin size={24} className="mx-auto mb-2 text-primary" />
                <span className="text-text-primary font-semibold group-hover:text-primary">{city.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why InfraDealer Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-text-primary">Why InfraDealer?</h2>
          <p className="text-center text-text-secondary mb-12 text-lg">Making buying, selling, and brokering safer, faster, and more transparent</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyInfraDealer.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg group">
                <div className="flex justify-center mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-text-primary">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PWA/App Download CTA */}
      <section className="py-12 bg-gradient-to-r from-primary to-blue-700 text-white">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Get InfraDealer on Your Device</h2>
              <p className="text-blue-100 text-lg">Access thousands of equipment listings anytime, anywhere</p>
            </div>
            <button className="btn bg-white text-primary hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2 whitespace-nowrap">
              <TrendingUp size={20} />
              Add to Home Screen
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
