const express = require('express')
const router = express.Router()
const db = require('../config/database')
const auth = require('../middleware/auth')

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' })
  }
  next()
}

// Admin Login (uses existing auth route but returns admin-specific data)
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body

    // Find admin user
    const user = db.prepare('SELECT * FROM users WHERE phone = ? AND role = ?').get(phone, 'admin')
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or not an admin' })
    }

    // In production, verify password hash
    // For now, simple check (implement bcrypt in production)
    
    const token = require('../utils/jwt').generateToken(user.id)
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Verify admin token
router.get('/verify', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not an admin' })
  }
  res.json({ admin: req.user })
})

// Dashboard Stats
router.get('/dashboard/stats', auth, isAdmin, (req, res) => {
  try {
    const stats = {
      totalListings: db.prepare('SELECT COUNT(*) as count FROM listings').get().count,
      pendingApprovals: db.prepare('SELECT COUNT(*) as count FROM listings WHERE status = ?').get('pending').count,
      verifiedBrokers: db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ? AND kyc_status = ?').get('broker', 'approved').count,
      kycPending: db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ? AND kyc_status = ?').get('broker', 'pending').count,
      tokensSold: db.prepare('SELECT COALESCE(SUM(tokens), 0) as total FROM token_transactions WHERE type = ?').get('credit').total,
      reportsOpen: 0, // Implement when reports table is ready
      activeUsers: db.prepare('SELECT COUNT(*) as count FROM users WHERE status = ?').get('active').count,
      totalRevenue: db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM token_transactions WHERE type = ?').get('credit').total
    }
    
    res.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Dashboard Charts Data
router.get('/dashboard/charts', auth, isAdmin, (req, res) => {
  try {
    // Mock data for charts - implement actual queries
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
      listingsByCategory: [
        { category: 'Trucks', count: 45 },
        { category: 'Excavators', count: 32 },
        { category: 'Cranes', count: 18 },
        { category: 'Dumpers', count: 25 },
        { category: 'Others', count: 15 }
      ],
      tokenRevenue: [
        { date: '2025-12-05', revenue: 4500, tokens: 45 },
        { date: '2025-12-06', revenue: 5200, tokens: 52 },
        { date: '2025-12-07', revenue: 4800, tokens: 48 },
        { date: '2025-12-08', revenue: 6100, tokens: 61 },
        { date: '2025-12-09', revenue: 5500, tokens: 55 },
        { date: '2025-12-10', revenue: 6700, tokens: 67 },
        { date: '2025-12-11', revenue: 7200, tokens: 72 }
      ]
    }
    
    res.json(charts)
  } catch (error) {
    console.error('Dashboard charts error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all listings with pagination
router.get('/listings', auth, isAdmin, (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const offset = (page - 1) * limit
    
    let query = 'SELECT l.*, u.name as seller_name FROM listings l JOIN users u ON l.user_id = u.id'
    let countQuery = 'SELECT COUNT(*) as total FROM listings'
    const params = []
    
    if (status) {
      query += ' WHERE l.status = ?'
      countQuery += ' WHERE status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?'
    
    const listings = db.prepare(query).all(...params, parseInt(limit), offset)
    const total = db.prepare(countQuery).get(...params).total
    
    res.json({
      listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get listings error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Approve listing
router.post('/listings/:id/approve', auth, isAdmin, (req, res) => {
  try {
    const { id } = req.params
    
    db.prepare('UPDATE listings SET status = ? WHERE id = ?').run('active', id)
    
    // Log admin action
    db.prepare('INSERT INTO admin_audit (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)').run(
      req.user.id,
      'approve_listing',
      'listing',
      id
    )
    
    res.json({ message: 'Listing approved successfully' })
  } catch (error) {
    console.error('Approve listing error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Reject listing
router.post('/listings/:id/reject', auth, isAdmin, (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    
    db.prepare('UPDATE listings SET status = ? WHERE id = ?').run('rejected', id)
    
    // Log admin action with reason
    db.prepare('INSERT INTO admin_audit (admin_id, action, target_type, target_id, notes) VALUES (?, ?, ?, ?, ?)').run(
      req.user.id,
      'reject_listing',
      'listing',
      id,
      reason || 'No reason provided'
    )
    
    res.json({ message: 'Listing rejected successfully' })
  } catch (error) {
    console.error('Reject listing error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get pending KYC applications
router.get('/kyc/pending', auth, isAdmin, (req, res) => {
  try {
    const pending = db.prepare(`
      SELECT u.*, b.* 
      FROM users u 
      LEFT JOIN broker_info b ON u.id = b.user_id 
      WHERE u.role = 'broker' AND u.kyc_status = 'pending'
      ORDER BY u.created_at DESC
    `).all()
    
    res.json(pending)
  } catch (error) {
    console.error('Get pending KYC error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Approve KYC
router.post('/kyc/:userId/approve', auth, isAdmin, (req, res) => {
  try {
    const { userId } = req.params
    const { badge } = req.body
    
    db.prepare(`
      UPDATE users 
      SET kyc_status = 'approved', 
          badge = ?,
          kyc_verified_at = datetime('now')
      WHERE id = ?
    `).run(badge || 'verified_broker', userId)
    
    // Log admin action
    db.prepare('INSERT INTO admin_audit (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)').run(
      req.user.id,
      'approve_kyc',
      'user',
      userId
    )
    
    res.json({ message: 'KYC approved successfully' })
  } catch (error) {
    console.error('Approve KYC error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Reject KYC
router.post('/kyc/:userId/reject', auth, isAdmin, (req, res) => {
  try {
    const { userId } = req.params
    const { reason } = req.body
    
    db.prepare('UPDATE users SET kyc_status = ? WHERE id = ?').run('rejected', userId)
    
    // Log admin action
    db.prepare('INSERT INTO admin_audit (admin_id, action, target_type, target_id, notes) VALUES (?, ?, ?, ?, ?)').run(
      req.user.id,
      'reject_kyc',
      'user',
      userId,
      reason || 'No reason provided'
    )
    
    res.json({ message: 'KYC rejected successfully' })
  } catch (error) {
    console.error('Reject KYC error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all users
router.get('/users', auth, isAdmin, (req, res) => {
  try {
    const { page = 1, limit = 20, role, status } = req.query
    const offset = (page - 1) * limit
    
    let query = 'SELECT id, name, phone, role, token_balance, kyc_status, created_at FROM users WHERE 1=1'
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1'
    const params = []
    
    if (role) {
      query += ' AND role = ?'
      countQuery += ' AND role = ?'
      params.push(role)
    }
    
    if (status) {
      query += ' AND status = ?'
      countQuery += ' AND status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    
    const users = db.prepare(query).all(...params, parseInt(limit), offset)
    const total = db.prepare(countQuery).get(...params).total
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get transactions
router.get('/transactions', auth, isAdmin, (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const offset = (page - 1) * limit
    
    const transactions = db.prepare(`
      SELECT t.*, u.name as user_name, u.phone 
      FROM token_transactions t 
      JOIN users u ON t.user_id = u.id 
      ORDER BY t.created_at DESC 
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), offset)
    
    const total = db.prepare('SELECT COUNT(*) as total FROM token_transactions').get().total
    
    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get audit logs
router.get('/audit', auth, isAdmin, (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const offset = (page - 1) * limit
    
    const logs = db.prepare(`
      SELECT a.*, u.name as admin_name 
      FROM admin_audit a 
      JOIN users u ON a.admin_id = u.id 
      ORDER BY a.created_at DESC 
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), offset)
    
    const total = db.prepare('SELECT COUNT(*) as total FROM admin_audit').get().total
    
    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get audit logs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
