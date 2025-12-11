import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="text-6xl font-bold text-primary mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page not found</h1>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn btn-primary inline-flex items-center justify-center"
          >
            <Home size={18} className="mr-2" />
            Go Home
          </Link>
          <Link
            to="/listings"
            className="btn btn-outline inline-flex items-center justify-center"
          >
            <Search size={18} className="mr-2" />
            Browse Listings
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
