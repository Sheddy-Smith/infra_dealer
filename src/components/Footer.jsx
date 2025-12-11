import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, Truck } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity">
              <Truck size={32} className="text-primary" />
              <span className="text-2xl font-bold">InfraDealer</span>
            </Link>
            <p className="text-gray-400 mb-4 leading-relaxed text-sm">
              <strong className="text-white">Verified Machines. Genuine Deals.</strong><br />
              India's most trusted platform for commercial vehicles and heavy equipment. Jahan har deal verified hoti hai.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/listings" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Browse Equipment
                </Link>
              </li>
              <li>
                <Link to="/verified" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Verified Sellers
                </Link>
              </li>
              <li>
                <Link to="/post-ad" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Post Ad
                </Link>
              </li>
              <li>
                <Link to="/wallet" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Wallet
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Categories</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/listings?category=trucks" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Trucks
                </Link>
              </li>
              <li>
                <Link to="/listings?category=tippers" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Tippers
                </Link>
              </li>
              <li>
                <Link to="/listings?category=excavator" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Excavators
                </Link>
              </li>
              <li>
                <Link to="/listings?category=crane" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Cranes
                </Link>
              </li>
              <li>
                <Link to="/listings?category=buses" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Buses
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Support</h3>
            <ul className="space-y-2.5 mb-6">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Contact Us
                </a>
              </li>
            </ul>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Phone size={16} className="flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Mail size={16} className="flex-shrink-0" />
                <span>info@infradealer.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>&copy; {currentYear} InfraDealer. All rights reserved.</p>
            <p className="text-center">
              Made with ❤️ in India | Serving buyers and sellers across the nation
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
