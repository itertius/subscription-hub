import express from 'express';
import { getDatabase } from '../database.js';
import { body, validationResult, param } from 'express-validator';

const router = express.Router();

// Get all subscriptions
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    let subscriptions = db.data.subscriptions || [];

    const { status, category } = req.query;
    
    if (status) {
      subscriptions = subscriptions.filter(s => s.status === status);
    }
    if (category) {
      subscriptions = subscriptions.filter(s => s.category === category);
    }

    // Sort by next_billing_date
    subscriptions.sort((a, b) => new Date(a.next_billing_date) - new Date(b.next_billing_date));

    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription by ID
router.get('/:id', [
  param('id').isInt()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDatabase();
    const subscription = db.data.subscriptions.find(s => s.id === parseInt(req.params.id));
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new subscription
router.post('/', [
  body('name').notEmpty().trim(),
  body('service_provider').notEmpty().trim(),
  body('amount').isFloat({ min: 0 }),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('billing_cycle').isIn(['monthly', 'yearly', 'weekly', 'quarterly']),
  body('next_billing_date').notEmpty(),
  body('status').optional().isIn(['active', 'cancelled', 'paused']),
  body('payment_method').optional().trim(),
  body('description').optional().trim(),
  body('category').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDatabase();
    const subscriptions = db.data.subscriptions || [];
    
    const newId = subscriptions.length > 0 
      ? Math.max(...subscriptions.map(s => s.id)) + 1 
      : 1;

    const subscription = {
      id: newId,
      name: req.body.name,
      service_provider: req.body.service_provider,
      amount: parseFloat(req.body.amount),
      currency: req.body.currency || 'USD',
      billing_cycle: req.body.billing_cycle,
      next_billing_date: req.body.next_billing_date,
      status: req.body.status || 'active',
      payment_method: req.body.payment_method || null,
      description: req.body.description || null,
      category: req.body.category || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    subscriptions.push(subscription);
    db.data.subscriptions = subscriptions;
    await db.write();

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update subscription
router.put('/:id', [
  param('id').isInt(),
  body('name').optional().notEmpty().trim(),
  body('service_provider').optional().notEmpty().trim(),
  body('amount').optional().isFloat({ min: 0 }),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('billing_cycle').optional().isIn(['monthly', 'yearly', 'weekly', 'quarterly']),
  body('next_billing_date').optional().notEmpty(),
  body('status').optional().isIn(['active', 'cancelled', 'paused']),
  body('payment_method').optional().trim(),
  body('description').optional().trim(),
  body('category').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDatabase();
    const subscriptions = db.data.subscriptions || [];
    const index = subscriptions.findIndex(s => s.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const subscription = subscriptions[index];
    
    // Update only provided fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        if (key === 'amount') {
          subscription[key] = parseFloat(req.body[key]);
        } else {
          subscription[key] = req.body[key];
        }
      }
    });
    
    subscription.updated_at = new Date().toISOString();
    subscriptions[index] = subscription;
    db.data.subscriptions = subscriptions;
    await db.write();

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete subscription
router.delete('/:id', [
  param('id').isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDatabase();
    const subscriptions = db.data.subscriptions || [];
    const index = subscriptions.findIndex(s => s.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Also delete related payments
    const payments = db.data.payments || [];
    db.data.payments = payments.filter(p => p.subscription_id !== parseInt(req.params.id));
    
    subscriptions.splice(index, 1);
    db.data.subscriptions = subscriptions;
    await db.write();

    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription statistics
router.get('/stats/summary', (req, res) => {
  try {
    const db = getDatabase();
    const subscriptions = db.data.subscriptions || [];
    
    const stats = {
      total_subscriptions: subscriptions.length,
      active_subscriptions: subscriptions.filter(s => s.status === 'active').length,
      cancelled_subscriptions: subscriptions.filter(s => s.status === 'cancelled').length,
      total_monthly_cost: subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + (s.amount || 0), 0),
      total_categories: new Set(subscriptions.map(s => s.category).filter(Boolean)).size
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
