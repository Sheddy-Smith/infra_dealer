import express from 'express'
import { db } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Element 2: Renew listing (free renewal)
router.post('/renew/:id', authMiddleware, async (req, res) => {
  try {
    const listingId = req.params.id
    const userId = req.user.id

    // Verify listing belongs to user
    const listing = db.prepare('SELECT seller_id, status, title FROM listings WHERE id = ?').get(listingId)
    
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    if (listing.seller_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }

    // Calculate new expiry date (30 days from today)
    const newExpiryDate = new Date()
    newExpiryDate.setDate(newExpiryDate.getDate() + 30)

    // Update listing
    db.prepare(`
      UPDATE listings 
      SET status = 'approved', expiry_date = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(newExpiryDate.toISOString(), listingId)

    // Log renewal action
    db.prepare(`
      INSERT INTO listing_audit_log (listing_id, user_id, action, details)
      VALUES (?, ?, ?, ?)
    `).run(listingId, userId, 'renew', 'Listing renewed for 30 days')

    res.json({
      success: true,
      message: 'Listing renewed successfully',
      expiry_date: newExpiryDate.toISOString()
    })
  } catch (error) {
    console.error('Error renewing listing:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Element 2: Paid renewal with Razorpay
router.post('/renew/:id/premium', authMiddleware, async (req, res) => {
  try {
    const listingId = req.params.id
    const userId = req.user.id
    const { featured } = req.body

    // Verify listing belongs to user
    const listing = db.prepare('SELECT seller_id FROM listings WHERE id = ?').get(listingId)
    
    if (!listing || listing.seller_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }

    // Premium renewal price: ₹49 for basic, ₹99 for featured
    const amount = featured ? 9900 : 4900 // in paise

    // Create Razorpay order (mock for now)
    const orderId = `renewal_${Date.now()}_${listingId}`

    res.json({
      success: true,
      order_id: orderId,
      amount,
      currency: 'INR'
    })
  } catch (error) {
    console.error('Error creating premium renewal order:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Get user notifications
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 20, unread_only } = req.query

    let query = 'SELECT * FROM notifications WHERE user_id = ?'
    const params = [userId]

    if (unread_only === 'true') {
      query += ' AND read = 0'
    }

    query += ' ORDER BY created_at DESC LIMIT ?'
    params.push(parseInt(limit))

    const notifications = db.prepare(query).all(...params)

    // Count unread
    const unreadCount = db.prepare(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0'
    ).get(userId)

    res.json({
      success: true,
      notifications,
      unread_count: unreadCount.count
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Mark notification as read
router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    const notificationId = req.params.id
    const userId = req.user.id

    db.prepare(`
      UPDATE notifications 
      SET read = 1 
      WHERE id = ? AND user_id = ?
    `).run(notificationId, userId)

    res.json({ success: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Mark all notifications as read
router.put('/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    db.prepare(`
      UPDATE notifications 
      SET read = 1 
      WHERE user_id = ? AND read = 0
    `).run(userId)

    res.json({ success: true })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Element 10: Get verified sellers/brokers leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { region, type = 'all' } = req.query

    let query = `
      SELECT 
        u.id,
        u.name,
        u.city,
        u.state,
        u.badge,
        u.rating,
        u.total_sales,
        u.trust_score
      FROM users u
      WHERE u.badge IS NOT NULL
    `

    const params = []

    if (type === 'broker') {
      query += ' AND u.role = ?'
      params.push('broker')
    } else if (type === 'dealer') {
      query += ' AND u.badge = ?'
      params.push('trusted_dealer')
    }

    if (region) {
      query += ' AND u.state = ?'
      params.push(region)
    }

    query += ' ORDER BY u.rating DESC, u.total_sales DESC, u.trust_score DESC LIMIT 50'

    const leaderboard = db.prepare(query).all(...params)

    res.json({
      success: true,
      leaderboard
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Report trust incident
router.post('/report-incident', authMiddleware, async (req, res) => {
  try {
    const reporterId = req.user.id
    const { reported_user_id, incident_type, description } = req.body

    db.prepare(`
      INSERT INTO trust_incidents (
        user_id, 
        incident_type, 
        description, 
        severity,
        status
      ) VALUES (?, ?, ?, ?, ?)
    `).run(reported_user_id, incident_type, description, 'medium', 'pending')

    res.json({
      success: true,
      message: 'Incident reported. Our team will review it.'
    })
  } catch (error) {
    console.error('Error reporting incident:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Get badge information
router.get('/badges/info', async (req, res) => {
  try {
    const badges = [
      {
        type: 'verified_seller',
        name: 'Verified Seller',
        icon: '✅',
        description: 'Identity & documents verified by InfraDealer',
        criteria: 'Complete KYC with valid PAN and business documents'
      },
      {
        type: 'trusted_dealer',
        name: 'Trusted Dealer',
        icon: '🏢',
        description: 'Established dealer with proven track record',
        criteria: '5+ successful sales with verified identity'
      },
      {
        type: 'verified_broker',
        name: 'Verified Broker',
        icon: '✅',
        description: 'Background-checked professional broker',
        criteria: 'Complete broker KYC verification'
      },
      {
        type: 'trusted_broker',
        name: 'Trusted Broker',
        icon: '⭐',
        description: 'Top-rated broker with excellent service',
        criteria: '3+ completed deals with 4.0+ rating'
      }
    ]

    res.json({
      success: true,
      badges
    })
  } catch (error) {
    console.error('Error fetching badge info:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router
