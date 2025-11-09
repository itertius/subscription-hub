import { useState } from 'react'
import { format } from 'date-fns'
import SubscriptionCard from './SubscriptionCard'
import PaymentModal from './PaymentModal'

function SubscriptionList({ subscriptions, onEdit, onDelete, onAddPayment }) {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  const categories = [...new Set(subscriptions.map(s => s.category).filter(Boolean))]

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filterStatus !== 'all' && sub.status !== filterStatus) return false
    if (filterCategory !== 'all' && sub.category !== filterCategory) return false
    return true
  })

  const handleAddPaymentClick = (subscription) => {
    setSelectedSubscription(subscription)
    setPaymentModalOpen(true)
  }

  const handlePaymentSubmit = (paymentData) => {
    onAddPayment({
      ...paymentData,
      subscription_id: selectedSubscription.id
    })
    setPaymentModalOpen(false)
    setSelectedSubscription(null)
  }

  if (subscriptions.length === 0) {
    return (
      <div className="empty-state card">
        <div>📭</div>
        <h2>No subscriptions yet</h2>
        <p>Add your first subscription to get started!</p>
      </div>
    )
  }

  return (
    <>
      <div className="filters card">
        <div className="form-group" style={{ marginBottom: 0, display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label>Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="paused">Paused</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Category:</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="subscriptions-grid">
        {filteredSubscriptions.map(subscription => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddPayment={handleAddPaymentClick}
          />
        ))}
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className="empty-state card">
          <div>🔍</div>
          <h2>No subscriptions match your filters</h2>
          <p>Try adjusting your filter criteria</p>
        </div>
      )}

      {paymentModalOpen && (
        <PaymentModal
          subscription={selectedSubscription}
          onSubmit={handlePaymentSubmit}
          onClose={() => {
            setPaymentModalOpen(false)
            setSelectedSubscription(null)
          }}
        />
      )}
    </>
  )
}

export default SubscriptionList

