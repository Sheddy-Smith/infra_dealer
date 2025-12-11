import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listingsAPI, verificationAPI, SERVER_BASE_URL } from '../services/api'
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Copy,
  RefreshCw,
  CheckSquare,
  Search,
  Filter,
  MoreVertical,
  Package,
  FileText,
  TrendingUp,
  Archive
} from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const MyListings = () => {
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [filteredListings, setFilteredListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedListings, setSelectedListings] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [actionMenuOpen, setActionMenuOpen] = useState(null)

  const tabs = [
    { id: 'all', label: 'All', icon: Package },
    { id: 'active', label: 'Active', icon: CheckCircle },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'draft', label: 'Draft', icon: FileText },
    { id: 'sold', label: 'Sold', icon: TrendingUp },
    { id: 'expired', label: 'Expired', icon: Archive }
  ]

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await listingsAPI.getUserListings()
        setListings(response.data.listings)
        setFilteredListings(response.data.listings)
      } catch (error) {
        console.error('Error fetching listings:', error)
        toast.error('Failed to load your listings')
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  useEffect(() => {
    filterListings()
  }, [activeTab, searchQuery, listings])

  useEffect(() => {
    setShowBulkActions(selectedListings.length > 0)
  }, [selectedListings])

  const filterListings = () => {
    let filtered = [...listings]

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(listing => {
        if (activeTab === 'active') return listing.status === 'approved'
        if (activeTab === 'pending') return listing.status === 'pending'
        if (activeTab === 'draft') return listing.status === 'draft'
        if (activeTab === 'sold') return listing.status === 'sold'
        if (activeTab === 'expired') return listing.status === 'expired'
        return true
      })
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredListings(filtered)
  }

  const getStats = () => {
    return {
      total: listings.length,
      active: listings.filter(l => l.status === 'approved').length,
      pending: listings.filter(l => l.status === 'pending').length,
      draft: listings.filter(l => l.status === 'draft').length,
      sold: listings.filter(l => l.status === 'sold').length,
      expired: listings.filter(l => l.status === 'expired').length
    }
  }

  const stats = getStats()

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircle },
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: FileText },
      sold: { color: 'bg-blue-100 text-blue-800', label: 'Sold', icon: TrendingUp },
      expired: { color: 'bg-orange-100 text-orange-800', label: 'Expired', icon: Archive }
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} className="mr-1" />
        {config.label}
      </span>
    )
  }

  const handleSelectListing = (id) => {
    setSelectedListings(prev =>
      prev.includes(id) ? prev.filter(listingId => listingId !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([])
    } else {
      setSelectedListings(filteredListings.map(l => l.id))
    }
  }

  const handleEdit = (listing) => {
    navigate(`/post-ad?edit=${listing.id}`)
    toast.success('Opening listing editor...')
  }

  const handleDuplicate = (listing) => {
    toast.success('Creating a copy as draft...')
    // API call to duplicate
    setTimeout(() => {
      toast.success('Listing duplicated successfully')
    }, 1000)
  }

  const handleRenew = async (listing) => {
    try {
      toast.loading('Renewing listing for 30 days...', { id: 'renew' })
      
      const response = await verificationAPI.renewListing(listing.id)
      
      // Update local state
      setListings(prev => prev.map(l => 
        l.id === listing.id 
          ? { ...l, status: 'approved', expiry_date: response.data.expiry_date } 
          : l
      ))
      
      toast.success('Listing renewed successfully for 30 days!', { id: 'renew' })
    } catch (error) {
      console.error('Error renewing listing:', error)
      toast.error('Failed to renew listing', { id: 'renew' })
    }
  }

  const handleMarkSold = (listing) => {
    toast.success('Marking as sold...')
    // API call to mark sold
    setTimeout(() => {
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: 'sold' } : l))
      toast.success('Marked as sold')
    }, 1000)
  }

  const handleDelete = (listing) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      toast.success('Deleting listing...')
      // API call to delete
      setTimeout(() => {
        setListings(prev => prev.filter(l => l.id !== listing.id))
        toast.success('Listing deleted', {
          action: {
            label: 'Undo',
            onClick: () => toast.success('Listing restored')
          }
        })
      }, 1000)
    }
  }

  const handleBulkAction = (action) => {
    const count = selectedListings.length
    switch (action) {
      case 'delete':
        if (confirm(`Delete ${count} selected listing(s)?`)) {
          toast.success(`Deleting ${count} listing(s)...`)
          setTimeout(() => {
            setListings(prev => prev.filter(l => !selectedListings.includes(l.id)))
            setSelectedListings([])
            toast.success(`${count} listing(s) deleted`)
          }, 1000)
        }
        break
      case 'sold':
        toast.success(`Marking ${count} listing(s) as sold...`)
        setTimeout(() => {
          setListings(prev => prev.map(l => 
            selectedListings.includes(l.id) ? { ...l, status: 'sold' } : l
          ))
          setSelectedListings([])
          toast.success(`${count} listing(s) marked as sold`)
        }, 1000)
        break
      case 'renew':
        toast.success(`Renewing ${count} listing(s)...`)
        setTimeout(() => {
          setSelectedListings([])
          toast.success(`${count} listing(s) renewed for 30 days`)
        }, 1000)
        break
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">My Listings</h1>
          <button
            onClick={() => navigate('/post-ad')}
            className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors shadow-md"
          >
            <Plus size={20} className="mr-2" />
            Post New Ad
          </button>
        </div>

        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <Package className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-800">{stats.draft}</p>
              </div>
              <FileText className="text-gray-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sold</p>
                <p className="text-2xl font-bold text-gray-800">{stats.sold}</p>
              </div>
              <TrendingUp className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-800">{stats.expired}</p>
              </div>
              <Archive className="text-orange-500" size={32} />
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => {
              const Icon = tab.icon
              const count = stats[tab.id === 'all' ? 'total' : tab.id]
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSelectedListings([])
                  }}
                  className={`flex items-center px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} className="mr-2" />
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={18} className="mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {showBulkActions && (
          <div className="bg-primary text-white rounded-lg shadow-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <CheckSquare size={20} className="mr-3" />
              <span className="font-medium">{selectedListings.length} listing(s) selected</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('renew')}
                className="bg-white text-primary px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Renew
              </button>
              <button
                onClick={() => handleBulkAction('sold')}
                className="bg-white text-primary px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center"
              >
                <TrendingUp size={16} className="mr-2" />
                Mark Sold
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Listings Table/Card View */}
        {filteredListings.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedListings.length === filteredListings.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Listing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedListings.includes(listing.id)}
                          onChange={() => handleSelectListing(listing.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={listing.images && listing.images.length > 0
                              ? `${SERVER_BASE_URL}/uploads/${listing.images[0]}`
                              : 'https://via.placeholder.com/80x80?text=No+Image'
                            }
                            alt={listing.title}
                            className="w-16 h-16 object-cover rounded-lg mr-4"
                          />
                          <div>
                            <div className="font-medium text-gray-800">{listing.title}</div>
                            <div className="text-sm text-gray-500 capitalize">{listing.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {formatPrice(listing.price)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(listing.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center">
                          <Eye size={16} className="mr-1 text-gray-400" />
                          {listing.views || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(listing.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(listing)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(listing)}
                            className="text-gray-600 hover:text-gray-800 p-2"
                            title="Duplicate"
                          >
                            <Copy size={18} />
                          </button>
                          <button
                            onClick={() => handleRenew(listing)}
                            className="text-green-600 hover:text-green-800 p-2"
                            title="Renew"
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button
                            onClick={() => handleMarkSold(listing)}
                            className="text-purple-600 hover:text-purple-800 p-2"
                            title="Mark as Sold"
                          >
                            <TrendingUp size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(listing)}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="p-4">
                  <div className="flex items-start mb-3">
                    <input
                      type="checkbox"
                      checked={selectedListings.includes(listing.id)}
                      onChange={() => handleSelectListing(listing.id)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-1 mr-3"
                    />
                    <img
                      src={listing.images && listing.images.length > 0
                        ? `${SERVER_BASE_URL}/uploads/${listing.images[0]}`
                        : 'https://via.placeholder.com/100x100?text=No+Image'
                      }
                      alt={listing.title}
                      className="w-20 h-20 object-cover rounded-lg mr-3"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">{listing.title}</h3>
                      <p className="text-sm text-gray-500 capitalize mb-2">{listing.category}</p>
                      {getStatusBadge(listing.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-primary">{formatPrice(listing.price)}</div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Eye size={14} className="mr-1" />
                      {listing.views || 0} views
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    Posted {formatDate(listing.created_at)}
                  </div>

                  <div className="flex gap-2 overflow-x-auto">
                    <button
                      onClick={() => handleEdit(listing)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100"
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(listing)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-50 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-100"
                    >
                      <Copy size={14} className="mr-1" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === listing.id ? null : listing.id)}
                      className="px-3 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>

                  {actionMenuOpen === listing.id && (
                    <div className="mt-2 bg-gray-50 rounded-lg p-2 space-y-1">
                      <button
                        onClick={() => { handleRenew(listing); setActionMenuOpen(null); }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-white rounded"
                      >
                        <RefreshCw size={14} className="mr-2" />
                        Renew for 30 days
                      </button>
                      <button
                        onClick={() => { handleMarkSold(listing); setActionMenuOpen(null); }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-white rounded"
                      >
                        <TrendingUp size={14} className="mr-2" />
                        Mark as Sold
                      </button>
                      <button
                        onClick={() => { handleDelete(listing); setActionMenuOpen(null); }}
                        className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-white rounded"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State Screens */
          <div className="bg-white rounded-lg shadow-sm text-center py-20">
            {activeTab === 'all' && (
              <>
                <div className="text-gray-300 text-8xl mb-4">📋</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No listings yet</h3>
                <p className="text-gray-500 mb-6">Click "Post New Ad" to start selling your equipment</p>
                <button
                  onClick={() => navigate('/post-ad')}
                  className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center transition-colors"
                >
                  <Plus size={18} className="mr-2" />
                  Post Your First Ad
                </button>
              </>
            )}
            {activeTab === 'active' && (
              <>
                <CheckCircle className="mx-auto text-gray-300 mb-4" size={80} />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No active listings</h3>
                <p className="text-gray-500 mb-6">Your listings may be under review or expired</p>
              </>
            )}
            {activeTab === 'draft' && (
              <>
                <FileText className="mx-auto text-gray-300 mb-4" size={80} />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No drafts yet</h3>
                <p className="text-gray-500 mb-6">Click "Create Listing" to start a draft</p>
                <button
                  onClick={() => navigate('/post-ad')}
                  className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center transition-colors"
                >
                  <Plus size={18} className="mr-2" />
                  Create Listing
                </button>
              </>
            )}
            {activeTab === 'pending' && (
              <>
                <Clock className="mx-auto text-gray-300 mb-4" size={80} />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No pending approvals</h3>
                <p className="text-gray-500">All your listings have been reviewed</p>
              </>
            )}
            {activeTab === 'sold' && (
              <>
                <TrendingUp className="mx-auto text-gray-300 mb-4" size={80} />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No sold items</h3>
                <p className="text-gray-500">Mark listings as sold when you complete a sale</p>
              </>
            )}
            {activeTab === 'expired' && (
              <>
                <Archive className="mx-auto text-gray-300 mb-4" size={80} />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No expired listings</h3>
                <p className="text-gray-500">Listings expire after 90 days of inactivity</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => navigate('/post-ad')}
        className="lg:hidden fixed bottom-6 right-6 bg-accent hover:bg-orange-600 text-white p-4 rounded-full shadow-2xl transition-colors z-40"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}

export default MyListings
