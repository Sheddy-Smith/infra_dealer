import express from 'express';
import { body, validationResult } from 'express-validator';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

// Load environment variables
dotenv.config();

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_key_for_testing'
});

// Get wallet balance
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const wallet = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM token_wallets WHERE user_id = ?",
        [req.user.userId],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Get recent transactions
    const transactions = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM token_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
        [req.user.userId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
        }
      );
    });

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      transactions: transactions
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet balance',
      error: error.message
    });
  }
});

// Create order for token purchase
router.post('/create-order', [
  authMiddleware,
  body('tokens').isInt({ min: 1 }).withMessage('Tokens must be a positive integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { tokens } = req.body;
  const amount = tokens * 100; // 1 token = ₹100

  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user.userId,
        tokens: tokens
      }
    };

    const order = await razorpay.orders.create(options);

    // Save order to database
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO orders (order_id, user_id, tokens, amount, status, receipt) VALUES (?, ?, ?, ?, ?, ?)",
        [order.id, req.user.userId, tokens, amount, 'created', order.receipt],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Verify payment and credit tokens
router.post('/verify', [
  authMiddleware,
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Signature is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    // Verify signature
    const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get order from database
    const order = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM orders WHERE order_id = ?",
        [razorpay_order_id],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified'
      });
    }

    // Update order status
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE orders SET status = ? WHERE order_id = ?",
        ['paid', razorpay_order_id],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    // Get current wallet balance
    const wallet = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM token_wallets WHERE user_id = ?",
        [order.user_id],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    // Update wallet balance
    const newBalance = wallet.balance + order.tokens;
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE token_wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
        [newBalance, order.user_id],
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
        [order.user_id, order.tokens, newBalance, 'purchase', razorpay_payment_id, `Purchased ${order.tokens} tokens`],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and tokens credited',
      tokens: order.tokens,
      newBalance
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

// Webhook for Razorpay
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    // Verify webhook signature
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(req.body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }
    
    const webhookBody = JSON.parse(req.body);
    
    // Handle payment captured event
    if (webhookBody.event === 'payment.captured') {
      const payment = webhookBody.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      
      // Get order from database
      const order = await new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM orders WHERE order_id = ?",
          [orderId],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });
      
      if (order && order.status !== 'paid') {
        // Update order status
        await new Promise((resolve, reject) => {
          db.run(
            "UPDATE orders SET status = ? WHERE order_id = ?",
            ['paid', orderId],
            function(err) {
              if (err) reject(err);
              resolve(this.lastID);
            }
          );
        });
        
        // Get current wallet balance
        const wallet = await new Promise((resolve, reject) => {
          db.get(
            "SELECT * FROM token_wallets WHERE user_id = ?",
            [order.user_id],
            (err, row) => {
              if (err) reject(err);
              resolve(row);
            }
          );
        });
        
        // Update wallet balance
        const newBalance = wallet.balance + order.tokens;
        await new Promise((resolve, reject) => {
          db.run(
            "UPDATE token_wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
            [newBalance, order.user_id],
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
            [order.user_id, order.tokens, newBalance, 'purchase', paymentId, `Purchased ${order.tokens} tokens`],
            function(err) {
              if (err) reject(err);
              resolve(this.lastID);
            }
          );
        });
        
        console.log(`Payment verified via webhook: ${paymentId}`);
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

export default router;
