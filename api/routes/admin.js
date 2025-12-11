import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Get all pending listings
router.get('/pending-listings', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const listings = await new Promise((resolve, reject) => {
      db.all(
        "SELECT l.*, u.phone FROM listings l JOIN users u ON l.seller_id = u.id WHERE l.status = 'pending' ORDER BY l.created_at DESC",
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
    console.error('Error fetching pending listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending listings',
      error: error.message
    });
  }
});

// Approve listing
router.put('/approve-listing/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if listing exists and is pending
    const listing = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM listings WHERE id = ? AND status = 'pending'",
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
        message: 'Listing not found or already processed'
      });
    }
    
    // Update listing status
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE listings SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });
    
    res.status(200).json({
      success: true,
      message: 'Listing approved successfully'
    });
  } catch (error) {
    console.error('Error approving listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve listing',
      error: error.message
    });
  }
});

// Reject listing
router.put('/reject-listing/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Check if listing exists and is pending
    const listing = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM listings WHERE id = ? AND status = 'pending'",
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
        message: 'Listing not found or already processed'
      });
    }
    
    // Update listing status
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE listings SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });
    
    res.status(200).json({
      success: true,
      message: 'Listing rejected successfully',
      reason: reason || 'No reason provided'
    });
  } catch (error) {
    console.error('Error rejecting listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject listing',
      error: error.message
    });
  }
});

// Get all users
router.get('/users', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const users = await new Promise((resolve, reject) => {
      db.all(
        "SELECT u.*, tw.balance FROM users u LEFT JOIN token_wallets tw ON u.id = tw.user_id ORDER BY u.created_at DESC",
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
    
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get token transactions
router.get('/token-transactions', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = "SELECT tt.*, u.phone FROM token_transactions tt JOIN users u ON tt.user_id = u.id";
    const params = [];
    
    if (userId) {
      query += " WHERE tt.user_id = ?";
      params.push(userId);
    }
    
    query += " ORDER BY tt.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);
    
    const transactions = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch token transactions',
      error: error.message
    });
  }
});

// Add tokens to user wallet
router.post('/add-tokens', [
  authMiddleware, 
  adminMiddleware,
  body('userId').isInt().withMessage('User ID must be an integer'),
  body('tokens').isInt({ min: 1 }).withMessage('Tokens must be a positive integer'),
  body('reason').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, tokens, reason } = req.body;

  try {
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

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'User wallet not found'
      });
    }

    // Update wallet balance
    const newBalance = wallet.balance + tokens;
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE token_wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
        [newBalance, userId],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    // Record transaction
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO token_transactions (user_id, change, balance_after, type, ref, description) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, tokens, newBalance, 'admin_credit', null, reason || 'Admin credit'],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    res.status(200).json({
      success: true,
      message: 'Tokens added successfully',
      newBalance
    });
  } catch (error) {
    console.error('Error adding tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add tokens',
      error: error.message
    });
  }
});

// Get dashboard stats
router.get('/dashboard-stats', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    // Get user count
    const userCount = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) reject(err);
        resolve(row.count);
      });
    });

    // Get listing count by status
    const listingStats = await new Promise((resolve, reject) => {
      db.all(
        "SELECT status, COUNT(*) as count FROM listings GROUP BY status",
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });

    // Get total tokens in circulation
    const totalTokens = await new Promise((resolve, reject) => {
      db.get("SELECT SUM(balance) as total FROM token_wallets", (err, row) => {
        if (err) reject(err);
        resolve(row.total || 0);
      });
    });

    // Get recent transactions
    const recentTransactions = await new Promise((resolve, reject) => {
      db.all(
        "SELECT tt.*, u.phone FROM token_transactions tt JOIN users u ON tt.user_id = u.id ORDER BY tt.created_at DESC LIMIT 10",
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });

    res.status(200).json({
      success: true,
      stats: {
        userCount,
        listingStats,
        totalTokens,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
});

// ============ Admin Panel Specific Routes ============

// Admin Login (Verify admin role)
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find admin user
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE phone = ? AND role = ?', [phone, 'admin'], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials or not an admin' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Verify admin token
router.get('/verify', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Not an admin' 
    });
  }
  res.json({ 
    success: true,
    admin: req.user 
  });
});

