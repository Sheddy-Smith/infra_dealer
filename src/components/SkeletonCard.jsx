const SkeletonCard = () => {
  return (
    <div className="card animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-square bg-gray-200 skeleton"></div>
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded skeleton"></div>
        
        {/* Location */}
        <div className="h-4 bg-gray-200 rounded w-3/4 skeleton"></div>
        
        {/* Seller info */}
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-1/2 skeleton"></div>
        </div>
        
        {/* Details */}
        <div className="h-4 bg-gray-200 rounded w-2/3 skeleton"></div>
        
        {/* Price and button */}
        <div className="flex justify-between items-end mt-4">
          <div className="space-y-2">
            <div className="h-7 bg-gray-200 rounded w-24 skeleton"></div>
            <div className="h-3 bg-gray-200 rounded w-20 skeleton"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-20 skeleton"></div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonCard
