// pages/Customer/quotation.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaFileInvoice, 
  FaDownload, 
  FaEye, 
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaCreditCard,
  FaQrcode,
  FaPrint,
  FaEnvelope,
  FaSpinner
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Customer/quotation.css';

const Quotation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('bills');
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentReference, setPaymentReference] = useState('');

  // State for actual data from API
  const [quotations, setQuotations] = useState([]);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);

  // Check if we have a new invoice from booking
  useEffect(() => {
    if (location.state?.newInvoice) {
      // Add the new invoice to bills list
      const newBill = {
        id: location.state.newInvoice.id,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: location.state.newInvoice.amount,
        status: 'pending',
        description: location.state.newInvoice.description || 'Pre Assessment Fee',
        isNew: true
      };
      setBills(prev => [newBill, ...prev]);
      setActiveTab('bills');
    }
  }, [location.state]);

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      
      // Fetch bills from API
      const billsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/pre-assessments/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Transform pre-assessments into bills
      const transformedBills = billsResponse.data.assessments?.map(assessment => ({
        id: assessment.invoiceNumber,
        date: new Date(assessment.bookedAt).toLocaleDateString(),
        dueDate: new Date(assessment.preferredDate).toLocaleDateString(),
        amount: assessment.assessmentFee,
        status: assessment.paymentStatus === 'paid' ? 'paid' : 'pending',
        description: 'Pre Assessment Fee',
        bookingReference: assessment.bookingReference,
        paymentStatus: assessment.paymentStatus
      })) || [];
      
      setBills(transformedBills);
      
      // Fetch payments
      const paymentsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/pre-assessments/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPayments(paymentsResponse.data.payments || []);
      
      // For now, keep mock quotations
      setQuotations([
        {
          id: 'QT-2024-001',
          date: '2024-04-01',
          validUntil: '2024-05-01',
          amount: 250000,
          status: 'pending',
          items: [
            { name: '5kW Solar Panels', qty: 13, price: 15000, total: 195000 },
            { name: '5kW Hybrid Inverter', qty: 1, price: 45000, total: 45000 },
            { name: 'Mounting Structure', qty: 1, price: 8000, total: 8000 },
            { name: 'Installation Labor', qty: 1, price: 2000, total: 2000 }
          ]
        }
      ]);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      case 'paid':
        return <span className="status-badge paid">Paid</span>;
      case 'for_verification':
        return <span className="status-badge for-verification">For Verification</span>;
      case 'expired':
        return <span className="status-badge expired">Expired</span>;
      case 'completed':
        return <span className="status-badge completed">Completed</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePayNow = (bill) => {
    setSelectedInvoice(bill);
    setPaymentMethod('');
    setPaymentProof(null);
    setPaymentReference('');
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    if (paymentMethod === 'gcash' && !paymentProof) {
      alert('Please upload payment proof');
      return;
    }
    
    if (paymentMethod === 'gcash' && !paymentReference) {
      alert('Please enter GCash reference number');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = sessionStorage.getItem('token');
      
      if (paymentMethod === 'gcash') {
        const formData = new FormData();
        formData.append('bookingReference', selectedInvoice.bookingReference);
        formData.append('paymentMethod', 'gcash');
        formData.append('paymentReference', paymentReference);
        formData.append('paymentProof', paymentProof);
        
        await axios.post(`${import.meta.env.VITE_API_URL}/api/pre-assessments/payment`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else if (paymentMethod === 'cash') {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/pre-assessments/cash-payment`, {
          bookingReference: selectedInvoice.bookingReference
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Update the bill status locally
      setBills(prev => prev.map(bill => 
        bill.id === selectedInvoice.id 
          ? { ...bill, status: paymentMethod === 'gcash' ? 'for_verification' : 'pending', paymentStatus: paymentMethod === 'gcash' ? 'for_verification' : 'pending' }
          : bill
      ));
      
      alert('Payment submitted successfully!');
      closeModal();
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Payment error:', err);
      alert(err.response?.data?.message || 'Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setPaymentMethod('');
    setPaymentProof(null);
    setPaymentReference('');
  };

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="billing-container">
      <div className="billing-header">
        <div className="skeleton-line large"></div>
        <div className="skeleton-line small"></div>
      </div>

      <div className="billing-tabs">
        {[1, 2, 3].map((item) => (
          <div key={item} className="skeleton-tab"></div>
        ))}
      </div>

      <div className="skeleton-list">
        {[1, 2].map((item) => (
          <div key={item} className="skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton-line medium"></div>
              <div className="skeleton-badge"></div>
            </div>
            <div className="skeleton-amount"></div>
            <div className="skeleton-actions">
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Quotations & Bills | Salfer Engineering</title>
        </Helmet>
        <SkeletonLoader />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Quotations & Bills | Salfer Engineering</title>
      </Helmet>
      
      <div className="billing-container">
        <div className="billing-header">
          <h1>Quotations & Bills</h1>
          <p>View and manage your quotations and billing statements</p>
        </div>

        {/* Tabs */}
        <div className="billing-tabs">
          <button 
            className={`tab-btn ${activeTab === 'quotations' ? 'active' : ''}`}
            onClick={() => setActiveTab('quotations')}
          >
            <FaFileInvoice /> Quotations
          </button>
          <button 
            className={`tab-btn ${activeTab === 'bills' ? 'active' : ''}`}
            onClick={() => setActiveTab('bills')}
          >
            <FaMoneyBillWave /> Pre-Assessment
          </button>
          <button 
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <FaCreditCard /> Payment History
          </button>
        </div>

        {/* Quotations Tab */}
        {activeTab === 'quotations' && (
          <div className="quotations-list">
            {quotations.length === 0 ? (
              <div className="empty-state">
                <FaFileInvoice className="empty-icon" />
                <h3>No quotations yet</h3>
                <p>Your quotations will appear here</p>
              </div>
            ) : (
              quotations.map(quote => (
                <div key={quote.id} className="quotation-card">
                  <div className="card-header">
                    <div>
                      <h3>{quote.id}</h3>
                      <p>Issued: {new Date(quote.date).toLocaleDateString()}</p>
                      <p>Valid until: {new Date(quote.validUntil).toLocaleDateString()}</p>
                    </div>
                    {getStatusBadge(quote.status)}
                  </div>
                  
                  <div className="card-amount">
                    <span>Total Amount</span>
                    <strong>{formatCurrency(quote.amount)}</strong>
                  </div>

                  <div className="card-actions">
                    <button className="action-btn view" onClick={() => {}}>
                      <FaEye /> View Details
                    </button>
                    <button className="action-btn download">
                      <FaDownload /> Download
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <div className="bills-list">
            {bills.length === 0 ? (
              <div className="empty-state">
                <FaMoneyBillWave className="empty-icon" />
                <h3>No bills yet</h3>
                <p>Your bills will appear here</p>
              </div>
            ) : (
              bills.map(bill => (
                <div key={bill.id} className={`bill-card ${bill.isNew ? 'new' : ''}`}>
                  {bill.isNew && <div className="new-badge">New</div>}
                  <div className="card-header">
                    <div>
                      <h3>{bill.id}</h3>
                      <p>{bill.description}</p>
                      <p>Due: {bill.dueDate}</p>
                    </div>
                    {getStatusBadge(bill.status)}
                  </div>
                  
                  <div className="card-amount">
                    <span>Amount Due</span>
                    <strong>{formatCurrency(bill.amount)}</strong>
                  </div>

                  <div className="card-actions">
                    {(bill.status === 'pending' || bill.paymentStatus === 'pending') && (
                      <button className="action-btn pay" onClick={() => handlePayNow(bill)}>
                        <FaCreditCard /> Pay Now
                      </button>
                    )}
                    {bill.paymentStatus === 'for_verification' && (
                      <span className="payment-status pending-verification">
                        <FaClock /> Payment Pending Verification
                      </span>
                    )}
                    <button className="action-btn view">
                      <FaEye /> View Details
                    </button>
                    <button className="action-btn download">
                      <FaDownload /> Download
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="payments-list">
            {payments.length === 0 ? (
              <div className="empty-state">
                <FaCreditCard className="empty-icon" />
                <h3>No payment history</h3>
                <p>Your payments will appear here</p>
              </div>
            ) : (
              <div className="payments-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Invoice</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment.id}>
                        <td>{new Date(payment.date).toLocaleDateString()}</td>
                        <td>{payment.invoiceId}</td>
                        <td className="amount">{formatCurrency(payment.amount)}</td>
                        <td>{payment.method}</td>
                        <td>{getStatusBadge(payment.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Pay Invoice</h3>
              <div className="modal-body">
                <div className="invoice-summary">
                  <p><strong>Invoice:</strong> {selectedInvoice.id}</p>
                  <p><strong>Amount:</strong> {formatCurrency(selectedInvoice.amount)}</p>
                  <p><strong>Due Date:</strong> {selectedInvoice.dueDate}</p>
                </div>

                <div className="payment-methods">
                  <h4>Select Payment Method</h4>
                  <div className="payment-options">
                    <label className={`payment-option ${paymentMethod === 'gcash' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="gcash"
                        checked={paymentMethod === 'gcash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <FaQrcode /> GCash
                    </label>
                    <label className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <FaMoneyBillWave /> Cash (Walk-in)
                    </label>
                  </div>
                </div>

                {paymentMethod === 'gcash' && (
                  <>
                    <div className="gcash-details">
                      <h4>GCash Details</h4>
                      <p>Number: <strong>0917XXXXXXX</strong></p>
                      <p>Name: <strong>SALFER ENGINEERING CORP</strong></p>
                      <p>Amount: <strong>{formatCurrency(selectedInvoice.amount)}</strong></p>
                    </div>

                    <div className="upload-section">
                      <label>Reference Number *</label>
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="Enter GCash reference number"
                        className="payment-input"
                      />
                    </div>

                    <div className="upload-section">
                      <label>Upload Payment Screenshot *</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPaymentProof(e.target.files[0])}
                      />
                      {paymentProof && <small>Selected: {paymentProof.name}</small>}
                    </div>
                  </>
                )}

                {paymentMethod === 'cash' && (
                  <div className="cash-details">
                    <p>Please visit our office to pay the amount:</p>
                    <div className="office-info">
                      <p><strong>Address:</strong> Purok 2, Masaya, San Jose, Camarines Sur</p>
                      <p><strong>Office Hours:</strong> Mon-Fri, 9AM-6PM</p>
                      <p><strong>Amount:</strong> {formatCurrency(selectedInvoice.amount)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button 
                  className="submit-btn" 
                  onClick={handlePaymentSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <><FaSpinner className="spinner" /> Processing...</> : 'Submit Payment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Quotation;