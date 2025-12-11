import { Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MobileBottomNav from './components/MobileBottomNav'
import InstallPrompt from './components/InstallPrompt'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import PostAd from './pages/PostAd'
import Wallet from './pages/Wallet'
import MyListings from './pages/MyListings'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import BrokerRegister from './pages/BrokerRegister'
import BrokerDashboard from './pages/BrokerDashboard'
import BrokerProfile from './pages/BrokerProfile'
import VerifiedPage from './pages/VerifiedPage'
import NotFound from './pages/NotFound'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/broker/register" element={<BrokerRegister />} />
            <Route path="/brokers/:id" element={<BrokerProfile />} />
            <Route path="/verified" element={<VerifiedPage />} />
            {isAuthenticated ? (
              <>
                <Route path="/post-ad" element={<PostAd />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/broker/dashboard" element={<BrokerDashboard />} />
              </>
            ) : null}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <MobileBottomNav />
        <InstallPrompt />
      </div>
    </HelmetProvider>
  )
}

export default App
