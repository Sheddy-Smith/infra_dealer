// SEO utility functions for dynamic meta tags and structured data

export const generateProductSchema = (listing) => {
  if (!listing) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": listing.title,
    "description": listing.description,
    "image": listing.images && listing.images.length > 0 
      ? listing.images.map(img => `https://infradealer.com${img}`)
      : [],
    "brand": {
      "@type": "Brand",
      "name": listing.manufacturer || "Heavy Equipment"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://infradealer.com/listing/${listing.id}`,
      "priceCurrency": "INR",
      "price": listing.price,
      "availability": listing.status === "available" 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "InfraDealer"
      }
    },
    "category": listing.category,
    "itemCondition": listing.condition === "new" 
      ? "https://schema.org/NewCondition" 
      : "https://schema.org/UsedCondition"
  };
};

export const generateBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

export const getPageMeta = (page, data = {}) => {
  const baseTitle = "InfraDealer - Heavy Equipment Marketplace";
  const baseMeta = {
    description: "Buy & sell heavy equipment, trucks, excavators, JCB & construction machinery in India.",
    keywords: "heavy equipment, construction machinery, trucks for sale, JCB, excavator",
    url: "https://infradealer.com"
  };

  switch (page) {
    case "home":
      return {
        title: "InfraDealer - Buy & Sell Heavy Equipment | Trucks, Excavators, JCB & Construction Machinery",
        description: "India's trusted marketplace for heavy equipment. Buy & sell trucks, excavators, JCB, dumpers, road rollers, cranes & construction machinery. Verified listings, secure transactions.",
        keywords: "heavy equipment marketplace, buy construction machinery, sell heavy equipment, trucks for sale India, JCB for sale, excavator, road roller, crane, dumper",
        url: "https://infradealer.com"
      };

    case "listings":
      const category = data.category || "";
      const city = data.city || "";
      let title = "Heavy Equipment Listings";
      let description = "Browse verified listings of heavy equipment and construction machinery.";
      
      if (category && city) {
        title = `${category} in ${city} - Heavy Equipment for Sale`;
        description = `Buy & sell ${category.toLowerCase()} in ${city}. Verified listings with detailed specifications and pricing.`;
      } else if (category) {
        title = `${category} for Sale - Heavy Equipment Marketplace`;
        description = `Browse ${category.toLowerCase()} listings across India. Compare prices, specifications and connect with verified sellers.`;
      } else if (city) {
        title = `Heavy Equipment in ${city} - Construction Machinery for Sale`;
        description = `Find heavy equipment and construction machinery in ${city}. Trucks, excavators, JCB and more.`;
      }

      return {
        title: `${title} | InfraDealer`,
        description,
        keywords: `${category} ${city} heavy equipment, construction machinery for sale, ${category.toLowerCase()}, equipment dealers`,
        url: `https://infradealer.com/listings${category ? `?category=${category}` : ''}${city ? `&city=${city}` : ''}`
      };

    case "listing-detail":
      const listing = data.listing || {};
      return {
        title: `${listing.title || 'Equipment'} - ${listing.price ? `₹${Number(listing.price).toLocaleString('en-IN')}` : 'Price Available'} | InfraDealer`,
        description: `${listing.description ? listing.description.substring(0, 155) : 'Heavy equipment for sale'}. ${listing.city ? `Located in ${listing.city}.` : ''} Contact seller for details.`,
        keywords: `${listing.category}, ${listing.title}, ${listing.manufacturer}, heavy equipment, ${listing.city}`,
        url: `https://infradealer.com/listing/${listing.id}`,
        image: listing.images && listing.images.length > 0 ? `https://infradealer.com${listing.images[0]}` : null
      };

    case "profile":
      return {
        title: "My Profile - Manage Account & Listings | InfraDealer",
        description: "Manage your InfraDealer account, view your listings, track wallet balance and update profile information.",
        keywords: "profile, account settings, my listings, wallet",
        url: "https://infradealer.com/profile"
      };

    case "wallet":
      return {
        title: "My Wallet - Add Funds & Transaction History | InfraDealer",
        description: "Manage your wallet balance, add funds and view transaction history. Secure payment options available.",
        keywords: "wallet, add funds, payment, transaction history",
        url: "https://infradealer.com/wallet"
      };

    case "post-ad":
      return {
        title: "Post Your Equipment Ad - Sell Heavy Machinery | InfraDealer",
        description: "List your heavy equipment for sale. Reach thousands of verified buyers. 30-day active listings with detailed specifications.",
        keywords: "sell equipment, post ad, list machinery, sell heavy equipment",
        url: "https://infradealer.com/post-ad"
      };

    case "my-listings":
      return {
        title: "My Listings - Manage Your Equipment Ads | InfraDealer",
        description: "View and manage all your equipment listings. Track views, edit details, and renew ads.",
        keywords: "my listings, my ads, manage listings",
        url: "https://infradealer.com/my-listings"
      };

    default:
      return {
        title: baseTitle,
        description: baseMeta.description,
        keywords: baseMeta.keywords,
        url: baseMeta.url
      };
  }
};

export const formatMetaDescription = (text, maxLength = 160) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

export const getCityKeywords = () => {
  return [
    "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", 
    "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
    "Surat", "Kanpur", "Nagpur", "Indore", "Bhopal"
  ];
};

export const getCategoryKeywords = () => {
  return [
    "Trucks", "Excavators", "JCB", "Road Roller", "Crane", 
    "Dumper", "Tipper", "Loader", "Bulldozer", "Grader",
    "Concrete Mixer", "Tower Crane", "Hydraulic Excavator"
  ];
};
