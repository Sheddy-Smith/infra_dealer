import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { listingsAPI } from '../services/api'
import ListingCard from '../components/ListingCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Search, ChevronDown, ChevronUp, X, SlidersHorizontal, MapPin } from 'lucide-react'
import { getPageMeta } from '../utils/seo'

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState({})
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    yearFrom: searchParams.get('yearFrom') || '',
    yearTo: searchParams.get('yearTo') || '',
    sellerType: searchParams.get('sellerType') || '',
    condition: searchParams.get('condition') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1
  })
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    city: true,
    price: true,
    year: false,
    sellerType: false,
    condition: false
  })

  const categories = [
    { id: 'trucks', name: 'Trucks', count: 0 },
    { id: 'tippers', name: 'Tippers', count: 0 },
    { id: 'jcb', name: 'JCB', count: 0 },
    { id: 'excavator', name: 'Excavator', count: 0 },
    { id: 'road-roller', name: 'Road Roller', count: 0 },
    { id: 'crane', name: 'Crane', count: 0 },
    { id: 'dumper', name: 'Dumper', count: 0 },
    { id: 'buses', name: 'Buses', count: 0 },
    { id: 'tractors', name: 'Tractors', count: 0 },
    { id: 'loaders', name: 'Loaders', count: 0 }
  ]

  const cities = [
    { id: 'indore', name: 'Indore', count: 0 },
    { id: 'bhopal', name: 'Bhopal', count: 0 },
    { id: 'mumbai', name: 'Mumbai', count: 0 },
    { id: 'delhi', name: 'Delhi', count: 0 },
    { id: 'ahmedabad', name: 'Ahmedabad', count: 0 },
    { id: 'nagpur', name: 'Nagpur', count: 0 },
    { id: 'jaipur', name: 'Jaipur', count: 0 },
    { id: 'pune', name: 'Pune', count: 0 },
    { id: 'raipur', name: 'Raipur', count: 0 },
    { id: 'hyderabad', name: 'Hyderabad', count: 0 }
  ]

  const sellerTypes = [
    { id: 'dealer', name: 'Dealer' },
    { id: 'individual', name: 'Individual' },
    { id: 'broker', name: 'Broker' }
  ]

  const conditions = [
    { id: 'used', name: 'Used' },
    { id: 'new', name: 'New' }
  ]

  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'price_low', name: 'Lowest Price' },
    { id: 'price_high', name: 'Highest Price' },
    { id: 'oldest', name: 'Oldest First' }
  ]

  const priceRanges = [
    { id: '0-500000', label: 'Under ₹5 Lakh', min: 0, max: 500000 },
    { id: '500000-1000000', label: '₹5-10 Lakh', min: 500000, max: 1000000 },
    { id: '1000000-2000000', label: '₹10-20 Lakh', min: 1000000, max: 2000000 },
    { id: '2000000-5000000', label: '₹20-50 Lakh', min: 2000000, max: 5000000 },
    { id: '5000000-', label: 'Above ₹50 Lakh', min: 5000000, max: null }
  ]

  useEffect(() => {
    const fetchListings = async () => {
      const isLoadMore = filters.page > 1 && listings.length > 0
      
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      
      try {
        const params = { ...filters }
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === undefined) {
            delete params[key]
          }
        })
        
        const response = await listingsAPI.getListings(params)
        
        if (isLoadMore) {
          setListings(prev => [...prev, ...response.data.listings])
        } else {
          setListings(response.data.listings)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        
        setPagination(response.data.pagination)
      } catch (error) {
        console.error('Error fetching listings:', error)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    }

    fetchListings()
  }, [filters])

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleCategoryChange = (categoryId) => {
    const newCategory = filters.category === categoryId ? '' : categoryId
    setFilters(prev => ({ ...prev, category: newCategory, page: 1 }))
    updateURL({ ...filters, category: newCategory, page: 1 })
  }

  const handleCityChange = (cityId) => {
    const newCity = filters.city === cityId ? '' : cityId
    setFilters(prev => ({ ...prev, city: newCity, page: 1 }))
    updateURL({ ...filters, city: newCity, page: 1 })
  }

  const handleSellerTypeChange = (type) => {
    const newType = filters.sellerType === type ? '' : type
    setFilters(prev => ({ ...prev, sellerType: newType, page: 1 }))
    updateURL({ ...filters, sellerType: newType, page: 1 })
  }

  const handleConditionChange = (condition) => {
    const newCondition = filters.condition === condition ? '' : condition
    setFilters(prev => ({ ...prev, condition: newCondition, page: 1 }))
    updateURL({ ...filters, condition: newCondition, page: 1 })
  }

  const handlePriceRangeChange = (range) => {
    setFilters(prev => ({ 
      ...prev, 
      minPrice: range.min, 
      maxPrice: range.max || '', 
      page: 1 
    }))
    updateURL({ 
      ...filters, 
      minPrice: range.min, 
      maxPrice: range.max || '', 
      page: 1 
    })
  }

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }))
  }

  const handleCitySelectChange = (e) => {
    setFilters(prev => ({ ...prev, city: e.target.value, page: 1 }))
    updateURL({ ...filters, city: e.target.value, page: 1 })
  }

  const handleSortChange = (e) => {
    setFilters(prev => ({ ...prev, sort: e.target.value, page: 1 }))
    updateURL({ ...filters, sort: e.target.value, page: 1 })
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, page: 1 }))
    updateURL({ ...filters, page: 1 })
  }

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      yearFrom: '',
      yearTo: '',
      sellerType: '',
      condition: '',
      search: '',
      sort: 'newest',
      page: 1
    }
    setFilters(clearedFilters)
    updateURL(clearedFilters)
  }

  const hasActiveFilters = () => {
    return filters.category || filters.city || filters.minPrice || filters.maxPrice || 
           filters.yearFrom || filters.yearTo || filters.sellerType || filters.condition
  }

  const loadMore = () => {
    setFilters(prev => ({ ...prev, page: prev.page + 1 }))
    updateURL({ ...filters, page: filters.page + 1 })
  }

  const updateURL = (params) => {
    const newParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== undefined) {
        newParams.set(key, params[key])
      }
    })
    setSearchParams(newParams)
  }

  const getResultsSummary = () => {
    const total = pagination.total || 0
    let summary = `Showing ${total} result${total !== 1 ? 's' : ''}`
    
    const categoryName = categories.find(c => c.id === filters.category)?.name
    const cityName = cities.find(c => c.id === filters.city)?.name
    
    if (categoryName) {
      summary += ` for ${categoryName}`
    }
    if (cityName) {
      summary += ` in ${cityName}`
    }
    
    return summary
  }

  const pageMeta = getPageMeta('listings', { 
    category: categories.find(c => c.id === filters.category)?.name || '',
    city: cities.find(c => c.id === filters.city)?.name || ''
  })

  const FilterSidebar = () => (
    <div className="bg-white rounded-lg shadow-sm sticky top-20">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <SlidersHorizontal size={20} className="mr-2" />
          Filters
        </h2>
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-accent hover:text-orange-600 text-sm font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
        {/* Category Filter */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('category')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-800">Category</span>
            {expandedSections.category ? (
              <ChevronUp size={20} className="text-gray-600" />
            ) : (
              <ChevronDown size={20} className="text-gray-600" />
            )}
          </button>
          {expandedSections.category && (
            <div className="px-4 pb-4 space-y-2">
              {categories.map(category => (
                <label
                  key={category.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.category === category.id}
                    onChange={() => handleCategoryChange(category.id)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-gray-700 flex-1">{category.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* City Filter */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('city')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-800">City / Location</span>
            {expandedSections.city ? (
              <ChevronUp size={20} className="text-gray-600" />
            ) : (
              <ChevronDown size={20} className="text-gray-600" />
            )}
          </button>
          {expandedSections.city && (
            <div className="px-4 pb-4 space-y-2">
              {cities.map(city => (
                <label
                  key={city.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.city === city.id}
                    onChange={() => handleCityChange(city.id)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-gray-700 flex-1">{city.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('price')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-800">Price Range</span>
            {expandedSections.price ? (
              <ChevronUp size={20} className="text-gray-600" />
            ) : (
              <ChevronDown size={20} className="text-gray-600" />
            )}
          </button>
          {expandedSections.price && (
            <div className="px-4 pb-4 space-y-2">
              {priceRanges.map(range => (
                <label
                  key={range.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.minPrice == range.min && (filters.maxPrice == range.max || (!filters.maxPrice && !range.max))}
                    onChange={() => handlePriceRangeChange(range)}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="text-gray-700">{range.label}</span>
                </label>
              ))}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, minPrice: e.target.value, page: 1 }))
                    }}
                    className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, maxPrice: e.target.value, page: 1 }))
                    }}
                    className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Year Filter */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('year')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-800">Year Range</span>
            {expandedSections.year ? (
              <ChevronUp size={20} className="text-gray-600" />
            ) : (
              <ChevronDown size={20} className="text-gray-600" />
            )}
          </button>
          {expandedSections.year && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="From"
                  value={filters.yearFrom}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, yearFrom: e.target.value, page: 1 }))
                  }}
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  min="1990"
                  max={new Date().getFullYear()}
                />
                <input
                  type="number"
                  placeholder="To"
                  value={filters.yearTo}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, yearTo: e.target.value, page: 1 }))
                  }}
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  min="1990"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          )}
        </div>

        {/* Seller Type Filter */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('sellerType')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-800">Seller Type</span>
            {expandedSections.sellerType ? (
              <ChevronUp size={20} className="text-gray-600" />
            ) : (
              <ChevronDown size={20} className="text-gray-600" />
            )}
          </button>
          {expandedSections.sellerType && (
            <div className="px-4 pb-4 space-y-2">
              {sellerTypes.map(type => (
                <label
                  key={type.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <input
                    type="radio"
                    name="sellerType"
                    checked={filters.sellerType === type.id}
                    onChange={() => handleSellerTypeChange(type.id)}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="text-gray-700">{type.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Condition Filter */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('condition')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-800">Condition</span>
            {expandedSections.condition ? (
              <ChevronUp size={20} className="text-gray-600" />
            ) : (
              <ChevronDown size={20} className="text-gray-600" />
            )}
          </button>
          {expandedSections.condition && (
            <div className="px-4 pb-4 space-y-2">
              {conditions.map(condition => (
                <label
                  key={condition.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <input
                    type="radio"
                    name="condition"
                    checked={filters.condition === condition.id}
                    onChange={() => handleConditionChange(condition.id)}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="text-gray-700 capitalize">{condition.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Search Header Bar */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="container py-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-4">
              <Search size={20} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search for equipment..."
                className="w-full py-2 bg-transparent outline-none text-gray-800"
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg px-4 min-w-[180px]">
              <MapPin size={18} className="text-gray-400 mr-2" />
              <select
                className="w-full py-2 bg-transparent outline-none text-gray-700"
                value={filters.city}
                onChange={handleCitySelectChange}
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
            >
              <SlidersHorizontal size={18} className="mr-2" />
              Filters
            </button>
          </form>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <FilterSidebar />
          </aside>

          {/* Mobile Filter Drawer */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                  <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="pb-4">
                  <FilterSidebar />
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1">
            <Helmet>
              <title>{pageMeta.title}</title>
              <meta name="description" content={pageMeta.description} />
              <meta name="keywords" content={pageMeta.keywords} />
              <link rel="canonical" href={pageMeta.url} />
              
              <meta property="og:title" content={pageMeta.title} />
              <meta property="og:description" content={pageMeta.description} />
              <meta property="og:url" content={pageMeta.url} />
              <meta property="og:type" content="website" />
              
              <meta name="twitter:title" content={pageMeta.title} />
              <meta name="twitter:description" content={pageMeta.description} />
            </Helmet>

            {/* Results Summary & Sort */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {getResultsSummary()}
                  </p>
                  {hasActiveFilters() && (
                    <p className="text-sm text-gray-600 mt-1">
                      Active filters applied
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select 
                    value={filters.sort}
                    onChange={handleSortChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    {sortOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Load More / Pagination */}
                {pagination.totalPages > filters.page && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}

                {/* Page info */}
                <div className="text-center mt-4 text-sm text-gray-600">
                  Showing {listings.length} of {pagination.total} listings
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-lg shadow-sm text-center py-20">
                <div className="text-gray-300 text-8xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No listings found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  We couldn't find any equipment matching your search criteria. Try adjusting your filters or search terms.
                </p>
                {hasActiveFilters() ? (
                  <button
                    onClick={clearFilters}
                    className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <a
                    href="/post-ad"
                    className="inline-block bg-accent hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Post Your Own Ad
                  </a>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer CTA Banner */}
      {!loading && listings.length > 0 && (
        <div className="bg-gradient-to-r from-primary to-blue-700 text-white py-12 mt-12">
          <div className="container text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Didn't find what you're looking for?
            </h2>
            <p className="text-lg text-blue-100 mb-6">
              Post your requirement and let sellers reach out to you
            </p>
            <a
              href="/post-ad"
              className="inline-block bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-lg font-bold text-lg shadow-lg transition-colors"
            >
              Post Your Requirement Now →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default Listings
