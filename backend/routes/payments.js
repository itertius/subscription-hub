import express from 'express';
import { getDatabase } from '../database.js';
import { body, validationResult, param } from 'express-validator';

const router = express.Router();

// Get all payments
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    let payments = db.data.payments || [];
    const subscriptions = db.data.subscriptions || [];

    const { subscription_id, status, start_date, end_date } = req.query;

    // Join with subscriptions to get names
    payments = payments.map(payment => {
      const subscription = subscriptions.find(s => s.id === payment.subscription_id);
      return {
        ...payment,
        subscription_name: subscription?.name || null,
        service_provider: subscription?.service_provider || null
      };
    });

    if (subscription_id) {
      payments = payments.filter(p => p.subscription_id === parseInt(subscription_id));
    }
    if (status) {
      payments = payments.filter(p => p.status === status);
    }
    if (start_date) {
      payments = payments.filter(p => p.payment_date >= start_date);
    }
    if (end_date) {
      payments = payments.filter(p => p.payment_date <= end_date);
    }

    // Sort by payment_date descending
    payments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment by ID
router.get('/:id', [
  param('id').isInt()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDatabase();
    const payments = db.data.payments || [];
    const subscriptions = db.data.subscriptions || [];
    
    const payment = payments.find(p => p.id === parseInt(req.params.id));
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const subscription = subscriptions.find(s => s.id === payment.subscription_id);
    const paymentWithSubscription = {
      ...payment,
      subscription_name: subscription?.name || null,
      service_provider: subscription?.service_provider || null
    };

    res.json(paymentWithSubscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new payment
router.post('/', [
  body('subscription_id').isInt(),
  body('amount').isFloat({ min: 0 }),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('payment_date').notEmpty(),
  body('status').optional().isIn(['completed', 'pending', 'failed', 'refunded']),
  body('payment_method').optional().trim(),
  body('transaction_id').optional().trim(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDatabase();
    const subscriptions = db.data.subscriptions || [];
    const subscription = subscriptions.find(s => s.id === parseInt(req.body.subscription_id));
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const payments = db.data.payments || [];
    const newId = payments.length > 0 
      ? Math.max(...payments.map(p => p.id)) + 1 
      : 1;

    const payment = {
      id: newId,
      subscription_id: parseInt(req.body.subscription_id),
      amount: parseFloat(req.body.amount),
      currency: req.body.currency || 'USD',
      payment_date: req.body.payment_date,
      status: req.body.status || 'completed',
      payment_method: req.body.payment_method || null,
      transaction_id: req.body.transaction_id || null,
      notes: req.body.notes || null,
      created_at: new Date().toISOString()
    };

    payments.push(payment);
    db.data.payments = payments;
    await db.write();

    const paymentWithSubscription = {
      ...payment,
      subscription_name: subscription.name,
      service_provider: subscription.service_provider
    };

    res.status(201).json(paymentWithSubscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update payment
router.put('/:id', [
  param('id').isInt(),
  body('amount').optional().isFloat({ min: 0 }),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('payment_date').optional().notEmpty(),
  body('status').optional().isIn(['completed', 'pending', 'failed', 'refunded']),
  body('payment_method').optional().trim(),
  body('transaction_id').optional().trim(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDatabase();
    const payments = db.data.payments || [];
    const subscriptions = db.data.subscriptions || [];
    const index = payments.findIndex(p => p.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = payments[index];
    
    // Update only provided fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        if (key === 'amount') {
          payment[key] = parseFloat(req.body[key]);
        } else if (key === 'subscription_id') {
          payment[key] = parseInt(req.body[key]);
        } else {
          payment[key] = req.body[key];
        }
      }
    });

    payments[index] = payment;
    db.data.payments = payments;
    await db.write();

    const subscription = subscriptions.find(s => s.id === payment.subscription_id);
    const paymentWithSubscription = {
      ...payment,
      subscription_name: subscription?.name || null,
      service_provider: subscription?.service_provider || null
    };

    res.json(paymentWithSubscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete payment
router.delete('/:id', [
  param('id').isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDatabase();
    const payments = db.data.payments || [];
    const index = payments.findIndex(p => p.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payments.splice(index, 1);
    db.data.payments = payments;
    await db.write();

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
