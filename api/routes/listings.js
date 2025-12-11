import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const { category, city, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = "SELECT * FROM listings WHERE status = 'approved'";
    const params = [];
    
    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    
    if (city) {
      query += " AND city LIKE ?";
      params.push(`%${city}%`);
    }
    
    if (minPrice) {
      query += " AND price >= ?";
      params.push(minPrice);
    }
    
    if (maxPrice) {
      query += " AND price <= ?";
      params.push(maxPrice);
    }
    
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);
    
    const listings = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        
        // Parse images JSON
        const processedRows = rows.map(row => ({
          ...row,
          images: row.images ? JSON.parse(row.images) : []
        }));
        
        resolve(processedRows);
      });
    });
    
    // Get total count for pagination
    const countQuery = "SELECT COUNT(*) as total FROM listings WHERE status = 'approved'";
    const countParams = [];
    
    if (category) {
      countQuery += " AND category = ?";
      countParams.push(category);
    }
    
    if (city) {
      countQuery += " AND city LIKE ?";
      countParams.push(`%${city}%`);
    }
    
    if (minPrice) {
      countQuery += " AND price >= ?";
      countParams.push(minPrice);
    }
    
    if (maxPrice) {
      countQuery += " AND price <= ?";
      countParams.push(maxPrice);
    }
    
    const totalCount = await new Promise((resolve, reject) => {
      db.get(countQuery, countParams, (err, row) => {
        if (err) reject(err);
        resolve(row.total);
      });
    });
    
    res.status(200).json({
      success: true,
      listings,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
      error: error.message
    });
  }
});

// Get single listing by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const listing = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM listings WHERE id = ? AND status = 'approved'",
        [id],
        (err, row) => {
          if (err) reject(err);
          
          if (row) {
            // Parse images JSON
            row.images = row.images ? JSON.parse(row.images) : [];
          }
          
          resolve(row);
        }
      );
    });
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    // Increment view count
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE listings SET views = views + 1 WHERE id = ?",
        [id],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });
    
    res.status(200).json({
      success: true,
      listing
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listing',
      error: error.message
    });
  }
});

// Create new listing
router.post('/', [
  authMiddleware,
  body('title').notEmpty().withMessage('Title is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('city').notEmpty().withMessage('City is required'),
  body('description').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    category,
    make_model,
    year,
    km,
    price,
    description,
    city,
    area,
    seller_contact,
    images
  } = req.body;

  try {
    // Calculate expiry date (30 days from now)
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)

    const listingData = {
      seller_id: req.user.userId,
      title,
      category,
      make_model: make_model || null,
      year: year || null,
      km: km || null,
      price,
      description: description || null,
      city,
      area: area || null,
      seller_contact: seller_contact || null,
      images: images ? JSON.stringify(images) : JSON.stringify([]),
      status: 'pending',
      expiry_date: expiryDate.toISOString()
    };

    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO listings (
          seller_id, title, category, make_model, year, km, 
          price, description, city, area, seller_contact, images, status, expiry_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          listingData.seller_id,
          listingData.title,
          listingData.category,
          listingData.make_model,
          listingData.year,
          listingData.km,
          listingData.price,
          listingData.description,
          listingData.city,
          listingData.area,
          listingData.seller_contact,
          listingData.images,
          listingData.status,
          listingData.expiry_date
        ],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, changes: this.changes });
        }
      );
    });

    // Get the created listing
    const newListing = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM listings WHERE id = ?",
        [result.id],
        (err, row) => {
          if (err) reject(err);
          
          if (row) {
            // Parse images JSON
            row.images = row.images ? JSON.parse(row.images) : [];
          }
          
          resolve(row);
        }
      );
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully and pending approval',
      listing: newListing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create listing',
      error: error.message
    });
  }
});

// Unlock seller contact
router.post('/:id/unlock', [
  authMiddleware,
  body('listingId').isInt().withMessage('Listing ID must be an integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const userId = req.user.userId;

  try {
    // Check if listing exists
    const listing = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM listings WHERE id = ? AND status = 'approved'",
        [id],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if user already unlocked this listing
    const existingUnlock = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM unlocks WHERE user_id = ? AND listing_id = ?",
        [userId, id],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (existingUnlock) {
      return res.status(200).json({
        success: true,
        message: 'Listing already unlocked',
        contact: listing.seller_contact
      });
    }

    // Get user wallet
    const wallet = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM token_wallets WHERE user_id = ?",
        [userId],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (!wallet || wallet.balance < 1) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient tokens'
      });
    }

    // Begin transaction
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        // Deduct token from wallet
        db.run(
          "UPDATE token_wallets SET balance = balance - 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
          [userId],
          function(err) {
            if (err) {
              db.run("ROLLBACK");
              reject(err);
            }
          }
        );
        
        // Record transaction
        db.run(
          "INSERT INTO token_transactions (user_id, change, balance_after, type, ref, description) VALUES (?, ?, ?, ?, ?, ?)",
          [userId, -1, wallet.balance - 1, 'use', `unlock_listing_${id}`, `Unlocked contact for listing ${id}`],
          function(err) {
            if (err) {
              db.run("ROLLBACK");
              reject(err);
            }
          }
        );
        
        // Record unlock
        db.run(
          "INSERT INTO unlocks (user_id, listing_id) VALUES (?, ?)",
          [userId, id],
          function(err) {
            if (err) {
              db.run("ROLLBACK");
              reject(err);
            } else {
              db.run("COMMIT");
              resolve(this.lastID);
            }
          }
        );
      });
    });

    res.status(200).json({
      success: true,
      message: 'Listing unlocked successfully',
      contact: listing.seller_contact,
      newBalance: wallet.balance - 1
    });
  } catch (error) {
    console.error('Error unlocking listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlock listing',
      error: error.message
    });
  }
});

// Get user's listings
router.get('/user/listings', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const listings = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM listings WHERE seller_id = ? ORDER BY created_at DESC",
        [userId],
        (err, rows) => {
          if (err) reject(err);
          
          // Parse images JSON
          const processedRows = rows.map(row => ({
            ...row,
            images: row.images ? JSON.parse(row.images) : []
          }));
          
          resolve(processedRows);
        }
      );
    });
    
    res.status(200).json({
      success: true,
      listings
    });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user listings',
      error: error.message
    });
  }
});

export default router;
