import express from 'express'
import { db } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get broker statistics (for dashboard)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    // Check if user is a broker
    const user = db.prepare('SELECT role, kyc_status FROM users WHERE id = ?').get(userId)
    
    if (user.role !== 'broker') {
      return res.status(403).json({ success: false, message: 'Access denied. Broker role required.' })
    }

    // Get active jobs count
    const activeJobs = db.prepare(
      'SELECT COUNT(*) as count FROM broker_assignments WHERE broker_id = ? AND status IN (?, ?)'
    ).get(userId, 'assigned', 'active')

    // Get completed deals count
    const completedDeals = db.prepare(
      'SELECT COUNT(*) as count FROM broker_assignments WHERE broker_id = ? AND status = ?'
    ).get(userId, 'completed')

    // Get total commission earned
    const commission = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM broker_commissions WHERE broker_id = ? AND status = ?'
    ).get(userId, 'paid')

    // Get average rating
    const rating = db.prepare(
      'SELECT COALESCE(AVG(rating), 0) as avg, COUNT(*) as count FROM broker_reviews WHERE broker_id = ?'
    ).get(userId)

    res.json({
      success: true,
      stats: {
        activeJobs: activeJobs.count || 0,
        completedDeals: completedDeals.count || 0,
        commissionEarned: commission.total || 0,
        averageRating: rating.avg ? parseFloat(rating.avg.toFixed(1)) : 0,
        totalReviews: rating.count || 0
      }
    })
  } catch (error) {
    console.error('Error fetching broker stats:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Get broker assignments
router.get('/assignments', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { status } = req.query

    let query = `
      SELECT 
        ba.*,
        l.title,
        l.price as expected_price,
        l.city as location,
        u.name as seller,
        u.phone as seller_phone
      FROM broker_assignments ba
      INNER JOIN listings l ON ba.listing_id = l.id
      INNER JOIN users u ON ba.seller_id = u.id
      WHERE ba.broker_id = ?
    `
    
    const params = [userId]
    
    if (status) {
      query += ' AND ba.status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY ba.created_at DESC'

    const assignments = db.prepare(query).all(...params)

    res.json({
      success: true,
      assignments
    })
  } catch (error) {
    console.error('Error fetching assignments:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Submit broker registration
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const {
      company_name,
      experience_years,
      vehicles_handled,
      working_cities,
      specialization,
      account_number,
      ifsc_code,
      bank_name,
      account_holder_name,
      upi_id
    } = req.body

    // Update user role to broker and set KYC status to pending
    const updateUser = db.prepare(`
      UPDATE users 
      SET role = ?, 
          kyc_status = ?,
          company_name = ?
      WHERE id = ?
    `)
    updateUser.run('broker', 'pending', company_name, userId)

    // Store broker-specific information
    const insertBrokerInfo = db.prepare(`
      INSERT INTO broker_info (
        user_id, 
        experience_years, 
        vehicles_handled,
        working_cities,
        specialization,
        account_number,
        ifsc_code,
        bank_name,
        account_holder_name,
        upi_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    insertBrokerInfo.run(
      userId,
      experience_years,
      JSON.stringify(vehicles_handled),
      working_cities,
      specialization || '',
      account_number,
      ifsc_code,
      bank_name,
      account_holder_name,
      upi_id || ''
    )

    res.json({
      success: true,
      message: 'Broker registration submitted successfully. Your application is under review.'
    })
  } catch (error) {
    console.error('Error registering broker:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Get brokers near a city (for hire broker modal)
router.get('/near-city', async (req, res) => {
  try {
    const { city } = req.query
    
    const query = `
      SELECT 
        u.id,
        u.name,
        u.city,
        u.company_name,
        bi.experience_years,
        bi.specialization,
        bi.working_cities,
        COALESCE(AVG(br.rating), 0) as rating,
        COUNT(DISTINCT br.id) as reviews,
        COUNT(DISTINCT ba.id) FILTER (WHERE ba.status = 'completed') as deals_closed
      FROM users u
      INNER JOIN broker_info bi ON u.id = bi.user_id
      LEFT JOIN broker_reviews br ON u.id = br.broker_id
      LEFT JOIN broker_assignments ba ON u.id = ba.broker_id
      WHERE u.role = 'broker' 
        AND u.kyc_status = 'approved'
        AND (bi.working_cities LIKE ? OR u.city = ?)
      GROUP BY u.id
      ORDER BY rating DESC, deals_closed DESC
      LIMIT 5
    `

    const brokers = db.prepare(query).all(`%${city}%`, city)

    // Add mock success rate and response time for now
    const brokersWithStats = brokers.map(broker => ({
      ...broker,
      rating: parseFloat(broker.rating.toFixed(1)),
      verified: true,
      success_rate: 85 + Math.floor(Math.random() * 15), // 85-100%
      response_time: '< 2 hours'
    }))

    res.json({
      success: true,
      brokers: brokersWithStats
    })
  } catch (error) {
    console.error('Error fetching brokers:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Hire a broker for a listing
router.post('/hire', authMiddleware, async (req, res) => {
  try {
    const sellerId = req.user.id
    const { listing_id, broker_id, commission_rate } = req.body

    // Verify listing belongs to seller
    const listing = db.prepare('SELECT user_id FROM listings WHERE id = ?').get(listing_id)
    
    if (!listing || listing.user_id !== sellerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }

    // Check if broker already assigned
    const existing = db.prepare(
      'SELECT id FROM broker_assignments WHERE listing_id = ? AND status IN (?, ?)'
    ).get(listing_id, 'assigned', 'active')

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'A broker is already assigned to this listing' 
      })
    }

    // Create assignment
    const insert = db.prepare(`
      INSERT INTO broker_assignments (
        listing_id, 
        seller_id, 
        broker_id, 
        commission_rate,
        status
      ) VALUES (?, ?, ?, ?, ?)
    `)

    const result = insert.run(listing_id, sellerId, broker_id, commission_rate || 2.5, 'assigned')

    res.json({
      success: true,
      message: 'Broker hired successfully',
      assignment_id: result.lastInsertRowid
    })
  } catch (error) {
    console.error('Error hiring broker:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Get broker public profile
router.get('/profile/:id', async (req, res) => {
  try {
    const brokerId = req.params.id

    const broker = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.city,
        u.state,
        u.company_name,
        u.created_at as member_since,
        bi.experience_years,
        bi.specialization,
        bi.working_cities,
        COALESCE(AVG(br.rating), 0) as average_rating,
        COUNT(DISTINCT br.id) as total_reviews,
        COUNT(DISTINCT ba.id) FILTER (WHERE ba.status = 'completed') as total_deals,
        COUNT(DISTINCT ba.id) FILTER (WHERE ba.status IN ('assigned', 'active')) as active_jobs
      FROM users u
      INNER JOIN broker_info bi ON u.id = bi.user_id
      LEFT JOIN broker_reviews br ON u.id = br.broker_id
      LEFT JOIN broker_assignments ba ON u.id = ba.broker_id
      WHERE u.id = ? AND u.role = 'broker' AND u.kyc_status = 'approved'
      GROUP BY u.id
    `).get(brokerId)

    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker not found' })
    }

    // Get reviews
    const reviews = db.prepare(`
      SELECT 
        br.id,
        br.rating,
        br.comment,
        br.created_at as date,
        u.name as client_name,
        ba.deal_type
      FROM broker_reviews br
      INNER JOIN users u ON br.reviewer_id = u.id
      LEFT JOIN broker_assignments ba ON br.assignment_id = ba.id
      WHERE br.broker_id = ?
      ORDER BY br.created_at DESC
      LIMIT 10
    `).all(brokerId)

    res.json({
      success: true,
      broker: {
        ...broker,
        average_rating: parseFloat(broker.average_rating.toFixed(1)),
        verified: true,
        success_rate: 85 + Math.floor(Math.random() * 15),
        response_time: '< 2 hours'
      },
      reviews
    })
  } catch (error) {
    console.error('Error fetching broker profile:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Submit review for broker (after deal completion)
router.post('/review', authMiddleware, async (req, res) => {
  try {
    const reviewerId = req.user.id
    const { broker_id, assignment_id, rating, comment } = req.body

    // Verify assignment exists and is completed
    const assignment = db.prepare(
      'SELECT seller_id, status FROM broker_assignments WHERE id = ? AND broker_id = ?'
    ).get(assignment_id, broker_id)

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' })
    }

    if (assignment.seller_id !== reviewerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }

    if (assignment.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only review after deal completion' 
      })
    }

    // Check if already reviewed
    const existing = db.prepare(
      'SELECT id FROM broker_reviews WHERE assignment_id = ?'
    ).get(assignment_id)

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this broker' 
      })
    }

    // Insert review
    const insert = db.prepare(`
      INSERT INTO broker_reviews (
        broker_id,
        reviewer_id,
        assignment_id,
        rating,
        comment
      ) VALUES (?, ?, ?, ?, ?)
    `)

    insert.run(broker_id, reviewerId, assignment_id, rating, comment)

    res.json({
      success: true,
      message: 'Review submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting review:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router