// Dashboard Charts Data
router.get('/dashboard/charts', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    // Mock data for charts - can be replaced with actual queries
    const charts = {
      dailyUsers: [
        { date: '2025-12-05', users: 45 },
        { date: '2025-12-06', users: 52 },
        { date: '2025-12-07', users: 48 },
        { date: '2025-12-08', users: 61 },
        { date: '2025-12-09', users: 55 },
        { date: '2025-12-10', users: 67 },
        { date: '2025-12-11', users: 72 }
      ],
      listingsByCategory: await new Promise((resolve, reject) => {
        db.all(
          `SELECT category, COUNT(*) as count 
           FROM listings 
           WHERE status = 'active' 
           GROUP BY category`,
          (err, rows) => {
            if (err) reject(err);
            resolve(rows || []);
          }
        );
      }),
      tokenRevenue: [
        { date: '2025-12-05', revenue: 4500, tokens: 45 },
        { date: '2025-12-06', revenue: 5200, tokens: 52 },
        { date: '2025-12-07', revenue: 4800, tokens: 48 },
        { date: '2025-12-08', revenue: 6100, tokens: 61 },
        { date: '2025-12-09', revenue: 5500, tokens: 55 },
        { date: '2025-12-10', revenue: 6700, tokens: 67 },
        { date: '2025-12-11', revenue: 7200, tokens: 72 }
      ]
    };
    
    res.json(charts);
  } catch (error) {
    console.error('Dashboard charts error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get all listings (with pagination)
router.get('/listings', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `SELECT l.*, u.name as seller_name 
                 FROM listings l 
                 JOIN users u ON l.seller_id = u.id`;
    let countQuery = 'SELECT COUNT(*) as total FROM listings';
    const params = [];
    
    if (status) {
      query += ' WHERE l.status = ?';
      countQuery += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const listings = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        const processedRows = rows.map(row => ({
          ...row,
          images: row.images ? JSON.parse(row.images) : []
        }));
        resolve(processedRows);
      });
    });
    
    const total = await new Promise((resolve, reject) => {
      db.get(countQuery, status ? [status] : [], (err, row) => {
        if (err) reject(err);
        resolve(row.total);
      });
    });
    
    res.json({
      success: true,
      listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get pending KYC applications
router.get('/kyc/pending', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const pending = await new Promise((resolve, reject) => {
      db.all(
        `SELECT u.*, b.* 
         FROM users u 
         LEFT JOIN broker_info b ON u.id = b.user_id 
         WHERE u.role = 'broker' AND u.kyc_status = 'pending'
         ORDER BY u.created_at DESC`,
        (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
        }
      );
    });
    
    res.json({
      success: true,
      applications: pending
    });
  } catch (error) {
    console.error('Get pending KYC error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Approve KYC
router.post('/kyc/:userId/approve', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { userId } = req.params;
    const { badge } = req.body;
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE users 
         SET kyc_status = 'approved', 
             badge = ?,
             kyc_verified_at = datetime('now')
         WHERE id = ?`,
        [badge || 'verified_broker', userId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
    
    res.json({ 
      success: true,
      message: 'KYC approved successfully' 
    });
  } catch (error) {
    console.error('Approve KYC error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Reject KYC
router.post('/kyc/:userId/reject', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET kyc_status = ? WHERE id = ?',
        ['rejected', userId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
    
    res.json({ 
      success: true,
      message: 'KYC rejected successfully' 
    });
  } catch (error) {
    console.error('Reject KYC error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get all brokers
router.get('/brokers', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const brokers = await new Promise((resolve, reject) => {
      db.all(
        `SELECT u.*, b.* 
         FROM users u 
         LEFT JOIN broker_info b ON u.id = b.user_id 
         WHERE u.role = 'broker'
         ORDER BY u.created_at DESC`,
        (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
        }
      );
    });
    
    res.json({
      success: true,
      brokers
    });
  } catch (error) {
    console.error('Get brokers error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get audit logs (if admin_audit table exists)
router.get('/audit', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    // Check if table exists first
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='admin_audit'",
        (err, row) => {
          if (err) reject(err);
          resolve(!!row);
        }
      );
    });

    if (!tableExists) {
      return res.json({
        success: true,
        logs: [],
        pagination: { page: 1, limit: 50, total: 0, pages: 0 }
      });
    }

    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const logs = await new Promise((resolve, reject) => {
      db.all(
        `SELECT a.*, u.name as admin_name 
         FROM admin_audit a 
         JOIN users u ON a.admin_id = u.id 
         ORDER BY a.created_at DESC 
         LIMIT ? OFFSET ?`,
        [parseInt(limit), offset],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
        }
      );
    });
    
    const total = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as total FROM admin_audit', (err, row) => {
        if (err) reject(err);
        resolve(row ? row.total : 0);
      });
    });
    
    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

export default router;

