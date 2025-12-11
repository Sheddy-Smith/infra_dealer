import { Shield, Award, CheckCircle, Users, TrendingUp, Clock } from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: <Clock size={48} className="text-primary" />,
      title: '30-Day Active Period',
      description: 'Every listing comes with a 30-day active period, ensuring only live and authentic deals appear on the site. Sellers can renew listings to keep them active.'
    },
    {
      icon: <Award size={48} className="text-primary" />,
      title: '₹100 Token System',
      description: 'Buyers can explore detailed listings and unlock seller contacts using simple ₹100 tokens, eliminating spam and fake leads from both sides.'
    },
    {
      icon: <Users size={48} className="text-primary" />,
      title: 'Verified Broker Network',
      description: 'Sellers can choose to hire verified brokers who manage inquiries, negotiations, and inspections — helping close deals efficiently with commission-based payments.'
    },
    {
      icon: <Shield size={48} className="text-primary" />,
      title: 'KYC Verification',
      description: 'Special KYC-based registration system for brokers, granting them verified badges and access to active listings from across India with admin-backed verification.'
    },
    {
      icon: <CheckCircle size={48} className="text-primary" />,
      title: 'Rating System',
      description: 'Rating-driven reputation model helps buyers identify trusted brokers and sellers, creating a transparent ecosystem for all transactions.'
    },
    {
      icon: <TrendingUp size={48} className="text-primary" />,
      title: 'Secure Platform',
      description: 'Combining transparency, verification, and technology to redefine India\'s heavy vehicle market with secure payments and admin oversight.'
    }
  ]

  return (
    <div className="bg-bg min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-blue-700 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About InfraDealer</h1>
            <p className="text-xl md:text-2xl text-blue-50 font-medium">
              Where Heavy Machines Meet Genuine Buyers
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="card mb-12">
              <h2 className="text-3xl font-bold text-text-primary mb-6">India's First Dedicated Marketplace</h2>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p className="text-lg">
                  InfraDealer is <strong className="text-text-primary">India's first dedicated digital marketplace</strong> for commercial vehicles and heavy machinery, built to make the buying, selling, and brokering of industrial transport safer, faster, and more transparent.
                </p>
                <p className="text-lg">
                  From trucks, buses, dumpers, tippers, excavators, rollers, and crushers to every essential equipment used in construction and logistics — InfraDealer connects <strong className="text-text-primary">verified sellers, serious buyers, and trusted brokers</strong> under one secure platform.
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">How InfraDealer Works</h2>
              
              {/* For Sellers */}
              <div className="card mb-8">
                <h3 className="text-2xl font-bold text-primary mb-4">For Sellers</h3>
                <ul className="space-y-3 text-text-secondary">
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                    <span>Post your equipment listing for free with a <strong className="text-text-primary">30-day active period</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                    <span>Add detailed descriptions, photos, and specifications to attract genuine buyers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                    <span>Choose to <strong className="text-text-primary">hire verified brokers</strong> who manage inquiries, negotiations, and inspections</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                    <span>Renew listings easily to keep them active after expiry</span>
                  </li>
                </ul>
              </div>

              {/* For Buyers */}
              <div className="card mb-8">
                <h3 className="text-2xl font-bold text-primary mb-4">For Buyers</h3>
                <ul className="space-y-3 text-text-secondary">
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                    <span>Browse thousands of verified equipment listings across India</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                    <span>View detailed specifications, photos, and seller information</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                    <span>Unlock seller contacts using <strong className="text-text-primary">₹100 tokens</strong>, eliminating spam and fake leads</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                    <span>Connect directly with verified sellers or their appointed brokers</span>
                  </li>
                </ul>
              </div>

              {/* For Brokers */}
              <div className="card">
                <h3 className="text-2xl font-bold text-primary mb-4">For Brokers</h3>
                <ul className="space-y-3 text-text-secondary">
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                    <span>Complete <strong className="text-text-primary">KYC-based registration</strong> with admin-backed verification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                    <span>Get verified badges and access to active listings from across India</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                    <span>Manage multiple client listings and earn commission-based income</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                    <span>Build reputation through <strong className="text-text-primary">rating-driven reviews</strong> from clients</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Key Features */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">What Makes Us Different</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="card text-center group hover:shadow-lg">
                    <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-3">{feature.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Who Can Use */}
            <div className="card mb-12 bg-gradient-to-br from-blue-50 to-white border border-blue-100">
              <h2 className="text-3xl font-bold text-text-primary mb-6 text-center">Who Can Use InfraDealer?</h2>
              <div className="grid md:grid-cols-2 gap-6 text-text-secondary">
                <div>
                  <h4 className="font-bold text-lg text-text-primary mb-2">✅ Dealers</h4>
                  <p>List multiple vehicles and equipment with professional profiles</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-text-primary mb-2">✅ Fleet Owners</h4>
                  <p>Sell commercial vehicles from your fleet with ease</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-text-primary mb-2">✅ Individual Sellers</h4>
                  <p>Post single equipment or vehicles for quick sales</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-text-primary mb-2">✅ Transport Brokers</h4>
                  <p>Register as verified brokers and earn commissions</p>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="card bg-gradient-to-r from-primary to-blue-700 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-xl leading-relaxed text-blue-50">
                To simplify every step of the resale journey by combining <strong>transparency, verification, and technology</strong> — redefining India's heavy vehicle market and creating a trusted ecosystem for commercial vehicle transactions.
              </p>
              <p className="text-2xl font-bold mt-6">
                InfraDealer — Where Heavy Machines Meet Genuine Buyers
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
