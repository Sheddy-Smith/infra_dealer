import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { listingsAPI, uploadAPI } from '../services/api'
import { Camera, X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const PostAd = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    make_model: '',
    year: '',
    km: '',
    price: '',
    description: '',
    city: '',
    area: '',
    seller_contact: ''
  })
  
  const [images, setImages] = useState([])
  const [previewImages, setPreviewImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const categories = [
    { id: '', name: 'Select Category' },
    { id: 'trucks', name: 'Trucks' },
    { id: 'jcb', name: 'JCB' },
    { id: 'excavator', name: 'Excavator' },
    { id: 'road-roller', name: 'Road Roller' },
    { id: 'crane', name: 'Crane' },
    { id: 'dumper', name: 'Dumper' }
  ]

  const cities = [
    { id: '', name: 'Select City' },
    { id: 'mumbai', name: 'Mumbai' },
    { id: 'delhi', name: 'Delhi' },
    { id: 'bangalore', name: 'Bangalore' },
    { id: 'hyderabad', name: 'Hyderabad' },
    { id: 'pune', name: 'Pune' },
    { id: 'chennai', name: 'Chennai' }
  ]

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to post an ad')
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    
    if (images.length + files.length > 6) {
      toast.error('You can upload up to 6 images')
      return
    }
    
    setImages(prev => [...prev, ...files])
    
    // Create preview URLs
    const newPreviewImages = files.map(file => URL.createObjectURL(file))
    setPreviewImages(prev => [...prev, ...newPreviewImages])
  }

  const removeImage = (index) => {
    const newImages = [...images]
    const newPreviewImages = [...previewImages]
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index])
    
    newImages.splice(index, 1)
    newPreviewImages.splice(index, 1)
    
    setImages(newImages)
    setPreviewImages(newPreviewImages)
  }

  const uploadImages = async () => {
    if (images.length === 0) return []
    
    setUploading(true)
    const formData = new FormData()
    
    images.forEach(image => {
      formData.append('images', image)
    })
    
    try {
      const response = await uploadAPI.uploadImages(formData)
      return response.data.files.map(file => file.original)
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Failed to upload images')
      return []
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.title || !formData.category || !formData.price || !formData.city || !formData.seller_contact) {
      toast.error('Please fill all required fields')
      return
    }
    
    setLoading(true)
    
    try {
      // Upload images first
      const uploadedImages = await uploadImages()
      
      // Submit listing data
      await listingsAPI.createListing({
        ...formData,
        images: uploadedImages
      })
      
      toast.success('Listing posted successfully! It will be visible after admin approval.')
      navigate('/my-listings')
    } catch (error) {
      console.error('Error creating listing:', error)
      toast.error(error.response?.data?.message || 'Failed to post ad')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Post Your Ad</h1>
        <p className="text-text-secondary mb-8">Your listing will be active for 30 days and visible to thousands of buyers across India</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card">
            <h2 className="text-xl font-semibold mb-6">Equipment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., JCB 3DX Super"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Make & Model
                </label>
                <input
                  type="text"
                  name="make_model"
                  value={formData.make_model}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., JCB 3DX Super"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., 2019"
                  min="1990"
                  max={new Date().getFullYear()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kilometers
                </label>
                <input
                  type="number"
                  name="km"
                  value={formData.km}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., 25000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., 1850000"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="input"
                placeholder="Describe your equipment, condition, features, etc."
              ></textarea>
            </div>
            
            <h2 className="text-xl font-semibold mb-6">Location & Contact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., Andheri"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="seller_contact"
                  value={formData.seller_contact}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., +919876543210"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full btn btn-primary"
            >
              {loading || uploading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {uploading ? 'Uploading Images...' : 'Posting Ad...'}
                </div>
              ) : (
                'Post Ad'
              )}
            </button>
          </form>
        </div>
        
        <div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Upload Photos</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photos (Max 6)
              </label>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {previewImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {images.length < 6 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-gray-50">
                    <Plus size={20} className="text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                <p>• Add clear photos of the equipment</p>
                <p>• Include front, back, and side views</p>
                <p>• Show any damages or special features</p>
              </div>
            </div>
          </div>
          
          <div className="card mt-6">
            <h3 className="text-lg font-semibold mb-4">Posting Guidelines</h3>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Provide accurate and detailed information</p>
              <p>• Include clear photos from different angles</p>
              <p>• Set a realistic price based on market value</p>
              <p>• Be responsive to buyer inquiries</p>
              <p>• Your listing will be reviewed before publishing</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default PostAd
