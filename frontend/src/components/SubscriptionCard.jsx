import { format, parseISO, isBefore } from 'date-fns'

function SubscriptionCard({ subscription, onEdit, onDelete, onAddPayment }) {
  const nextBillingDate = parseISO(subscription.next_billing_date)
  const isDueSoon = isBefore(nextBillingDate, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

  return (
    <div className="card subscription-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{subscription.name}</h3>
          <p style={{ color: '#666', marginTop: '0.25rem' }}>{subscription.service_provider}</p>
        </div>
        <span className={`status-badge status-${subscription.status}`}>
          {subscription.status}
        </span>
      </div>

      <div className="subscription-details">
        <div className="detail-row">
          <span className="detail-label">Amount:</span>
          <span className="detail-value">
            {subscription.currency} {parseFloat(subscription.amount).toFixed(2)}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Billing Cycle:</span>
          <span className="detail-value" style={{ textTransform: 'capitalize' }}>
            {subscription.billing_cycle}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Next Billing:</span>
          <span className={`detail-value ${isDueSoon ? 'due-soon' : ''}`}>
            {format(nextBillingDate, 'MMM dd, yyyy')}
          </span>
        </div>

        {subscription.category && (
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{subscription.category}</span>
          </div>
        )}

        {subscription.payment_method && (
          <div className="detail-row">
            <span className="detail-label">Payment Method:</span>
            <span className="detail-value">{subscription.payment_method}</span>
          </div>
        )}

        {subscription.description && (
          <div className="detail-row">
            <span className="detail-label">Description:</span>
            <p style={{ marginTop: '0.5rem', color: '#666' }}>{subscription.description}</p>
          </div>
        )}
      </div>

      <div className="card-actions">
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => onAddPayment(subscription)}
        >
          Record Payment
        </button>
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => onEdit(subscription)}
        >
          Edit
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => onDelete(subscription.id)}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default SubscriptionCard

