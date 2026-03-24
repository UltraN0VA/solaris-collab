// pages/Admin/SiteAssessment.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { 
  FaSearch, 
  FaEye, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner,
  FaFileInvoice,
  FaMoneyBillWave,
  FaQrcode,
  FaClock,
  FaExclamationTriangle,
  FaDownload,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBuilding,
  FaMicrochip,
  FaUserCog,
  FaEnvelope,
  FaPhone,
  FaRegFileAlt,
  FaClipboardList,
  FaFileAlt,
  FaEdit,
  FaUserCheck,
  FaTools
} from 'react-icons/fa';
import '../../styles/Admin/siteAssessment.css';

const SiteAssessment = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('free-quotes'); // 'free-quotes' or 'pre-assessments'
  const [freeQuotes, setFreeQuotes] = useState([]);
  const [preAssessments, setPreAssessments] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAssignEngineerModal, setShowAssignEngineerModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [verificationNote, setVerificationNote] = useState('');
  const [engineerId, setEngineerId] = useState('');
  const [siteVisitDate, setSiteVisitDate] = useState('');
  const [siteVisitNotes, setSiteVisitNotes] = useState('');
  const [quotationFile, setQuotationFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [engineers, setEngineers] = useState([]);
  const [stats, setStats] = useState({
    freeQuotes: { total: 0, pending: 0, completed: 0 },
    preAssessments: { total: 0, pending: 0, forVerification: 0, paid: 0, scheduled: 0, completed: 0 }
  });

  useEffect(() => {
    fetchData();
    fetchEngineers();
    fetchStats();
  }, [activeTab, filter, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');

      if (activeTab === 'free-quotes') {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/free-quotes`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: filter === 'all' ? undefined : filter, page: currentPage, limit: 10 }
        });
        setFreeQuotes(response.data.quotes || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pre-assessments`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: filter === 'all' ? undefined : filter, page: currentPage, limit: 10 }
        });
        setPreAssessments(response.data.assessments || []);
        setTotalPages(response.data.totalPages || 1);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchEngineers = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users?role=engineer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEngineers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching engineers:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('token');
      
      // Fetch free quotes stats
      const freeQuotesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/free-quotes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const quotes = freeQuotesRes.data.quotes || [];
      
      // Fetch pre-assessments stats
      const preAssessmentsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/pre-assessments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const assessments = preAssessmentsRes.data.assessments || [];
      
      setStats({
        freeQuotes: {
          total: quotes.length,
          pending: quotes.filter(q => q.status === 'pending').length,
          completed: quotes.filter(q => q.status === 'completed').length
        },
        preAssessments: {
          total: assessments.length,
          pending: assessments.filter(a => a.paymentStatus === 'pending').length,
          forVerification: assessments.filter(a => a.paymentStatus === 'for_verification').length,
          paid: assessments.filter(a => a.paymentStatus === 'paid').length,
          scheduled: assessments.filter(a => a.assessmentStatus === 'scheduled').length,
          completed: assessments.filter(a => a.assessmentStatus === 'completed').length
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/free-quotes/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Status updated successfully');
      fetchData();
      fetchStats();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleVerifyPayment = async (verified) => {
    if (!selectedItem) return;

    try {
      const token = sessionStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/pre-assessments/${selectedItem._id}/verify-payment`,
        { verified, notes: verificationNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(verified ? 'Payment verified successfully!' : 'Payment rejected');
      setShowVerifyModal(false);
      setSelectedItem(null);
      setVerificationNote('');
      fetchData();
      fetchStats();
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment');
    }
  };

  const handleAssignEngineer = async () => {
    if (!selectedItem || !engineerId) return;

    try {
      const token = sessionStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/pre-assessments/${selectedItem._id}/assign-engineer`,
        { engineerId, siteVisitDate, notes: siteVisitNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Engineer assigned successfully');
      setShowAssignEngineerModal(false);
      setSelectedItem(null);
      setEngineerId('');
      setSiteVisitDate('');
      setSiteVisitNotes('');
      fetchData();
    } catch (error) {
      console.error('Error assigning engineer:', error);
      alert('Failed to assign engineer');
    }
  };

  const handleUploadQuotation = async () => {
    if (!selectedItem || !quotationFile) return;

    setUploading(true);
    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('quotation', quotationFile);
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/free-quotes/${selectedItem._id}/upload-quotation`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      
      alert('Quotation uploaded and sent to customer');
      setShowUploadModal(false);
      setSelectedItem(null);
      setQuotationFile(null);
      fetchData();
    } catch (error) {
      console.error('Error uploading quotation:', error);
      alert('Failed to upload quotation');
    } finally {
      setUploading(false);
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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status, type) => {
    const badges = {
      'free-quote': {
        'pending': <span className="status-badge pending">Pending</span>,
        'processing': <span className="status-badge processing">Processing</span>,
        'completed': <span className="status-badge completed">Completed</span>,
        'cancelled': <span className="status-badge cancelled">Cancelled</span>
      },
      'pre-assessment': {
        'pending_payment': <span className="status-badge pending">Pending Payment</span>,
        'pending': <span className="status-badge pending">Pending</span>,
        'for_verification': <span className="status-badge for-verification">For Verification</span>,
        'paid': <span className="status-badge paid">Paid</span>,
        'scheduled': <span className="status-badge scheduled">Scheduled</span>,
        'device_deployed': <span className="status-badge deployed">Device Deployed</span>,
        'data_collecting': <span className="status-badge collecting">Data Collecting</span>,
        'completed': <span className="status-badge completed">Completed</span>
      }
    };
    return badges[type]?.[status] || <span className="status-badge">{status}</span>;
  };

  const filteredItems = (activeTab === 'free-quotes' ? freeQuotes : preAssessments).filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return item.clientId?.contactFirstName?.toLowerCase().includes(searchLower) ||
           item.clientId?.contactLastName?.toLowerCase().includes(searchLower) ||
           (activeTab === 'free-quotes' ? item.quotationReference : item.bookingReference)?.toLowerCase().includes(searchLower);
  });

  if (loading && (activeTab === 'free-quotes' ? freeQuotes.length === 0 : preAssessments.length === 0)) {
    return (
      <div className="site-assessment-loading">
        <FaSpinner className="spinner" />
        <p>Loading site assessments...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Site Assessment | Admin | Salfer Engineering</title>
      </Helmet>

      <div className="site-assessment">
        {/* Header */}
        <div className="assessment-header">
          <h1><FaClipboardList /> Site Assessment Management</h1>
          <p>Manage free quote requests and pre-assessment bookings</p>
        </div>

        {/* Stats Summary */}
        <div className="assessment-stats">
          <div className="stat-card free-quote">
            <div className="stat-icon"><FaRegFileAlt /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.freeQuotes.total}</span>
              <span className="stat-label">Free Quotes</span>
              <div className="stat-detail">
                <span>Pending: {stats.freeQuotes.pending}</span>
                <span>Completed: {stats.freeQuotes.completed}</span>
              </div>
            </div>
          </div>
          <div className="stat-card pre-assessment">
            <div className="stat-icon"><FaClipboardList /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.preAssessments.total}</span>
              <span className="stat-label">Pre-Assessments</span>
              <div className="stat-detail">
                <span>Pending: {stats.preAssessments.pending}</span>
                <span>For Verification: {stats.preAssessments.forVerification}</span>
                <span>Completed: {stats.preAssessments.completed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="assessment-tabs">
          <button 
            className={`tab-btn ${activeTab === 'free-quotes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('free-quotes'); setFilter('all'); setCurrentPage(1); }}
          >
            <FaRegFileAlt /> Free Quotes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pre-assessments' ? 'active' : ''}`}
            onClick={() => { setActiveTab('pre-assessments'); setFilter('all'); setCurrentPage(1); }}
          >
            <FaClipboardList /> Pre-Assessments
          </button>
        </div>

        {/* Filters */}
        <div className="assessment-filters">
          <div className="filter-group">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option>
              {activeTab === 'free-quotes' ? (
                <>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </>
              ) : (
                <>
                  <option value="pending">Pending Payment</option>
                  <option value="for_verification">For Verification</option>
                  <option value="paid">Paid</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                </>
              )}
            </select>
          </div>
          <div className="search-group">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by client name or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="assessment-table-container">
          <table className="assessment-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Client</th>
                <th>Contact</th>
                <th>Date</th>
                {activeTab === 'free-quotes' ? <th>Monthly Bill</th> : <th>Property Type</th>}
                {activeTab === 'free-quotes' ? <th>Capacity</th> : <th>Amount</th>}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <FaClipboardList className="empty-icon" />
                    <p>No {activeTab === 'free-quotes' ? 'free quotes' : 'pre-assessments'} found</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item._id}>
                    <td className="ref-cell">
                      {activeTab === 'free-quotes' ? item.quotationReference : item.bookingReference}
                    </td>
                    <td>
                      {item.clientId?.contactFirstName} {item.clientId?.contactLastName}
                    </td>
                    <td>
                      <div><FaPhone /> {item.clientId?.contactNumber || 'N/A'}</div>
                      <div><FaEnvelope /> {item.clientId?.userId?.email || 'N/A'}</div>
                    </td>
                    <td>{formatDate(activeTab === 'free-quotes' ? item.requestedAt : item.bookedAt)}</td>
                    {activeTab === 'free-quotes' ? (
                      <>
                        <td>{formatCurrency(item.monthlyBill)}</td>
                        <td>{item.desiredCapacity || 'N/A'}</td>
                      </>
                    ) : (
                      <>
                        <td>{item.propertyType}</td>
                        <td>{formatCurrency(item.assessmentFee)}</td>
                      </>
                    )}
                    <td>{getStatusBadge(activeTab === 'free-quotes' ? item.status : item.paymentStatus || item.assessmentStatus, activeTab === 'free-quotes' ? 'free-quote' : 'pre-assessment')}</td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn view"
                        onClick={() => { setSelectedItem(item); setShowDetailModal(true); }}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {activeTab === 'free-quotes' && item.status === 'pending' && (
                        <>
                          <button 
                            className="action-btn process"
                            onClick={() => handleUpdateStatus(item._id, 'processing')}
                            title="Mark as Processing"
                          >
                            <FaTools />
                          </button>
                          <button 
                            className="action-btn upload"
                            onClick={() => { setSelectedItem(item); setShowUploadModal(true); }}
                            title="Upload Quotation"
                          >
                            <FaDownload />
                          </button>
                        </>
                      )}
                      {activeTab === 'pre-assessments' && item.paymentStatus === 'for_verification' && (
                        <>
                          <button 
                            className="action-btn verify"
                            onClick={() => { setSelectedItem(item); setShowVerifyModal(true); }}
                            title="Verify Payment"
                          >
                            <FaCheckCircle />
                          </button>
                          <button 
                            className="action-btn reject"
                            onClick={() => handleVerifyPayment(false)}
                            title="Reject Payment"
                          >
                            <FaTimesCircle />
                          </button>
                        </>
                      )}
                      {activeTab === 'pre-assessments' && item.paymentStatus === 'paid' && item.assessmentStatus === 'scheduled' && (
                        <button 
                          className="action-btn assign"
                          onClick={() => { setSelectedItem(item); setShowAssignEngineerModal(true); }}
                          title="Assign Engineer"
                        >
                          <FaUserCog />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft /> Previous
            </button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button 
              className="page-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedItem && (
          <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
              <h3>Assessment Details</h3>
              <div className="detail-section">
                <h4>Client Information</h4>
                <p><strong>Name:</strong> {selectedItem.clientId?.contactFirstName} {selectedItem.clientId?.contactLastName}</p>
                <p><strong>Email:</strong> {selectedItem.clientId?.userId?.email}</p>
                <p><strong>Contact:</strong> {selectedItem.clientId?.contactNumber}</p>
                <p><strong>Address:</strong> {selectedItem.addressId?.houseOrBuilding} {selectedItem.addressId?.street}, {selectedItem.addressId?.barangay}, {selectedItem.addressId?.cityMunicipality}</p>
              </div>
              {activeTab === 'free-quotes' ? (
                <div className="detail-section">
                  <h4>Quote Details</h4>
                  <p><strong>Reference:</strong> {selectedItem.quotationReference}</p>
                  <p><strong>Monthly Bill:</strong> {formatCurrency(selectedItem.monthlyBill)}</p>
                  <p><strong>Property Type:</strong> {selectedItem.propertyType}</p>
                  <p><strong>Desired Capacity:</strong> {selectedItem.desiredCapacity || 'Not specified'}</p>
                  <p><strong>Status:</strong> {selectedItem.status}</p>
                  <p><strong>Requested:</strong> {formatDate(selectedItem.requestedAt)}</p>
                </div>
              ) : (
                <div className="detail-section">
                  <h4>Assessment Details</h4>
                  <p><strong>Reference:</strong> {selectedItem.bookingReference}</p>
                  <p><strong>Invoice:</strong> {selectedItem.invoiceNumber}</p>
                  <p><strong>Property Type:</strong> {selectedItem.propertyType}</p>
                  <p><strong>Roof Type:</strong> {selectedItem.roofType || 'Not specified'}</p>
                  <p><strong>Preferred Date:</strong> {formatDate(selectedItem.preferredDate)}</p>
                  <p><strong>Assessment Fee:</strong> {formatCurrency(selectedItem.assessmentFee)}</p>
                  <p><strong>Payment Status:</strong> {selectedItem.paymentStatus}</p>
                  <p><strong>Assessment Status:</strong> {selectedItem.assessmentStatus}</p>
                </div>
              )}
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowDetailModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Verify Payment Modal */}
        {showVerifyModal && selectedItem && (
          <div className="modal-overlay" onClick={() => setShowVerifyModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Verify Payment</h3>
              <div className="payment-info">
                <p><strong>Reference:</strong> {selectedItem.bookingReference}</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedItem.assessmentFee)}</p>
                <p><strong>Method:</strong> {selectedItem.paymentMethod?.toUpperCase()}</p>
                <p><strong>Reference #:</strong> {selectedItem.paymentReference || 'N/A'}</p>
              </div>
              <div className="form-group">
                <label>Verification Notes (Optional)</label>
                <textarea
                  rows="3"
                  value={verificationNote}
                  onChange={(e) => setVerificationNote(e.target.value)}
                  placeholder="Add any notes about this verification..."
                />
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowVerifyModal(false)}>Cancel</button>
                <button className="reject-btn" onClick={() => handleVerifyPayment(false)}>Reject</button>
                <button className="verify-btn" onClick={() => handleVerifyPayment(true)}>Verify & Confirm</button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Engineer Modal */}
        {showAssignEngineerModal && selectedItem && (
          <div className="modal-overlay" onClick={() => setShowAssignEngineerModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Assign Engineer</h3>
              <div className="assessment-summary">
                <p><strong>Assessment:</strong> {selectedItem.bookingReference}</p>
                <p><strong>Client:</strong> {selectedItem.clientId?.contactFirstName} {selectedItem.clientId?.contactLastName}</p>
                <p><strong>Address:</strong> {selectedItem.addressId?.houseOrBuilding} {selectedItem.addressId?.street}, {selectedItem.addressId?.barangay}</p>
              </div>
              <div className="form-group">
                <label>Select Engineer</label>
                <select value={engineerId} onChange={(e) => setEngineerId(e.target.value)}>
                  <option value="">Select an engineer...</option>
                  {engineers.map(eng => (
                    <option key={eng._id} value={eng._id}>{eng.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Site Visit Date</label>
                <input type="date" value={siteVisitDate} onChange={(e) => setSiteVisitDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Site Visit Notes</label>
                <textarea rows="3" value={siteVisitNotes} onChange={(e) => setSiteVisitNotes(e.target.value)} placeholder="Add any notes for the engineer..." />
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowAssignEngineerModal(false)}>Cancel</button>
                <button className="assign-btn" onClick={handleAssignEngineer}>Assign Engineer</button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Quotation Modal */}
        {showUploadModal && selectedItem && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Upload Quotation</h3>
              <div className="quote-summary">
                <p><strong>Quote Reference:</strong> {selectedItem.quotationReference}</p>
                <p><strong>Client:</strong> {selectedItem.clientId?.contactFirstName} {selectedItem.clientId?.contactLastName}</p>
                <p><strong>Monthly Bill:</strong> {formatCurrency(selectedItem.monthlyBill)}</p>
              </div>
              <div className="form-group">
                <label>Quotation File (PDF)</label>
                <input type="file" accept=".pdf" onChange={(e) => setQuotationFile(e.target.files[0])} />
                <small>Upload the quotation PDF. This will be sent to the customer via email.</small>
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button className="upload-btn" onClick={handleUploadQuotation} disabled={!quotationFile || uploading}>
                  {uploading ? <><FaSpinner className="spinner" /> Uploading...</> : 'Upload & Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SiteAssessment;