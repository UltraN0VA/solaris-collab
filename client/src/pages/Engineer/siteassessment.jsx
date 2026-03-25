import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const SiteAssessment = () => {
  const [assessments, setAssessments] = useState([]);
  const [freeQuotes, setFreeQuotes] = useState([]);
  const [preAssessments, setPreAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showIoTDataModal, setShowIoTDataModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iotData, setIoTData] = useState([]);
  
  // Quotation form state
  const [quotationForm, setQuotationForm] = useState({
    quotationNumber: '',
    quotationExpiryDate: '',
    systemSize: '',
    systemType: '',
    panelsNeeded: '',
    inverterType: '',
    batteryType: '',
    installationCost: '',
    equipmentCost: '',
    totalCost: '',
    paymentTerms: '',
    warrantyYears: '10',
    quotationFile: null,
    notes: ''
  });

  useEffect(() => {
    fetchAssessments();
  }, [activeTab]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      
      // Fetch assigned free quotes (admin assigned these to engineer)
      const freeQuotesRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/free-quotes/engineer/my-quotes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFreeQuotes(freeQuotesRes.data.quotes || []);
      
      // Fetch assigned pre-assessments (admin assigned these to engineer)
      const preAssessmentsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/pre-assessments/engineer/my-assessments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreAssessments(preAssessmentsRes.data.assessments || []);
      
      // Combine both for "All" tab
      const combined = [
        ...(freeQuotesRes.data.quotes || []).map(q => ({ ...q, type: 'free_quote' })),
        ...(preAssessmentsRes.data.assessments || []).map(p => ({ ...p, type: 'pre_assessment' }))
      ];
      setAssessments(combined);
      
    } catch (error) {
      console.error('Error fetching assessments:', error);
      alert('Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  const fetchIoTData = async (assessmentId) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/pre-assessments/${assessmentId}/iot-data`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIoTData(response.data.readings || []);
    } catch (error) {
      console.error('Error fetching IoT data:', error);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
    
    // For pre-assessments, fetch IoT data if available
    if (item.type === 'pre_assessment' && item.iotDeviceId) {
      fetchIoTData(item._id);
    }
  };

  const handleGenerateQuotation = (item) => {
    setSelectedItem(item);
    setShowQuotationModal(true);
    
    // Pre-fill form with available data
    if (item.type === 'free_quote') {
      setQuotationForm({
        ...quotationForm,
        systemSize: item.desiredCapacity,
        systemType: 'grid-tie',
        notes: `Free Quote Request - Monthly Bill: ₱${item.monthlyBill}`
      });
    } else if (item.type === 'pre_assessment') {
      setQuotationForm({
        ...quotationForm,
        systemSize: item.finalSystemSize || item.desiredCapacity,
        systemType: item.recommendedSystemType || 'grid-tie',
        panelsNeeded: item.panelsNeeded,
        notes: `Based on 7-day IoT assessment data`
      });
    }
  };

  const handleUploadQuotation = async () => {
    if (!selectedItem) return;
    
    if (!quotationForm.quotationFile) {
      alert('Please select a quotation PDF file');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('quotation', quotationForm.quotationFile);
      formData.append('quotationNumber', quotationForm.quotationNumber);
      formData.append('quotationExpiryDate', quotationForm.quotationExpiryDate);
      formData.append('systemSize', quotationForm.systemSize);
      formData.append('systemType', quotationForm.systemType);
      formData.append('panelsNeeded', quotationForm.panelsNeeded);
      formData.append('inverterType', quotationForm.inverterType);
      formData.append('batteryType', quotationForm.batteryType);
      formData.append('installationCost', quotationForm.installationCost);
      formData.append('equipmentCost', quotationForm.equipmentCost);
      formData.append('totalCost', quotationForm.totalCost);
      formData.append('paymentTerms', quotationForm.paymentTerms);
      formData.append('warrantyYears', quotationForm.warrantyYears);
      formData.append('notes', quotationForm.notes);
      
      let endpoint;
      if (selectedItem.type === 'free_quote') {
        endpoint = `${import.meta.env.VITE_API_URL}/api/free-quotes/${selectedItem._id}/upload-quotation`;
      } else {
        endpoint = `${import.meta.env.VITE_API_URL}/api/pre-assessments/${selectedItem._id}/upload-quotation`;
      }
      
      await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert('Quotation uploaded successfully!');
      setShowQuotationModal(false);
      resetQuotationForm();
      fetchAssessments();
    } catch (error) {
      console.error('Error uploading quotation:', error);
      alert(error.response?.data?.message || 'Failed to upload quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetQuotationForm = () => {
    setQuotationForm({
      quotationNumber: '',
      quotationExpiryDate: '',
      systemSize: '',
      systemType: '',
      panelsNeeded: '',
      inverterType: '',
      batteryType: '',
      installationCost: '',
      equipmentCost: '',
      totalCost: '',
      paymentTerms: '',
      warrantyYears: '10',
      quotationFile: null,
      notes: ''
    });
  };

  const getStatusBadge = (item) => {
    if (item.type === 'free_quote') {
      const badges = {
        'pending': <span className="status-badge pending">Pending - Needs Quotation</span>,
        'processing': <span className="status-badge processing">Processing</span>,
        'completed': <span className="status-badge completed">Quotation Sent</span>,
        'cancelled': <span className="status-badge cancelled">Cancelled</span>
      };
      return badges[item.status] || <span className="status-badge">{item.status}</span>;
    } else {
      const badges = {
        'scheduled': <span className="status-badge scheduled">Awaiting IoT Deployment</span>,
        'device_deployed': <span className="status-badge deployed">IoT Device Deployed - Collecting Data</span>,
        'data_collecting': <span className="status-badge collecting">Data Collection ({item.totalReadings || 0} readings)</span>,
        'data_analyzing': <span className="status-badge analyzing">Ready for Quotation</span>,
        'report_draft': <span className="status-badge draft">Quotation Draft Ready</span>,
        'completed': <span className="status-badge completed">Quotation Sent</span>
      };
      return badges[item.assessmentStatus] || <span className="status-badge">{item.assessmentStatus}</span>;
    }
  };

  const canGenerateQuotation = (item) => {
    if (item.type === 'free_quote') {
      // Engineer can generate quotation for free quotes
      return item.status === 'pending' || item.status === 'processing';
    } else {
      // For pre-assessments, only generate after IoT data collection is complete
      return item.assessmentStatus === 'data_analyzing' || item.assessmentStatus === 'report_draft';
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

  const getTypeIcon = (type) => {
    return type === 'free_quote' ? '📋' : '🔧';
  };

  const getFilteredItems = () => {
    if (activeTab === 'free_quotes') return freeQuotes.map(q => ({ ...q, type: 'free_quote' }));
    if (activeTab === 'pre_assessments') return preAssessments.map(p => ({ ...p, type: 'pre_assessment' }));
    return assessments;
  };

  const filteredItems = getFilteredItems();

  if (loading) {
    return (
      <div className="site-assessment-container">
        <div className="loading-spinner">Loading assessments...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Site Assessments | Engineer Dashboard</title>
      </Helmet>
      
      <div className="site-assessment-container">
        <div className="assessment-header">
          <h1>My Site Assessments</h1>
          <p className="header-description">View and manage assessments assigned to you</p>
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({assessments.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'free_quotes' ? 'active' : ''}`}
              onClick={() => setActiveTab('free_quotes')}
            >
              Free Quotes ({freeQuotes.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'pre_assessments' ? 'active' : ''}`}
              onClick={() => setActiveTab('pre_assessments')}
            >
              Pre-Assessments ({preAssessments.length})
            </button>
          </div>
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <h3>No assessments assigned</h3>
            <p>You don't have any site assessments at the moment. Assessments will appear here once assigned by admin.</p>
          </div>
        ) : (
          <div className="assessments-grid">
            {filteredItems.map(item => (
              <div key={`${item.type}_${item._id}`} className="assessment-card">
                <div className="card-header">
                  <div className="card-title">
                    <span className="type-icon">{getTypeIcon(item.type)}</span>
                    <h3>{item.type === 'free_quote' ? item.quotationReference : item.bookingReference}</h3>
                  </div>
                  {getStatusBadge(item)}
                </div>
                
                <div className="card-body">
                  <p><strong>Client:</strong> {item.clientId?.contactFirstName} {item.clientId?.contactLastName}</p>
                  <p><strong>Property Type:</strong> {item.propertyType}</p>
                  {item.type === 'free_quote' ? (
                    <>
                      <p><strong>Monthly Bill:</strong> {formatCurrency(item.monthlyBill)}</p>
                      <p><strong>Desired Capacity:</strong> {item.desiredCapacity || 'Not specified'}</p>
                    </>
                  ) : (
                    <>
                      <p><strong>Address:</strong> {item.addressId?.street || 'Address not available'}</p>
                      <p><strong>Preferred Date:</strong> {new Date(item.preferredDate).toLocaleDateString()}</p>
                      {item.dataCollectionStart && (
                        <p><strong>Data Collection:</strong> {new Date(item.dataCollectionStart).toLocaleDateString()} - {item.dataCollectionEnd ? new Date(item.dataCollectionEnd).toLocaleDateString() : 'In Progress'}</p>
                      )}
                    </>
                  )}
                </div>
                
                <div className="card-actions">
                  <button className="btn-secondary" onClick={() => handleViewDetails(item)}>
                    View Details
                  </button>
                  {canGenerateQuotation(item) && (
                    <button className="btn-primary" onClick={() => handleGenerateQuotation(item)}>
                      {item.type === 'free_quote' ? 'Create Quotation' : 'Generate Detailed Quotation'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Details Modal */}
        {showDetailsModal && selectedItem && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
              <h2>{selectedItem.type === 'free_quote' ? 'Free Quote Details' : 'Pre-Assessment Details'}</h2>
              <p className="modal-subtitle">Assigned to you by Admin</p>
              
              <div className="assessment-details">
                <div className="details-section">
                  <h3>Client Information</h3>
                  <p><strong>Name:</strong> {selectedItem.clientId?.contactFirstName} {selectedItem.clientId?.contactLastName}</p>
                  <p><strong>Contact:</strong> {selectedItem.clientId?.contactNumber}</p>
                  <p><strong>Email:</strong> {selectedItem.clientId?.userId?.email}</p>
                  <p><strong>Property Type:</strong> {selectedItem.propertyType}</p>
                </div>
                
                {selectedItem.type === 'free_quote' ? (
                  <div className="details-section">
                    <h3>Customer Requirements</h3>
                    <p><strong>Monthly Electricity Bill:</strong> {formatCurrency(selectedItem.monthlyBill)}</p>
                    <p><strong>Desired System Capacity:</strong> {selectedItem.desiredCapacity || 'Not specified'}</p>
                    <p><strong>Requested At:</strong> {new Date(selectedItem.requestedAt).toLocaleString()}</p>
                    {selectedItem.addressId && (
                      <p><strong>Address:</strong> {selectedItem.addressId.street}, {selectedItem.addressId.city}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="details-section">
                      <h3>Pre-Assessment Details</h3>
                      <p><strong>Booking Reference:</strong> {selectedItem.bookingReference}</p>
                      <p><strong>Invoice Number:</strong> {selectedItem.invoiceNumber}</p>
                      <p><strong>Preferred Date:</strong> {new Date(selectedItem.preferredDate).toLocaleDateString()}</p>
                      <p><strong>Address:</strong> {selectedItem.addressId?.street}, {selectedItem.addressId?.city}, {selectedItem.addressId?.province}</p>
                    </div>
                    
                    {/* IoT Data Section */}
                    {selectedItem.iotDeviceId && (
                      <div className="details-section">
                        <h3>IoT Data Collection</h3>
                        <p><strong>Device ID:</strong> {selectedItem.iotDeviceId.deviceId || 'N/A'}</p>
                        <p><strong>Deployed At:</strong> {selectedItem.deviceDeployedAt ? new Date(selectedItem.deviceDeployedAt).toLocaleString() : 'Not deployed'}</p>
                        <p><strong>Data Collection Period:</strong> {selectedItem.dataCollectionStart ? new Date(selectedItem.dataCollectionStart).toLocaleDateString() : 'N/A'} - {selectedItem.dataCollectionEnd ? new Date(selectedItem.dataCollectionEnd).toLocaleDateString() : 'In Progress'}</p>
                        <p><strong>Total Readings:</strong> {selectedItem.totalReadings || 0}</p>
                        
                        {iotData.length > 0 && (
                          <div className="iot-data-summary">
                            <button 
                              className="btn-secondary small"
                              onClick={() => setShowIoTDataModal(true)}
                            >
                              View IoT Data
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
                
                {selectedItem.quotation && (
                  <div className="details-section">
                    <h3>Generated Quotation</h3>
                    <p><strong>Quotation Number:</strong> {selectedItem.quotation.quotationNumber}</p>
                    <p><strong>Total Cost:</strong> {formatCurrency(selectedItem.quotation.systemDetails?.totalCost || 0)}</p>
                    <p><strong>System Size:</strong> {selectedItem.quotation.systemDetails?.systemSize} kW</p>
                    <a href={selectedItem.quotation.quotationUrl} target="_blank" rel="noopener noreferrer" className="btn-link">
                      Download Quotation PDF
                    </a>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                {canGenerateQuotation(selectedItem) && (
                  <button className="btn-primary" onClick={() => {
                    setShowDetailsModal(false);
                    handleGenerateQuotation(selectedItem);
                  }}>
                    {selectedItem.type === 'free_quote' ? 'Create Quotation' : 'Generate Detailed Quotation'}
                  </button>
                )}
                <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Quotation Generation Modal */}
        {showQuotationModal && selectedItem && (
          <div className="modal-overlay" onClick={() => setShowQuotationModal(false)}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowQuotationModal(false)}>×</button>
              <h2>{selectedItem.type === 'free_quote' ? 'Create Quotation' : 'Generate Detailed Quotation'}</h2>
              <p className="modal-subtitle">
                {selectedItem.type === 'free_quote' 
                  ? 'Create a quotation based on customer requirements'
                  : 'Create a detailed quotation based on 7-day IoT data collection'}
              </p>
              
              <div className="info-box">
                <strong>Client:</strong> {selectedItem.clientId?.contactFirstName} {selectedItem.clientId?.contactLastName}
                <br />
                <strong>Property Type:</strong> {selectedItem.propertyType}
                {selectedItem.type === 'pre_assessment' && selectedItem.totalReadings > 0 && (
                  <>
                    <br />
                    <strong>IoT Data Collected:</strong> {selectedItem.totalReadings} readings over {Math.ceil((new Date(selectedItem.dataCollectionEnd || new Date()) - new Date(selectedItem.dataCollectionStart)) / (1000 * 60 * 60 * 24))} days
                  </>
                )}
              </div>
              
              <div className="form-group">
                <label>Quotation PDF *</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setQuotationForm({...quotationForm, quotationFile: e.target.files[0]})}
                />
                <small>Upload your detailed quotation in PDF format</small>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Quotation Number</label>
                  <input
                    type="text"
                    value={quotationForm.quotationNumber}
                    onChange={(e) => setQuotationForm({...quotationForm, quotationNumber: e.target.value})}
                    placeholder={`Q-${new Date().getFullYear()}-001`}
                  />
                </div>
                
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={quotationForm.quotationExpiryDate}
                    onChange={(e) => setQuotationForm({...quotationForm, quotationExpiryDate: e.target.value})}
                  />
                </div>
              </div>
              
              <h3>System Specifications</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>System Size (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={quotationForm.systemSize}
                    onChange={(e) => setQuotationForm({...quotationForm, systemSize: e.target.value})}
                    placeholder="e.g., 5.0"
                  />
                </div>
                
                <div className="form-group">
                  <label>System Type</label>
                  <select
                    value={quotationForm.systemType}
                    onChange={(e) => setQuotationForm({...quotationForm, systemType: e.target.value})}
                  >
                    <option value="grid-tie">Grid-tie (No Battery)</option>
                    <option value="hybrid">Hybrid (With Battery)</option>
                    <option value="off-grid">Off-grid (Complete Independence)</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Number of Panels</label>
                  <input
                    type="number"
                    value={quotationForm.panelsNeeded}
                    onChange={(e) => setQuotationForm({...quotationForm, panelsNeeded: e.target.value})}
                    placeholder="e.g., 15"
                  />
                </div>
                
                <div className="form-group">
                  <label>Inverter Type</label>
                  <input
                    type="text"
                    value={quotationForm.inverterType}
                    onChange={(e) => setQuotationForm({...quotationForm, inverterType: e.target.value})}
                    placeholder="e.g., 5kW Hybrid Inverter"
                  />
                </div>
              </div>
              
              <h3>Cost Breakdown</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Equipment Cost (₱)</label>
                  <input
                    type="number"
                    value={quotationForm.equipmentCost}
                    onChange={(e) => setQuotationForm({...quotationForm, equipmentCost: e.target.value})}
                    placeholder="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Installation Cost (₱)</label>
                  <input
                    type="number"
                    value={quotationForm.installationCost}
                    onChange={(e) => setQuotationForm({...quotationForm, installationCost: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Total Cost (₱)</label>
                  <input
                    type="number"
                    value={quotationForm.totalCost}
                    onChange={(e) => setQuotationForm({...quotationForm, totalCost: e.target.value})}
                    placeholder="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Payment Terms</label>
                  <input
                    type="text"
                    value={quotationForm.paymentTerms}
                    onChange={(e) => setQuotationForm({...quotationForm, paymentTerms: e.target.value})}
                    placeholder="e.g., 30% down payment, balance upon completion"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  rows="3"
                  value={quotationForm.notes}
                  onChange={(e) => setQuotationForm({...quotationForm, notes: e.target.value})}
                  placeholder="Any additional notes or special considerations..."
                />
              </div>
              
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowQuotationModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleUploadQuotation} disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Upload Quotation'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* IoT Data Modal */}
        {showIoTDataModal && (
          <div className="modal-overlay" onClick={() => setShowIoTDataModal(false)}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowIoTDataModal(false)}>×</button>
              <h2>IoT Data Readings</h2>
              <p className="modal-subtitle">7-day data collection from site assessment</p>
              
              <div className="iot-data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date/Time</th>
                      <th>Voltage (V)</th>
                      <th>Current (A)</th>
                      <th>Power (W)</th>
                      <th>Temperature (°C)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {iotData.map((reading, index) => (
                      <tr key={index}>
                        <td>{new Date(reading.timestamp).toLocaleString()}</td>
                        <td>{reading.voltage?.toFixed(2) || 'N/A'}</td>
                        <td>{reading.current?.toFixed(2) || 'N/A'}</td>
                        <td>{reading.power?.toFixed(2) || 'N/A'}</td>
                        <td>{reading.temperature?.toFixed(1) || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowIoTDataModal(false)}>
                  Close
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