import { Link } from 'react-router-dom'
import { MapPin, Eye, Calendar, CheckCircle, Award, Building, Shield } from 'lucide-react'
import { SERVER_BASE_URL } from '../services/api'

const ListingCard = ({ listing }) => {
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

  const getBadgeInfo = (badge) => {
    const badges = {
      'verified_seller': { icon: CheckCircle, color: 'text-blue-500', label: 'Verified' },
      'trusted_dealer': { icon: Building, color: 'text-green-500', label: 'Trusted Dealer' },
      'verified_broker': { icon: Shield, color: 'text-purple-500', label: 'Verified' },
      'trusted_broker': { icon: Award, color: 'text-yellow-500', label: 'Trusted' }
    }
    return badges[badge] || null
  }

  const badgeInfo = listing.seller_badge ? getBadgeInfo(listing.seller_badge) : null
  const BadgeIcon = badgeInfo?.icon

  return (
    <Link to={`/listings/${listing.id}`} className="block group">
      <div className="card hover:shadow-xl transition-all duration-300">
        <div className="relative overflow-hidden">
          <img
            src={listing.images && listing.images.length > 0 
              ? `${SERVER_BASE_URL}/uploads/${listing.images[0]}` 
              : 'https://via.placeholder.com/400x400?text=No+Image'
            }
            alt={`${listing.title} - ${listing.category} for sale in ${listing.city}${listing.year ? ` (${listing.year})` : ''}`}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
            {listing.category}
          </div>
          {listing.views > 100 && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
              <Eye size={12} />
              {listing.views}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-text-primary group-hover:text-primary transition-colors">{listing.title}</h3>
          
          <div className="flex items-center text-text-secondary text-sm mb-3">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span className="truncate">{listing.city}, {listing.area}</span>
          </div>

          {/* Element 5: Trust Metrics - Seller Info with Badge */}
          {listing.seller_name && (
            <div className="flex items-center gap-2 text-sm text-text-primary mb-3 pb-3 border-b border-gray-100">
              <span className="font-medium truncate">{listing.seller_name}</span>
              {badgeInfo && (
                <div className="flex items-center gap-1 group/badge relative flex-shrink-0">
                  <BadgeIcon size={16} className={badgeInfo.color} />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                    {badgeInfo.label} - Identity verified by InfraDealer
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
              {listing.seller_rating && (
                <span className="text-xs font-semibold text-warning flex-shrink-0">★ {listing.seller_rating}</span>
              )}
            </div>
          )}
          
          {listing.make_model && (
            <div className="text-text-secondary text-sm mb-3 flex flex-wrap gap-2">
              <span className="font-medium">{listing.make_model}</span>
              {listing.year && <span className="text-gray-400">•</span>}
              {listing.year && <span>{listing.year}</span>}
              {listing.km && <span className="text-gray-400">•</span>}
              {listing.km && <span>{listing.km.toLocaleString()} km</span>}
            </div>
          )}
          
          <div className="flex justify-between items-end mt-4">
            <div>
              <div className="price text-primary group-hover:scale-105 transition-transform origin-left">
                {formatPrice(listing.price)}
              </div>
              <div className="flex items-center text-text-secondary text-xs mt-1">
                <Calendar size={12} className="mr-1" />
                <span>{formatDate(listing.created_at)}</span>
              </div>
            </div>
            <button className="btn btn-primary text-sm px-4 py-2">
              View
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ListingCard
