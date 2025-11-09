import { format, parseISO } from 'date-fns'

function PaymentHistory({ payments, subscriptions }) {
  if (payments.length === 0) {
    return (
      <div className="empty-state card">
        <div>💳</div>
        <h2>No payment history</h2>
        <p>Record payments for your subscriptions to see them here</p>
      </div>
    )
  }

  const getStatusClass = (status) => {
    const statusMap = {
      completed: 'status-active',
      pending: 'status-paused',
      failed: 'status-cancelled',
      refunded: 'status-cancelled'
    }
    return statusMap[status] || ''
  }

  return (
    <div className="card">
      <h2 className="card-title">Payment History</h2>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Subscription</th>
              <th>Service Provider</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Transaction ID</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>{format(parseISO(payment.payment_date), 'MMM dd, yyyy')}</td>
                <td>{payment.subscription_name || 'N/A'}</td>
                <td>{payment.service_provider || 'N/A'}</td>
                <td>
                  <strong>{payment.currency} {parseFloat(payment.amount).toFixed(2)}</strong>
                </td>
                <td>{payment.payment_method || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
                <td>{payment.transaction_id || '-'}</td>
                <td>{payment.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PaymentHistory

