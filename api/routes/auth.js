import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { generateOTP, sendOTP } from '../utils/otp.js';
import { generateToken } from '../utils/jwt.js';

const router = express.Router();

// Send OTP
router.post('/send-otp', [
  body('phone').isMobilePhone('any').withMessage('Please provide a valid phone number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phone } = req.body;

  try {
    // Check if user exists
    const user = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE phone = ?", [phone], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes expiry

    // Save OTP to database
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO otps (user_id, phone, otp, expires_at) VALUES (?, ?, ?, ?)",
        [user ? user.id : null, phone, otp, expiresAt.toISOString()],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    // Send OTP via SMS (using Twilio)
    await sendOTP(phone, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      phone
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
});

// Verify OTP and login
router.post('/verify-otp', [
  body('phone').isMobilePhone('any').withMessage('Please provide a valid phone number'),
  body('otp').isLength({ min: 4, max: 6 }).withMessage('OTP must be 4-6 digits')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phone, otp } = req.body;

  try {
    console.log('Verify OTP Request:', { phone, otp, otpType: typeof otp });
    
    // Get latest OTP for this phone
    const otpRecord = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM otps WHERE phone = ? ORDER BY created_at DESC LIMIT 1",
        [phone],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    console.log('OTP Record Found:', otpRecord);

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this phone number'
      });
    }

    // Check if OTP is expired
    const expiresAt = new Date(otpRecord.expires_at);
    console.log('OTP Expiry Check:', { expiresAt, now: new Date(), expired: expiresAt < new Date() });
    
    if (expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Verify OTP - convert both to string for comparison
    const storedOTP = String(otpRecord.otp);
    const receivedOTP = String(otp);
    console.log('OTP Comparison:', { stored: storedOTP, received: receivedOTP, match: storedOTP === receivedOTP });
    
    // Allow test OTP 123456 for development
    const isTestOTP = receivedOTP === '123456' && process.env.NODE_ENV !== 'production';
    
    if (storedOTP !== receivedOTP && !isTestOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Get or create user
    let user = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE phone = ?", [phone], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!user) {
      // Create new user - Let SQLite auto-increment the ID
      const insertResult = await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO users (phone, role) VALUES (?, ?)",
          [phone, 'buyer'],
          function(err) {
            if (err) reject(err);
            resolve(this.lastID);
          }
        );
      });

      const userId = insertResult;

      // Create wallet for new user
      await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO token_wallets (user_id, balance) VALUES (?, ?)",
          [userId, 0],
          function(err) {
            if (err) reject(err);
            resolve(this.lastID);
          }
        );
      });

      // Get the new user
      user = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
    }

    console.log('User:', user);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      role: user.role
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
});

export default router;
