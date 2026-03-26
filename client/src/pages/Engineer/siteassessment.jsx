// pages/Engineer/SiteAssessment.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { FaEye, FaFileInvoice, FaDownload, FaSpinner } from 'react-icons/fa';
import '../../styles/Engineer/siteAssessment.css';

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
      
      const freeQuotesRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/free-quotes/engineer/my-quotes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFreeQuotes(freeQuotesRes.data.quotes || []);
      
      const preAssessmentsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/pre-assessments/engineer/my-assessments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreAssessments(preAssessmentsRes.data.assessments || []);
      
      const combined = [
        ...(freeQuotesRes.data.quotes || []).map(q => ({ ...q, type: 'free_quote' })),
        ...(preAssessmentsRes.data.assessments || []).map(p => ({ ...p, type: 'pre_assessment' }))
      ];
      setAssessments(combined);
      
    } catch (error) {
      console.error('Error fetching assessments:', error);
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
    
    if (item.type === 'pre_assessment' && item.iotDeviceId) {
      fetchIoTData(item._id);
    }
  };

  const handleGenerateQuotation = (item) => {
    setSelectedItem(item);
    setShowQuotationModal(true);
    
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
        'pending': <span className="status-badge-engsiteassess pending-engsiteassess">Pending - Needs Quotation</span>,
        'processing': <span className="status-badge-engsiteassess processing-engsiteassess">Processing</span>,
        'completed': <span className="status-badge-engsiteassess completed-engsiteassess">Quotation Sent</span>,
        'cancelled': <span className="status-badge-engsiteassess cancelled-engsiteassess">Cancelled</span>
      };
      return badges[item.status] || <span className="status-badge-engsiteassess">{item.status}</span>;
    } else {
      const badges = {
        'scheduled': <span className="status-badge-engsiteassess scheduled-engsiteassess">Awaiting IoT Deployment</span>,
        'device_deployed': <span className="status-badge-engsiteassess deployed-engsiteassess">IoT Device Deployed - Collecting Data</span>,
        'data_collecting': <span className="status-badge-engsiteassess collecting-engsiteassess">Data Collection ({item.totalReadings || 0} readings)</span>,
        'data_analyzing': <span className="status-badge-engsiteassess analyzing-engsiteassess">Ready for Quotation</span>,
        'report_draft': <span className="status-badge-engsiteassess draft-engsiteassess">Quotation Draft Ready</span>,
        'completed': <span className="status-badge-engsiteassess completed-engsiteassess">Quotation Sent</span>
      };
      return badges[item.assessmentStatus] || <span className="status-badge-engsiteassess">{item.assessmentStatus}</span>;
    }
  };

  const canGenerateQuotation = (item) => {
    if (item.type === 'free_quote') {
      return item.status === 'pending' || item.status === 'processing';
    } else {
      return item.assessmentStatus === 'data_analyzing' || item.assessmentStatus === 'report_draft';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getFilteredItems = () => {
    if (activeTab === 'free_quotes') return freeQuotes.map(q => ({ ...q, type: 'free_quote' }));
    if (activeTab === 'pre_assessments') return preAssessments.map(p => ({ ...p, type: 'pre_assessment' }));
    return assessments;
  };

  const filteredItems = getFilteredItems();

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="site-assessment-container-engsiteassess">
      <div className="assessment-header-engsiteassess">
        <div className="skeleton-line-engsiteassess large-engsiteassess"></div>
        <div className="skeleton-line-engsiteassess medium-engsiteassess"></div>
        <div className="skeleton-tabs-engsiteassess">
          <div className="skeleton-tab-engsiteassess"></div>
          <div className="skeleton-tab-engsiteassess"></div>
          <div className="skeleton-tab-engsiteassess"></div>
        </div>
      </div>
      <div className="assessments-grid-engsiteassess">
        {[1, 2, 3].map(i => (
          <div key={i} className="assessment-card-engsiteassess skeleton-card-engsiteassess">
            <div className="skeleton-line-engsiteassess medium-engsiteassess"></div>
            <div className="skeleton-line-engsiteassess small-engsiteassess"></div>
            <div className="skeleton-line-engsiteassess small-engsiteassess"></div>
            <div className="skeleton-button-engsiteassess"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <Helmet>
        <title>My Site Assessments | Engineer Dashboard</title>
      </Helmet>
      
      <div className="site-assessment-container-engsiteassess">
        <div className="assessment-header-engsiteassess">
          <h1>My Site Assessments</h1>
          <p>View and manage assessments assigned to you</p>
          <div className="tabs-engsiteassess">
            <button 
              className={`tab-btn-engsiteassess ${activeTab === 'all' ? 'active-engsiteassess' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({assessments.length})
            </button>
            <button 
              className={`tab-btn-engsiteassess ${activeTab === 'free_quotes' ? 'active-engsiteassess' : ''}`}
              onClick={() => setActiveTab('free_quotes')}
            >
              Free Quotes ({freeQuotes.length})
            </button>
            <button 
              className={`tab-btn-engsiteassess ${activeTab === 'pre_assessments' ? 'active-engsiteassess' : ''}`}
              onClick={() => setActiveTab('pre_assessments')}
            >
              Pre-Assessments ({preAssessments.length})
            </button>
          </div>
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="empty-state-engsiteassess">
            <h3>No assessments assigned</h3>
            <p>You don't have any site assessments at the moment. Assessments will appear here once assigned by admin.</p>
          </div>
        ) : (
          <div className="assessments-grid-engsiteassess">
            {filteredItems.map(item => (
              <div key={`${item.type}_${item._id}`} className="assessment-card-engsiteassess">
                <div className="card-header-engsiteassess">
                  <div className="card-title-engsiteassess">
                    <h3>{item.type === 'free_quote' ? item.quotationReference : item.bookingReference}</h3>
                  </div>
                  {getStatusBadge(item)}
                </div>
                
                <div className="card-body-engsiteassess">
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
                    </>
                  )}
                </div>
                
                <div className="card-actions-engsiteassess">
                  <button className="btn-secondary-engsiteassess" onClick={() => handleViewDetails(item)}>
                    View Details
                  </button>
                  {canGenerateQuotation(item) && (
                    <button className="btn-primary-engsiteassess" onClick={() => handleGenerateQuotation(item)}>
                      {item.type === 'free_quote' ? 'Create Quotation' : 'Generate Quotation'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Details Modal */}
        {showDetailsModal && selectedItem && (
          <div className="modal-overlay-engsiteassess" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-content-engsiteassess large-engsiteassess" onClick={e => e.stopPropagation()}>
              <button className="modal-close-engsiteassess" onClick={() => setShowDetailsModal(false)}>×</button>
              <h2>{selectedItem.type === 'free_quote' ? 'Free Quote Details' : 'Pre-Assessment Details'}</h2>
              <p className="modal-subtitle-engsiteassess">Assigned to you by Admin</p>
              
              <div className="assessment-details-engsiteassess">
                <div className="details-section-engsiteassess">
                  <h3>Client Information</h3>
                  <p><strong>Name:</strong> {selectedItem.clientId?.contactFirstName} {selectedItem.clientId?.contactLastName}</p>
                  <p><strong>Contact:</strong> {selectedItem.clientId?.contactNumber}</p>
                  <p><strong>Email:</strong> {selectedItem.clientId?.userId?.email}</p>
                  <p><strong>Property Type:</strong> {selectedItem.propertyType}</p>
                </div>
                
                {selectedItem.type === 'free_quote' ? (
                  <div className="details-section-engsiteassess">
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
                    <div className="details-section-engsiteassess">
                      <h3>Pre-Assessment Details</h3>
                      <p><strong>Booking Reference:</strong> {selectedItem.bookingReference}</p>
                      <p><strong>Invoice Number:</strong> {selectedItem.invoiceNumber}</p>
                      <p><strong>Preferred Date:</strong> {new Date(selectedItem.preferredDate).toLocaleDateString()}</p>
                      <p><strong>Address:</strong> {selectedItem.addressId?.street}, {selectedItem.addressId?.city}, {selectedItem.addressId?.province}</p>
                    </div>
                    
                    {selectedItem.iotDeviceId && (
                      <div className="details-section-engsiteassess">
                        <h3>IoT Data Collection</h3>
                        <p><strong>Device ID:</strong> {selectedItem.iotDeviceId.deviceId || 'N/A'}</p>
                        <p><strong>Deployed At:</strong> {selectedItem.deviceDeployedAt ? new Date(selectedItem.deviceDeployedAt).toLocaleString() : 'Not deployed'}</p>
                        <p><strong>Total Readings:</strong> {selectedItem.totalReadings || 0}</p>
                        
                        {iotData.length > 0 && (
                          <div className="iot-data-summary-engsiteassess">
                            <button 
                              className="btn-secondary-engsiteassess small-engsiteassess"
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
                  <div className="details-section-engsiteassess">
                    <h3>Generated Quotation</h3>
                    <p><strong>Quotation Number:</strong> {selectedItem.quotation.quotationNumber}</p>
                    <p><strong>Total Cost:</strong> {formatCurrency(selectedItem.quotation.systemDetails?.totalCost || 0)}</p>
                    <p><strong>System Size:</strong> {selectedItem.quotation.systemDetails?.systemSize} kW</p>
                    <a href={selectedItem.quotation.quotationUrl} target="_blank" rel="noopener noreferrer" className="btn-link-engsiteassess">
                      Download Quotation PDF
                    </a>
                  </div>
                )}
              </div>
              
              <div className="modal-actions-engsiteassess">
                {canGenerateQuotation(selectedItem) && (
                  <button className="btn-primary-engsiteassess" onClick={() => {
                    setShowDetailsModal(false);
                    handleGenerateQuotation(selectedItem);
                  }}>
                    {selectedItem.type === 'free_quote' ? 'Create Quotation' : 'Generate Quotation'}
                  </button>
                )}
                <button className="btn-secondary-engsiteassess" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Quotation Generation Modal */}
        {showQuotationModal && selectedItem && (
          <div className="modal-overlay-engsiteassess" onClick={() => setShowQuotationModal(false)}>
            <div className="modal-content-engsiteassess large-engsiteassess" onClick={e => e.stopPropagation()}>
              <button className="modal-close-engsiteassess" onClick={() => setShowQuotationModal(false)}>×</button>
              <h2>{selectedItem.type === 'free_quote' ? 'Create Quotation' : 'Generate Quotation'}</h2>
              <p className="modal-subtitle-engsiteassess">
                {selectedItem.type === 'free_quote' 
                  ? 'Create a quotation based on customer requirements'
                  : 'Create a detailed quotation based on 7-day IoT data collection'}
              </p>
              
              <div className="info-box-engsiteassess">
                <strong>Client:</strong> {selectedItem.clientId?.contactFirstName} {selectedItem.clientId?.contactLastName}
                <br />
                <strong>Property Type:</strong> {selectedItem.propertyType}
                {selectedItem.type === 'pre_assessment' && selectedItem.totalReadings > 0 && (
                  <>
                    <br />
                    <strong>IoT Data Collected:</strong> {selectedItem.totalReadings} readings
                  </>
                )}
              </div>
              
              <div className="form-group-engsiteassess">
                <label>Quotation PDF *</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setQuotationForm({...quotationForm, quotationFile: e.target.files[0]})}
                />
                <small>Upload your detailed quotation in PDF format</small>
              </div>
              
              <div className="form-row-engsiteassess">
                <div className="form-group-engsiteassess">
                  <label>Quotation Number</label>
                  <input
                    type="text"
                    value={quotationForm.quotationNumber}
                    onChange={(e) => setQuotationForm({...quotationForm, quotationNumber: e.target.value})}
                    placeholder={`Q-${new Date().getFullYear()}-001`}
                  />
                </div>
                
                <div className="form-group-engsiteassess">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={quotationForm.quotationExpiryDate}
                    onChange={(e) => setQuotationForm({...quotationForm, quotationExpiryDate: e.target.value})}
                  />
                </div>
              </div>
              
              <h3>System Specifications</h3>
              <div className="form-row-engsiteassess">
                <div className="form-group-engsiteassess">
                  <label>System Size (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={quotationForm.systemSize}
                    onChange={(e) => setQuotationForm({...quotationForm, systemSize: e.target.value})}
                    placeholder="e.g., 5.0"
                  />
                </div>
                
                <div className="form-group-engsiteassess">
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
              
              <div className="form-row-engsiteassess">
                <div className="form-group-engsiteassess">
                  <label>Number of Panels</label>
                  <input
                    type="number"
                    value={quotationForm.panelsNeeded}
                    onChange={(e) => setQuotationForm({...quotationForm, panelsNeeded: e.target.value})}
                    placeholder="e.g., 15"
                  />
                </div>
                
                <div className="form-group-engsiteassess">
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
              <div className="form-row-engsiteassess">
                <div className="form-group-engsiteassess">
                  <label>Equipment Cost (₱)</label>
                  <input
                    type="number"
                    value={quotationForm.equipmentCost}
                    onChange={(e) => setQuotationForm({...quotationForm, equipmentCost: e.target.value})}
                    placeholder="0"
                  />
                </div>
                
                <div className="form-group-engsiteassess">
                  <label>Installation Cost (₱)</label>
                  <input
                    type="number"
                    value={quotationForm.installationCost}
                    onChange={(e) => setQuotationForm({...quotationForm, installationCost: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="form-row-engsiteassess">
                <div className="form-group-engsiteassess">
                  <label>Total Cost (₱)</label>
                  <input
                    type="number"
                    value={quotationForm.totalCost}
                    onChange={(e) => setQuotationForm({...quotationForm, totalCost: e.target.value})}
                    placeholder="0"
                  />
                </div>
                
                <div className="form-group-engsiteassess">
                  <label>Payment Terms</label>
                  <input
                    type="text"
                    value={quotationForm.paymentTerms}
                    onChange={(e) => setQuotationForm({...quotationForm, paymentTerms: e.target.value})}
                    placeholder="e.g., 30% down payment, balance upon completion"
                  />
                </div>
              </div>
              
              <div className="form-group-engsiteassess">
                <label>Additional Notes</label>
                <textarea
                  rows="3"
                  value={quotationForm.notes}
                  onChange={(e) => setQuotationForm({...quotationForm, notes: e.target.value})}
                  placeholder="Any additional notes or special considerations..."
                />
              </div>
              
              <div className="modal-actions-engsiteassess">
                <button className="btn-secondary-engsiteassess" onClick={() => setShowQuotationModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary-engsiteassess" onClick={handleUploadQuotation} disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Upload Quotation'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* IoT Data Modal */}
        {showIoTDataModal && (
          <div className="modal-overlay-engsiteassess" onClick={() => setShowIoTDataModal(false)}>
            <div className="modal-content-engsiteassess large-engsiteassess" onClick={e => e.stopPropagation()}>
              <button className="modal-close-engsiteassess" onClick={() => setShowIoTDataModal(false)}>×</button>
              <h2>IoT Data Readings</h2>
              <p className="modal-subtitle-engsiteassess">7-day data collection from site assessment</p>
              
              <div className="iot-data-table-engsiteassess">
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
                    {iotData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-state-engsiteassess">No IoT data available</td>
                      </tr>
                    ) : (
                      iotData.map((reading, index) => (
                        <tr key={index}>
                          <td>{new Date(reading.timestamp).toLocaleString()}</td>
                          <td>{reading.voltage?.toFixed(2) || 'N/A'}</td>
                          <td>{reading.current?.toFixed(2) || 'N/A'}</td>
                          <td>{reading.power?.toFixed(2) || 'N/A'}</td>
                          <td>{reading.temperature?.toFixed(1) || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="modal-actions-engsiteassess">
                <button className="btn-secondary-engsiteassess" onClick={() => setShowIoTDataModal(false)}>
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