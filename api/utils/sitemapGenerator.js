// Sitemap Generator Utility
// This file can be used to generate dynamic XML sitemaps

/**
 * Generate XML sitemap for static pages
 */
export const generateStaticSitemap = () => {
  const baseUrl = 'https://infradealer.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/listings', priority: 0.9, changefreq: 'daily' },
    { url: '/about', priority: 0.5, changefreq: 'monthly' },
    { url: '/verified', priority: 0.6, changefreq: 'weekly' },
    { url: '/broker/register', priority: 0.7, changefreq: 'monthly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
};

/**
 * Generate XML sitemap for listings
 * @param {Array} listings - Array of listing objects
 */
export const generateListingsSitemap = (listings) => {
  const baseUrl = 'https://infradealer.com';
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${listings.map(listing => {
  const lastmod = listing.updated_at || listing.created_at;
  const imageUrl = listing.images && listing.images[0] 
    ? `${baseUrl}/uploads/${listing.images[0]}`
    : '';
    
  return `  <url>
    <loc>${baseUrl}/listings/${listing.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageUrl ? `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${listing.title}</image:title>
    </image:image>` : ''}
  </url>`;
}).join('\n')}
</urlset>`;

  return xml;
};

/**
 * Generate XML sitemap for category pages
 */
export const generateCategorySitemap = () => {
  const baseUrl = 'https://infradealer.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const categories = [
    'trucks', 'buses', 'dumpers', 'tippers', 'excavator', 
    'road-roller', 'crushers', 'crane', 'loaders', 'jcb'
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categories.map(category => `  <url>
    <loc>${baseUrl}/listings?category=${category}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
};

/**
 * Generate XML sitemap for city pages
 */
export const generateCitySitemap = () => {
  const baseUrl = 'https://infradealer.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const cities = [
    'delhi', 'mumbai', 'bangalore', 'hyderabad', 'chennai',
    'kolkata', 'pune', 'ahmedabad', 'jaipur', 'lucknow'
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${cities.map(city => `  <url>
    <loc>${baseUrl}/listings?city=${city}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
};

/**
 * Generate sitemap index (combines all sitemaps)
 */
export const generateSitemapIndex = () => {
  const baseUrl = 'https://infradealer.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-static.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-listings.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-cities.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

  return xml;
};

// Example usage for backend API route:
/*
// In api/routes/sitemap.js

import express from 'express';
import { 
  generateStaticSitemap, 
  generateListingsSitemap, 
  generateCategorySitemap,
  generateCitySitemap,
  generateSitemapIndex 
} from '../utils/sitemapGenerator.js';
import db from '../config/database.js';

const router = express.Router();

// Main sitemap index
router.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.send(generateSitemapIndex());
});

// Static pages sitemap
router.get('/sitemap-static.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.send(generateStaticSitemap());
});

// Listings sitemap (active listings only)
router.get('/sitemap-listings.xml', (req, res) => {
  db.all(
    `SELECT id, title, updated_at, created_at, images 
     FROM listings 
     WHERE status = 'available' 
     ORDER BY created_at DESC`,
    [],
    (err, listings) => {
      if (err) {
        return res.status(500).send('Error generating sitemap');
      }
      res.header('Content-Type', 'application/xml');
      res.send(generateListingsSitemap(listings));
    }
  );
});

// Categories sitemap
router.get('/sitemap-categories.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.send(generateCategorySitemap());
});

// Cities sitemap
router.get('/sitemap-cities.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.send(generateCitySitemap());
});

export default router;
*/

// Add to api/server.js:
/*
import sitemapRoutes from './routes/sitemap.js';
app.use('/', sitemapRoutes);
*/
