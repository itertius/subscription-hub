import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import SubscriptionList from './components/SubscriptionList'
import SubscriptionForm from './components/SubscriptionForm'
import PaymentHistory from './components/PaymentHistory'
import StatsDashboard from './components/StatsDashboard'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function App() {
  const [subscriptions, setSubscriptions] = useState([])
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [activeTab, setActiveTab] = useState('subscriptions')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [subsRes, paymentsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/subscriptions`),
        axios.get(`${API_URL}/payments`),
        axios.get(`${API_URL}/subscriptions/stats/summary`)
      ])
      setSubscriptions(subsRes.data)
      setPayments(paymentsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubscription = async (subscriptionData) => {
    try {
      if (editingSubscription) {
        await axios.put(`${API_URL}/subscriptions/${editingSubscription.id}`, subscriptionData)
      } else {
        await axios.post(`${API_URL}/subscriptions`, subscriptionData)
      }
      await fetchData()
      setShowForm(false)
      setEditingSubscription(null)
    } catch (error) {
      console.error('Error saving subscription:', error)
      alert('Error saving subscription. Please try again.')
    }
  }

  const handleEditSubscription = (subscription) => {
    setEditingSubscription(subscription)
    setShowForm(true)
  }

  const handleDeleteSubscription = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await axios.delete(`${API_URL}/subscriptions/${id}`)
        await fetchData()
      } catch (error) {
        console.error('Error deleting subscription:', error)
        alert('Error deleting subscription. Please try again.')
      }
    }
  }

  const handleAddPayment = async (paymentData) => {
    try {
      await axios.post(`${API_URL}/payments`, paymentData)
      await fetchData()
    } catch (error) {
      console.error('Error adding payment:', error)
      alert('Error adding payment. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📦 Subscription Hub</h1>
        <p>Manage your subscription payments in one place</p>
      </header>

      <nav className="app-nav">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'subscriptions' ? 'active' : ''}
          onClick={() => setActiveTab('subscriptions')}
        >
          Subscriptions
        </button>
        <button
          className={activeTab === 'payments' ? 'active' : ''}
          onClick={() => setActiveTab('payments')}
        >
          Payment History
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && stats && (
          <StatsDashboard stats={stats} subscriptions={subscriptions} />
        )}

        {activeTab === 'subscriptions' && (
          <>
            <div className="action-bar">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingSubscription(null)
                  setShowForm(true)
                }}
              >
                + Add Subscription
              </button>
            </div>

            {showForm && (
              <SubscriptionForm
                subscription={editingSubscription}
                onSubmit={handleAddSubscription}
                onCancel={() => {
                  setShowForm(false)
                  setEditingSubscription(null)
                }}
              />
            )}

            <SubscriptionList
              subscriptions={subscriptions}
              onEdit={handleEditSubscription}
              onDelete={handleDeleteSubscription}
              onAddPayment={handleAddPayment}
            />
          </>
        )}

        {activeTab === 'payments' && (
          <PaymentHistory payments={payments} subscriptions={subscriptions} />
        )}
      </main>
    </div>
  )
}

export default App

