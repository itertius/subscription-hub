function StatsDashboard({ stats, subscriptions }) {
  const upcomingPayments = subscriptions
    .filter(s => s.status === 'active')
    .sort((a, b) => new Date(a.next_billing_date) - new Date(b.next_billing_date))
    .slice(0, 5)

  const categoryBreakdown = subscriptions.reduce((acc, sub) => {
    const cat = sub.category || 'Uncategorized'
    if (!acc[cat]) {
      acc[cat] = { count: 0, total: 0 }
    }
    acc[cat].count++
    if (sub.status === 'active') {
      acc[cat].total += parseFloat(sub.amount) || 0
    }
    return acc
  }, {})

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total_subscriptions}</div>
          <div className="stat-label">Total Subscriptions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active_subscriptions}</div>
          <div className="stat-label">Active Subscriptions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{parseFloat(stats.total_monthly_cost || 0).toFixed(0)}฿</div>
          <div className="stat-label">Total Monthly Cost</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total_categories}</div>
          <div className="stat-label">Categories</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="card">
          <h3 className="card-title">Upcoming Payments</h3>
          {upcomingPayments.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
              No upcoming payments
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {upcomingPayments.map(sub => (
                <li
                  key={sub.id}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong>{sub.name}</strong>
                    <div style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {new Date(sub.next_billing_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', color: '#667eea' }}>
                    {sub.currency} {parseFloat(sub.amount).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3 className="card-title">Category Breakdown</h3>
          {Object.keys(categoryBreakdown).length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
              No categories assigned
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {Object.entries(categoryBreakdown)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([category, data]) => (
                  <li
                    key={category}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong>{category}</strong>
                      <div style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {data.count} subscription{data.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', color: '#667eea' }}>
                      ${data.total.toFixed(2)}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

export default StatsDashboard

