// pages/Engineer/MyAssessments.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaFileAlt,
  FaUpload,
  FaCheckCircle,
  FaClock,
  FaTools,
  FaWifi,
  FaCamera,
  FaDownload,
  FaEye,
  FaComment,
  FaPaperPlane,
  FaClipboardList,
  FaHardHat,
  FaChartLine,
  FaMicrochip,
  FaImages,
  FaTrash,
  FaPlus
} from 'react-icons/fa';
// import '../../styles/Engineer/MyAssessments.css';

const MyAssessments = () => {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showRetrieveModal, setShowRetrieveModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showFullImageModal, setShowFullImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sitePhotos, setSitePhotos] = useState([]);
  
  const [formData, setFormData] = useState({
    // Deployment Form
    deploymentNotes: '',
    installationLocation: '',
    gpsCoordinates: '',
    deviceSerialAtDeployment: '',
    
    // Site Visit Form
    siteVisitNotes: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    roofCondition: 'good',
    structuralIntegrity: 'good',
    shadingAnalysis: '',
    recommendedPanelPlacement: '',
    
    // Assessment Results
    totalIrradiance: '',
    averageTemperature: '',
    shadingPercentage: '',
    recommendedPanelCount: '',
    estimatedSystemSize: '',
    
    // Comment
    comment: '',
    isPublic: true,
    
    // Site Photos
    photoFiles: [],
    photoCaptions: [],
    photoLocations: []
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    ongoing: 0,
    completed: 0
  });

  useEffect(() => {
    fetchMyAssessments();
  }, []);

  const fetchMyAssessments = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/pre-assessments/engineer/my-assessments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssessments(response.data.assessments || []);
      calculateStats(response.data.assessments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      setLoading(false);
    }
  };

  const fetchSitePhotos = async (assessmentId) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/pre-assessments/${assessmentId}/photos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSitePhotos(response.data.photos || []);
    } catch (error) {
      console.error('Error fetching site photos:', error);
    }
  };

  const calculateStats = (assessmentsList) => {
    const total = assessmentsList.length;
    const pending = assessmentsList.filter(a => a.assessmentStatus === 'device_assigned').length;
    const ongoing = assessmentsList.filter(a => a.assessmentStatus === 'site_visit_ongoing').length;
    const completed = assessmentsList.filter(a => a.assessmentStatus === 'report_draft' || a.assessmentStatus === 'completed').length;
    setStats({ total, pending, ongoing, completed });
  };

  const handleDeployDevice = async () => {
    if (!formData.deploymentNotes) {
      alert('Please enter deployment notes');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/pre-assessments/${selectedAssessment._id}/deploy-device`,
        {
          notes: formData.deploymentNotes,
          location: formData.installationLocation,
          gpsCoordinates: formData.gpsCoordinates,
          deviceSerialAtDeployment: formData.deviceSerialAtDeployment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('✅ Device deployed successfully! Data collection started.');
        setShowDeployModal(false);
        fetchMyAssessments();
        resetForm();
      }
    } catch (error) {
      console.error('Error deploying device:', error);
      alert(error.response?.data?.message || 'Failed to deploy device');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetrieveDevice = async () => {
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/pre-assessments/${selectedAssessment._id}/retrieve-device`,
        { notes: formData.retrievalNotes || 'Device retrieved after data collection' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('✅ Device retrieved successfully! Data collection completed.');
        setShowRetrieveModal(false);
        fetchMyAssessments();
        resetForm();
      }
    } catch (error) {
      console.error('Error retrieving device:', error);
      alert(error.response?.data?.message || 'Failed to retrieve device');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSiteAssessment = async () => {
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/pre-assessments/${selectedAssessment._id}/update-assessment`,
        {
          siteVisitNotes: formData.siteVisitNotes,
          inspectionDate: formData.inspectionDate,
          roofCondition: formData.roofCondition,
          structuralIntegrity: formData.structuralIntegrity,
          shadingAnalysis: formData.shadingAnalysis,
          recommendedPanelPlacement: formData.recommendedPanelPlacement,
          assessmentResults: {
            totalIrradiance: formData.totalIrradiance,
            averageTemperature: formData.averageTemperature,
            shadingPercentage: formData.shadingPercentage,
            recommendedPanelCount: formData.recommendedPanelCount,
            estimatedSystemSize: formData.estimatedSystemSize
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('✅ Site assessment updated successfully!');
        fetchMyAssessments();
        resetForm();
      }
    } catch (error) {
      console.error('Error updating assessment:', error);
      alert(error.response?.data?.message || 'Failed to update assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/pre-assessments/${selectedAssessment._id}/submit-report`,
        {
          recommendations: formData.recommendations,
          technicalFindings: formData.technicalFindings,
          finalSystemSize: formData.finalSystemSize,
          finalSystemCost: formData.finalSystemCost
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('✅ Assessment report submitted successfully!');
        setShowReportModal(false);
        fetchMyAssessments();
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSitePhotos = async () => {
    if (formData.photoFiles.length === 0) {
      alert('Please select at least one photo to upload');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      const token = sessionStorage.getItem('token');
      const uploadData = new FormData();
      
      // Append all photos with their metadata
      formData.photoFiles.forEach((file, index) => {
        uploadData.append('photos', file);
        uploadData.append(`caption_${index}`, formData.photoCaptions[index] || '');
        uploadData.append(`location_${index}`, formData.photoLocations[index] || '');
      });
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/pre-assessments/${selectedAssessment._id}/upload-site-photos`,
        uploadData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      if (response.data.success) {
        alert(`✅ ${formData.photoFiles.length} site photo(s) uploaded successfully!`);
        setShowPhotoModal(false);
        fetchSitePhotos(selectedAssessment._id);
        resetForm();
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error uploading site photos:', error);
      alert(error.response?.data?.message || 'Failed to upload site photos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/pre-assessments/${selectedAssessment._id}/photos/${photoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Photo deleted successfully');
      fetchSitePhotos(selectedAssessment._id);
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  const handleAddComment = async () => {
    if (!formData.comment) {
      alert('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/pre-assessments/${selectedAssessment._id}/add-comment`,
        {
          comment: formData.comment,
          isPublic: formData.isPublic
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('✅ Comment added successfully!');
        setShowCommentModal(false);
        fetchMyAssessments();
        resetForm();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoSelection = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      photoFiles: files,
      photoCaptions: files.map(() => ''),
      photoLocations: files.map(() => '')
    });
  };

  const updatePhotoCaption = (index, caption) => {
    const newCaptions = [...formData.photoCaptions];
    newCaptions[index] = caption;
    setFormData({ ...formData, photoCaptions: newCaptions });
  };

  const updatePhotoLocation = (index, location) => {
    const newLocations = [...formData.photoLocations];
    newLocations[index] = location;
    setFormData({ ...formData, photoLocations: newLocations });
  };

  const resetForm = () => {
    setFormData({
      deploymentNotes: '',
      installationLocation: '',
      gpsCoordinates: '',
      deviceSerialAtDeployment: '',
      siteVisitNotes: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      roofCondition: 'good',
      structuralIntegrity: 'good',
      shadingAnalysis: '',
      recommendedPanelPlacement: '',
      totalIrradiance: '',
      averageTemperature: '',
      shadingPercentage: '',
      recommendedPanelCount: '',
      estimatedSystemSize: '',
      comment: '',
      isPublic: true,
      photoFiles: [],
      photoCaptions: [],
      photoLocations: []
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'device_assigned': <span className="status-badge pending">📋 Ready for Deployment</span>,
      'site_visit_ongoing': <span className="status-badge ongoing">🔧 Site Visit Ongoing</span>,
      'report_draft': <span className="status-badge draft">📝 Report Draft</span>,
      'completed': <span className="status-badge completed">✅ Completed</span>,
      'cancelled': <span className="status-badge cancelled">❌ Cancelled</span>
    };
    return badges[status] || <span className="status-badge">{status}</span>;
  };

  const getActionButtons = (assessment) => {
    switch (assessment.assessmentStatus) {
      case 'device_assigned':
        return (
          <button 
            className="action-btn deploy-btn"
            onClick={() => {
              setSelectedAssessment(assessment);
              setShowDeployModal(true);
            }}
          >
            <FaMicrochip /> Deploy Device
          </button>
        );
      case 'site_visit_ongoing':
        return (
          <div className="action-buttons-group">
            <button 
              className="action-btn update-btn"
              onClick={() => {
                setSelectedAssessment(assessment);
                setActiveTab('assessment');
              }}
            >
              <FaClipboardList /> Update Assessment
            </button>
            <button 
              className="action-btn retrieve-btn"
              onClick={() => {
                setSelectedAssessment(assessment);
                setShowRetrieveModal(true);
              }}
            >
              <FaTools /> Retrieve Device
            </button>
            <button 
              className="action-btn report-btn"
              onClick={() => {
                setSelectedAssessment(assessment);
                setShowReportModal(true);
              }}
            >
              <FaFileAlt /> Submit Report
            </button>
          </div>
        );
      case 'report_draft':
        return (
          <button 
            className="action-btn submit-btn"
            onClick={() => {
              setSelectedAssessment(assessment);
              setShowReportModal(true);
            }}
          >
            <FaPaperPlane /> Submit Final Report
          </button>
        );
      default:
        return null;
    }
  };

  const SkeletonLoader = () => (
    <div className="my-assessments-container">
      <div className="skeleton-header"></div>
      <div className="skeleton-stats">
        {[1,2,3,4].map(i => <div key={i} className="skeleton-stat-card"></div>)}
      </div>
      <div className="skeleton-list">
        {[1,2,3].map(i => <div key={i} className="skeleton-assessment-card"></div>)}
      </div>
    </div>
  );

  if (loading) return <SkeletonLoader />;

  return (
    <>
      <Helmet>
        <title>My Assessments | Engineer | Salfer Engineering</title>
      </Helmet>

      <div className="my-assessments-container">
        <div className="page-header">
          <div>
            <h1>My Assessments</h1>
            <p>Manage your assigned assessments, conduct site visits, and submit reports</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon"><FaClipboardList /></div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Assessments</p>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon"><FaClock /></div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Ready for Deployment</p>
            </div>
          </div>
          <div className="stat-card ongoing">
            <div className="stat-icon"><FaTools /></div>
            <div className="stat-info">
              <h3>{stats.ongoing}</h3>
              <p>Site Visit Ongoing</p>
            </div>
          </div>
          <div className="stat-card completed">
            <div className="stat-icon"><FaCheckCircle /></div>
            <div className="stat-info">
              <h3>{stats.completed}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* Assessments List */}
        <div className="assessments-list">
          {assessments.length === 0 ? (
            <div className="empty-state">
              <p>No assessments assigned yet</p>
            </div>
          ) : (
            assessments.map(assessment => (
              <div key={assessment._id} className="assessment-card">
                <div className="card-header">
                  <div className="header-left">
                    <h3>{assessment.bookingReference}</h3>
                    {getStatusBadge(assessment.assessmentStatus)}
                  </div>
                  <button 
                    className="view-details-btn"
                    onClick={() => {
                      setSelectedAssessment(assessment);
                      setActiveTab('overview');
                      fetchSitePhotos(assessment._id);
                    }}
                  >
                    <FaEye /> View Details
                  </button>
                </div>
                
                <div className="card-details">
                  <div className="detail-item">
                    <FaUser />
                    <span>{assessment.clientId?.contactFirstName} {assessment.clientId?.contactLastName}</span>
                  </div>
                  <div className="detail-item">
                    <FaMapMarkerAlt />
                    <span>{assessment.addressId?.street}, {assessment.addressId?.city}</span>
                  </div>
                  <div className="detail-item">
                    <FaCalendarAlt />
                    <span>Preferred: {new Date(assessment.preferredDate).toLocaleDateString()}</span>
                  </div>
                  {assessment.assignedDeviceId && (
                    <div className="detail-item">
                      <FaMicrochip />
                      <span>Device: {assessment.assignedDeviceId.deviceId} - {assessment.assignedDeviceId.deviceName}</span>
                    </div>
                  )}
                </div>
                
                <div className="card-actions">
                  {getActionButtons(assessment)}
                  <button 
                    className="action-btn photo-btn"
                    onClick={() => {
                      setSelectedAssessment(assessment);
                      setShowPhotoModal(true);
                    }}
                  >
                    <FaCamera /> Upload Site Photos
                  </button>
                  <button 
                    className="action-btn comment-btn"
                    onClick={() => {
                      setSelectedAssessment(assessment);
                      setShowCommentModal(true);
                    }}
                  >
                    <FaComment /> Add Comment
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Assessment Details Modal */}
        {selectedAssessment && activeTab === 'overview' && (
          <div className="modal-overlay" onClick={() => setSelectedAssessment(null)}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedAssessment.bookingReference}</h2>
                <button className="close-btn" onClick={() => setSelectedAssessment(null)}>×</button>
              </div>
              
              <div className="modal-tabs">
                <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
                <button className={activeTab === 'assessment' ? 'active' : ''} onClick={() => setActiveTab('assessment')}>Site Assessment</button>
                <button className={activeTab === 'photos' ? 'active' : ''} onClick={() => setActiveTab('photos')}>Site Photos</button>
                <button className={activeTab === 'comments' ? 'active' : ''} onClick={() => setActiveTab('comments')}>Comments</button>
                <button className={activeTab === 'iot-data' ? 'active' : ''} onClick={() => setActiveTab('iot-data')}>IoT Data</button>
              </div>
              
              <div className="modal-body">
                {activeTab === 'overview' && (
                  <div className="overview-tab">
                    <div className="info-section">
                      <h3>Client Information</h3>
                      <p><strong>Name:</strong> {selectedAssessment.clientId?.contactFirstName} {selectedAssessment.clientId?.contactLastName}</p>
                      <p><strong>Email:</strong> {selectedAssessment.clientId?.email}</p>
                      <p><strong>Phone:</strong> {selectedAssessment.clientId?.contactPhone}</p>
                    </div>
                    
                    <div className="info-section">
                      <h3>Address</h3>
                      <p>{selectedAssessment.addressId?.street}</p>
                      <p>{selectedAssessment.addressId?.barangay}, {selectedAssessment.addressId?.city}</p>
                      <p>{selectedAssessment.addressId?.province}, {selectedAssessment.addressId?.zipCode}</p>
                    </div>
                    
                    <div className="info-section">
                      <h3>Assessment Details</h3>
                      <p><strong>Property Type:</strong> {selectedAssessment.propertyType}</p>
                      <p><strong>Desired Capacity:</strong> {selectedAssessment.desiredCapacity}</p>
                      <p><strong>Roof Type:</strong> {selectedAssessment.roofType}</p>
                      <p><strong>Preferred Date:</strong> {new Date(selectedAssessment.preferredDate).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="info-section">
                      <h3>Device Information</h3>
                      {selectedAssessment.assignedDeviceId ? (
                        <>
                          <p><strong>Device ID:</strong> {selectedAssessment.assignedDeviceId.deviceId}</p>
                          <p><strong>Device Name:</strong> {selectedAssessment.assignedDeviceId.deviceName}</p>
                          <p><strong>Model:</strong> {selectedAssessment.assignedDeviceId.model}</p>
                          <p><strong>Status:</strong> {selectedAssessment.assignedDeviceId.status}</p>
                          {selectedAssessment.deviceDeployedAt && (
                            <p><strong>Deployed At:</strong> {new Date(selectedAssessment.deviceDeployedAt).toLocaleString()}</p>
                          )}
                        </>
                      ) : (
                        <p>No device assigned yet</p>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'assessment' && (
                  <div className="assessment-tab">
                    <form onSubmit={(e) => { e.preventDefault(); handleUpdateSiteAssessment(); }}>
                      <div className="form-group">
                        <label>Inspection Date</label>
                        <input 
                          type="date" 
                          value={formData.inspectionDate}
                          onChange={(e) => setFormData({...formData, inspectionDate: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Roof Condition</label>
                          <select 
                            value={formData.roofCondition}
                            onChange={(e) => setFormData({...formData, roofCondition: e.target.value})}
                          >
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label>Structural Integrity</label>
                          <select 
                            value={formData.structuralIntegrity}
                            onChange={(e) => setFormData({...formData, structuralIntegrity: e.target.value})}
                          >
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Site Visit Notes</label>
                        <textarea 
                          rows="4"
                          value={formData.siteVisitNotes}
                          onChange={(e) => setFormData({...formData, siteVisitNotes: e.target.value})}
                          placeholder="Enter detailed site visit observations..."
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Shading Analysis</label>
                        <textarea 
                          rows="3"
                          value={formData.shadingAnalysis}
                          onChange={(e) => setFormData({...formData, shadingAnalysis: e.target.value})}
                          placeholder="Describe shading conditions and impact..."
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Recommended Panel Placement</label>
                        <textarea 
                          rows="3"
                          value={formData.recommendedPanelPlacement}
                          onChange={(e) => setFormData({...formData, recommendedPanelPlacement: e.target.value})}
                          placeholder="Where should panels be installed?"
                        />
                      </div>
                      
                      <div className="form-section-title">Assessment Results</div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Total Irradiance (kWh/m²/day)</label>
                          <input 
                            type="number"
                            step="0.1"
                            value={formData.totalIrradiance}
                            onChange={(e) => setFormData({...formData, totalIrradiance: e.target.value})}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Average Temperature (°C)</label>
                          <input 
                            type="number"
                            step="0.1"
                            value={formData.averageTemperature}
                            onChange={(e) => setFormData({...formData, averageTemperature: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Shading Percentage (%)</label>
                          <input 
                            type="number"
                            step="1"
                            value={formData.shadingPercentage}
                            onChange={(e) => setFormData({...formData, shadingPercentage: e.target.value})}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Recommended Panel Count</label>
                          <input 
                            type="number"
                            value={formData.recommendedPanelCount}
                            onChange={(e) => setFormData({...formData, recommendedPanelCount: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Estimated System Size (kWp)</label>
                        <input 
                          type="number"
                          step="0.5"
                          value={formData.estimatedSystemSize}
                          onChange={(e) => setFormData({...formData, estimatedSystemSize: e.target.value})}
                        />
                      </div>
                      
                      <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={() => setSelectedAssessment(null)}>Cancel</button>
                        <button type="submit" className="save-btn" disabled={isSubmitting}>
                          {isSubmitting ? 'Saving...' : 'Save Assessment'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {activeTab === 'photos' && (
                  <div className="photos-tab">
                    <div className="photos-header">
                      <h3>Site Photos</h3>
                      <button 
                        className="upload-photos-btn"
                        onClick={() => setShowPhotoModal(true)}
                      >
                        <FaCamera /> Upload New Photos
                      </button>
                    </div>
                    
                    {sitePhotos.length === 0 ? (
                      <div className="empty-photos">
                        <FaImages />
                        <p>No site photos uploaded yet</p>
                        <button onClick={() => setShowPhotoModal(true)}>Upload Site Photos</button>
                      </div>
                    ) : (
                      <div className="photos-grid">
                        {sitePhotos.map(photo => (
                          <div key={photo._id} className="photo-card">
                            <img 
                              src={photo.url} 
                              alt={photo.caption || 'Site photo'}
                              onClick={() => {
                                setSelectedImage(photo.url);
                                setShowFullImageModal(true);
                              }}
                            />
                            <div className="photo-info">
                              <p className="photo-caption">{photo.caption || 'No caption'}</p>
                              {photo.location && (
                                <p className="photo-location">
                                  <FaMapMarkerAlt /> {photo.location}
                                </p>
                              )}
                              <p className="photo-date">
                                {new Date(photo.uploadedAt).toLocaleDateString()}
                              </p>
                              <button 
                                className="delete-photo-btn"
                                onClick={() => handleDeletePhoto(photo._id)}
                              >
                                <FaTrash /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'comments' && (
                  <div className="comments-tab">
                    <div className="comments-header">
                      <h3>Assessment Comments</h3>
                      <button 
                        className="add-comment-btn"
                        onClick={() => setShowCommentModal(true)}
                      >
                        <FaPlus /> Add Comment
                      </button>
                    </div>
                    
                    {selectedAssessment.engineerComments?.length === 0 ? (
                      <div className="empty-comments">
                        <FaComment />
                        <p>No comments yet</p>
                      </div>
                    ) : (
                      <div className="comments-list">
                        {selectedAssessment.engineerComments?.map((comment, index) => (
                          <div key={index} className="comment-item">
                            <div className="comment-header">
                              <strong>{comment.commentedBy?.name || 'Engineer'}</strong>
                              <span>{new Date(comment.commentedAt).toLocaleString()}</span>
                              {comment.isPublic && (
                                <span className="public-badge">Public</span>
                              )}
                            </div>
                            <p>{comment.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'iot-data' && (
                  <div className="iot-data-tab">
                    <h3>IoT Device Data</h3>
                    {selectedAssessment.iotDeviceId ? (
                      <div className="iot-data-grid">
                        <div className="data-card">
                          <h4>Device Status</h4>
                          <p><strong>Device ID:</strong> {selectedAssessment.iotDeviceId.deviceId}</p>
                          <p><strong>Status:</strong> {selectedAssessment.iotDeviceId.status}</p>
                          <p><strong>Battery:</strong> {selectedAssessment.iotDeviceId.batteryLevel}%</p>
                          <p><strong>Last Heartbeat:</strong> {new Date(selectedAssessment.iotDeviceId.lastHeartbeat).toLocaleString()}</p>
                        </div>
                        
                        <div className="data-card">
                          <h4>Data Collection</h4>
                          <p><strong>Started:</strong> {new Date(selectedAssessment.dataCollectionStart).toLocaleString()}</p>
                          {selectedAssessment.dataCollectionEnd && (
                            <p><strong>Ended:</strong> {new Date(selectedAssessment.dataCollectionEnd).toLocaleString()}</p>
                          )}
                          <p><strong>Total Readings:</strong> {selectedAssessment.totalReadings || 0}</p>
                        </div>
                        
                        <div className="data-card">
                          <h4>Recent Readings</h4>
                          {/* Add chart or data visualization here */}
                          <p>Loading data readings...</p>
                        </div>
                      </div>
                    ) : (
                      <p>No IoT device deployed yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Deploy Device Modal */}
        {showDeployModal && (
          <div className="modal-overlay" onClick={() => setShowDeployModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Deploy Device on Site</h3>
              <p><strong>Device:</strong> {selectedAssessment?.assignedDeviceId?.deviceId}</p>
              <p><strong>Assessment:</strong> {selectedAssessment?.bookingReference}</p>
              
              <div className="form-group">
                <label>Installation Location</label>
                <input 
                  type="text"
                  value={formData.installationLocation}
                  onChange={(e) => setFormData({...formData, installationLocation: e.target.value})}
                  placeholder="e.g., Roof, South-facing"
                />
              </div>
              
              <div className="form-group">
                <label>GPS Coordinates (optional)</label>
                <input 
                  type="text"
                  value={formData.gpsCoordinates}
                  onChange={(e) => setFormData({...formData, gpsCoordinates: e.target.value})}
                  placeholder="e.g., 14.5995° N, 120.9842° E"
                />
              </div>
              
              <div className="form-group">
                <label>Device Serial at Deployment</label>
                <input 
                  type="text"
                  value={formData.deviceSerialAtDeployment}
                  onChange={(e) => setFormData({...formData, deviceSerialAtDeployment: e.target.value})}
                  placeholder="Verify and enter device serial number"
                />
              </div>
              
              <div className="form-group">
                <label>Deployment Notes *</label>
                <textarea 
                  rows="4"
                  value={formData.deploymentNotes}
                  onChange={(e) => setFormData({...formData, deploymentNotes: e.target.value})}
                  placeholder="Describe the deployment process, any issues encountered, etc."
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowDeployModal(false)}>Cancel</button>
                <button className="deploy-btn" onClick={handleDeployDevice} disabled={isSubmitting}>
                  {isSubmitting ? 'Deploying...' : 'Confirm Deployment'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Retrieve Device Modal */}
        {showRetrieveModal && (
          <div className="modal-overlay" onClick={() => setShowRetrieveModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Retrieve Device</h3>
              <p><strong>Device:</strong> {selectedAssessment?.iotDeviceId?.deviceId}</p>
              <p><strong>Deployed Since:</strong> {new Date(selectedAssessment?.deviceDeployedAt).toLocaleDateString()}</p>
              
              <div className="form-group">
                <label>Retrieval Notes</label>
                <textarea 
                  rows="4"
                  value={formData.retrievalNotes}
                  onChange={(e) => setFormData({...formData, retrievalNotes: e.target.value})}
                  placeholder="Describe the retrieval process, device condition, any data collected, etc."
                />
              </div>
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowRetrieveModal(false)}>Cancel</button>
                <button className="retrieve-btn" onClick={handleRetrieveDevice} disabled={isSubmitting}>
                  {isSubmitting ? 'Retrieving...' : 'Confirm Retrieval'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Submit Report Modal */}
        {showReportModal && (
          <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
              <h3>Submit Assessment Report</h3>
              
              <div className="form-group">
                <label>Technical Findings</label>
                <textarea 
                  rows="4"
                  value={formData.technicalFindings}
                  onChange={(e) => setFormData({...formData, technicalFindings: e.target.value})}
                  placeholder="Describe technical findings from the site assessment and data collection..."
                />
              </div>
              
              <div className="form-group">
                <label>Recommendations</label>
                <textarea 
                  rows="4"
                  value={formData.recommendations}
                  onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                  placeholder="Provide recommendations for solar panel installation..."
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Final System Size (kWp)</label>
                  <input 
                    type="number"
                    step="0.5"
                    value={formData.finalSystemSize}
                    onChange={(e) => setFormData({...formData, finalSystemSize: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Estimated System Cost (₱)</label>
                  <input 
                    type="number"
                    value={formData.finalSystemCost}
                    onChange={(e) => setFormData({...formData, finalSystemCost: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button className="submit-btn" onClick={handleSubmitReport} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Upload Site Photos Modal */}
        {showPhotoModal && (
          <div className="modal-overlay" onClick={() => setShowPhotoModal(false)}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
              <h3>Upload Site Photos</h3>
              <p>Capture and upload photos of the site visit, equipment, installation location, etc.</p>
              
              <div className="form-group">
                <label>Select Photos (Multiple allowed)</label>
                <input 
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoSelection}
                  className="file-input"
                />
                <small>Supported formats: JPG, PNG, JPEG. Max size: 5MB per photo</small>
              </div>
              
              {formData.photoFiles.length > 0 && (
                <div className="photos-preview">
                  <h4>Selected Photos ({formData.photoFiles.length})</h4>
                  {formData.photoFiles.map((file, index) => (
                    <div key={index} className="photo-preview-item">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index + 1}`}
                        className="preview-thumbnail"
                      />
                      <div className="photo-details">
                        <input 
                          type="text"
                          placeholder="Caption (e.g., Roof condition, Panel location)"
                          value={formData.photoCaptions[index]}
                          onChange={(e) => updatePhotoCaption(index, e.target.value)}
                          className="caption-input"
                        />
                        <input 
                          type="text"
                          placeholder="Location (e.g., Main roof, South side)"
                          value={formData.photoLocations[index]}
                          onChange={(e) => updatePhotoLocation(index, e.target.value)}
                          className="location-input"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="upload-progress">
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                  <span>{uploadProgress}% uploaded</span>
                </div>
              )}
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowPhotoModal(false)}>Cancel</button>
                <button 
                  className="upload-btn" 
                  onClick={handleUploadSitePhotos} 
                  disabled={isSubmitting || formData.photoFiles.length === 0}
                >
                  {isSubmitting ? 'Uploading...' : `Upload ${formData.photoFiles.length} Photo(s)`}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Add Comment Modal */}
        {showCommentModal && (
          <div className="modal-overlay" onClick={() => setShowCommentModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Add Comment</h3>
              
              <div className="form-group">
                <label>Comment</label>
                <textarea 
                  rows="4"
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  placeholder="Add your comment or note about this assessment..."
                  required
                />
              </div>
              
              <div className="form-group checkbox">
                <label>
                  <input 
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                  />
                  Make this comment visible to client
                </label>
              </div>
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowCommentModal(false)}>Cancel</button>
                <button className="comment-btn" onClick={handleAddComment} disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Full Image Modal */}
        {showFullImageModal && selectedImage && (
          <div className="modal-overlay" onClick={() => setShowFullImageModal(false)}>
            <div className="full-image-modal" onClick={e => e.stopPropagation()}>
              <img src={selectedImage} alt="Full size" />
              <button className="close-btn" onClick={() => setShowFullImageModal(false)}>×</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyAssessments;