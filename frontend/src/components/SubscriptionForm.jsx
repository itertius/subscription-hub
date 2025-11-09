import { useState, useEffect } from 'react'
import { format } from 'date-fns'

function SubscriptionForm({ subscription, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    service_provider: '',
    amount: '',
    currency: 'USD',
    billing_cycle: 'monthly',
    next_billing_date: format(new Date(), 'yyyy-MM-dd'),
    status: 'active',
    payment_method: '',
    description: '',
    category: ''
  })

  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name || '',
        service_provider: subscription.service_provider || '',
        amount: subscription.amount || '',
        currency: subscription.currency || 'USD',
        billing_cycle: subscription.billing_cycle || 'monthly',
        next_billing_date: subscription.next_billing_date ? subscription.next_billing_date.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
        status: subscription.status || 'active',
        payment_method: subscription.payment_method || '',
        description: subscription.description || '',
        category: subscription.category || ''
      })
    }
  }, [subscription])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="card">
      <h2 className="card-title">{subscription ? 'Edit Subscription' : 'Add New Subscription'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Subscription Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Netflix, Spotify Premium"
          />
        </div>

        <div className="form-group">
          <label htmlFor="service_provider">Service Provider *</label>
          <input
            type="text"
            id="service_provider"
            name="service_provider"
            value={formData.service_provider}
            onChange={handleChange}
            required
            placeholder="e.g., Netflix Inc."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="currency">Currency *</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
              <option value="THB">THB</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="billing_cycle">Billing Cycle *</label>
            <select
              id="billing_cycle"
              name="billing_cycle"
              value={formData.billing_cycle}
              onChange={handleChange}
              required
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="next_billing_date">Next Billing Date *</label>
            <input
              type="date"
              id="next_billing_date"
              name="next_billing_date"
              value={formData.next_billing_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Entertainment, Software, Cloud"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="payment_method">Payment Method</label>
          <input
            type="text"
            id="payment_method"
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            placeholder="e.g., Credit Card, PayPal, Bank Transfer"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Additional notes about this subscription..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {subscription ? 'Update' : 'Create'} Subscription
          </button>
        </div>
      </form>
    </div>
  )
}

export default SubscriptionForm

