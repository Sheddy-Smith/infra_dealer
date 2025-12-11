import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await new Promise((resolve, reject) => {
      db.get(
        "SELECT id, phone, name, email, role, created_at FROM users WHERE id = ?",
        [req.user.userId],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user wallet
    const wallet = await new Promise((resolve, reject) => {
      db.get(
        "SELECT balance FROM token_wallets WHERE user_id = ?",
        [req.user.userId],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    res.status(200).json({
      success: true,
      user: {
        ...user,
        balance: wallet ? wallet.balance : 0
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', [
  authMiddleware,
  body('name').optional().isString().withMessage('Name must be a string'),
  body('email').optional().isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email } = req.body;

  try {
    // Update user profile
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        [name, email, req.user.userId],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    // Get updated user
    const user = await new Promise((resolve, reject) => {
      db.get(
        "SELECT id, phone, name, email, role, created_at FROM users WHERE id = ?",
        [req.user.userId],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message
    });
  }
});

export default router;
