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
  FaPlus,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaArrowLeft,
  FaSave,
  FaFilePdf,
  FaSpinner,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaQuoteRight,
  FaClipboardCheck,
  FaDollarSign,
  FaBoxes,
  FaTools,
  FaWifi,
  FaServer
} from 'react-icons/fa';
import '../../styles/Engineer/siteassessment.css';

const MyAssessments = () => {
  const [freeQuotes, setFreeQuotes] = useState([]);
  const [preAssessments, setPreAssessments] = useState([]);
  const [allAssessments, setAllAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [deployNotes, setDeployNotes] = useState('');

  // Free Quote Form State
  const [freeQuoteForm, setFreeQuoteForm] = useState({
    quotationNumber: '',
    quotationExpiryDate: '',
    systemSize: '',
    systemType: 'grid-tie',
    panelsNeeded: '',
    inverterType: '',
    batteryType: '',
    installationCost: 0,
    equipmentCost: 0,
    totalCost: 0,
    paymentTerms: '',
    warrantyYears: 10,
    remarks: ''
  });

  // Pre-Assessment Form State
  const [assessmentForm, setAssessmentForm] = useState({
    roofCondition: '',
    roofLength: '',
    roofWidth: '',
    structuralIntegrity: '',
    estimatedInstallationTime: '',
    recommendations: '',
    technicalFindings: '',
    siteVisitNotes: ''
  });

  // Quotation Form State
  const [quotationForm, setQuotationForm] = useState({
    quotationNumber: '',
    quotationExpiryDate: '',
    systemSize: '',
    systemType: 'grid-tie',
    panelsNeeded: '',
    inverterType: '',
    batteryType: '',
    installationCost: 0,
    equipmentCost: 0,
    totalCost: 0,
    paymentTerms: '',
    warrantyYears: 10
  });

  const [siteImages, setSiteImages] = useState([]);

  const ASSESSMENT_TYPES = {
    free_quote: { 
      label: 'Free Quote', 
      color: 'free-quote-enad',
      icon: FaQuoteRight,
      statusKey: 'status'
    },
    pre_assessment: { 
      label: 'Pre-Assessment', 
      color: 'pre-assessment-enad',
      icon: FaClipboardCheck,
      statusKey: 'assessmentStatus'
    }
  };

  const FREE_QUOTE_STATUS = {
    pending: { label: 'Pending', color: 'pending-enad', icon: FaClock },
    processing: { label: 'Processing', color: 'processing-enad', icon: FaTools },
    completed: { label: 'Completed', color: 'completed-enad', icon: FaCheckCircle },
    cancelled: { label: 'Cancelled', color: 'cancelled-enad', icon: FaTimes }
  };

  const PRE_ASSESSMENT_STATUS = {
    pending_payment: { label: 'Pending Payment', color: 'pending-enad', icon: FaDollarSign },
    scheduled: { label: 'Scheduled', color: 'scheduled-enad', icon: FaClock },
    site_visit_ongoing: { label: 'Site Visit Ongoing', color: 'site-visit-enad', icon: FaHardHat },
    device_deployed: { label: 'Device Deployed', color: 'device-deployed-enad', icon: FaMicrochip },
    data_collecting: { label: 'Collecting Data', color: 'data-collecting-enad', icon: FaChartLine },
    data_analyzing: { label: 'Analyzing Data', color: 'data-analyzing-enad', icon: FaChartLine },
    report_draft: { label: 'Report Draft', color: 'report-draft-enad', icon: FaFileAlt },
    completed: { label: 'Completed', color: 'completed-enad', icon: FaCheckCircle },
    cancelled: { label: 'Cancelled', color: 'cancelled-enad', icon: FaTimes }
  };

  const ROOF_CONDITIONS = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const STRUCTURAL_INTEGRITY = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const SYSTEM_TYPES = [
    { value: 'grid-tie', label: 'Grid-Tie System' },
    { value: 'hybrid', label: 'Hybrid System' },
    { value: 'off-grid', label: 'Off-Grid System' }
  ];

  const hasDeviceAssigned = (item) => {
    return !!(item.iotDeviceId || item.assignedDevice || item.assignedDeviceId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount || 0);
  };

  const getFullAddress = (address) => {
    if (!address) return 'Address not specified';
    if (typeof address === 'object') {
      const parts = [
        address.houseOrBuilding,
        address.street,
        address.barangay,
        address.cityMunicipality,
        address.province,
        address.zipCode
      ].filter(part => part && part.trim());
      return parts.join(', ') || 'Address not specified';
    }
    return 'Address not specified';
  };

  const getStatusConfig = (item) => {
    if (item.type === 'free_quote') {
      return FREE_QUOTE_STATUS[item.status] || FREE_QUOTE_STATUS.pending;
    } else {
      return PRE_ASSESSMENT_STATUS[item.status] || PRE_ASSESSMENT_STATUS.pending_payment;
    }
  };

  const getTypeConfig = (type) => {
    return ASSESSMENT_TYPES[type] || ASSESSMENT_TYPES.free_quote;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };

  const fetchAllAssessments = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      
      const freeQuotesRes = await axios.get('/api/free-quotes/engineer/my-quotes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const preAssessmentsRes = await axios.get('/api/pre-assessments/engineer/my-assessments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const formattedFreeQuotes = (freeQuotesRes.data.quotes || []).map(quote => ({
        ...quote,
        type: 'free_quote',
        id: quote._id,
        clientId: quote.clientId?._id,
        clientName: quote.clientId?.contactFirstName || '',
        clientLastName: quote.clientId?.contactLastName || '',
        clientEmail: quote.clientId?.userId?.email || '',
        clientPhone: quote.clientId?.contactNumber || '',
        clientType: quote.clientId?.client_type || 'Residential',
        address: quote.addressId,
        bookingReference: quote.quotationReference,
        status: quote.status,
        preferredDate: quote.requestedAt,
        propertyType: quote.propertyType,
        desiredCapacity: quote.desiredCapacity,
        monthlyBill: quote.monthlyBill
      }));
      
      const formattedPreAssessments = (preAssessmentsRes.data.assessments || []).map(assessment => ({
        ...assessment,
        type: 'pre_assessment',
        id: assessment._id,
        clientId: assessment.clientId?._id,
        clientName: assessment.clientId?.contactFirstName || '',
        clientLastName: assessment.clientId?.contactLastName || '',
        clientEmail: assessment.clientId?.userId?.email || '',
        clientPhone: assessment.clientId?.contactNumber || '',
        clientType: assessment.clientId?.client_type || 'Residential',
        address: assessment.addressId,
        status: assessment.assessmentStatus,
        preferredDate: assessment.preferredDate,
        propertyType: assessment.propertyType,
        desiredCapacity: assessment.desiredCapacity,
        assignedDevice: assessment.assignedDevice,
        assignedDeviceId: assessment.assignedDeviceId,
        iotDeviceId: assessment.iotDeviceId,
        deviceDeployedAt: assessment.deviceDeployedAt,
        deviceDeployedBy: assessment.deviceDeployedBy
      }));
      
      setFreeQuotes(formattedFreeQuotes);
      setPreAssessments(formattedPreAssessments);
      setAllAssessments([...formattedFreeQuotes, ...formattedPreAssessments]);
      setError(null);
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError('Failed to load assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFreeQuoteDetails = async (quoteId) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`/api/free-quotes/${quoteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const quote = response.data.quote;
      
      const formattedQuote = {
        ...quote,
        clientName: quote.clientId?.contactFirstName || '',
        clientLastName: quote.clientId?.contactLastName || '',
        clientEmail: quote.clientId?.userId?.email || '',
        clientPhone: quote.clientId?.contactNumber || '',
        clientType: quote.clientId?.client_type || 'Residential'
      };
      
      setSelectedItem(formattedQuote);
      setSelectedType('free_quote');
      
      setFreeQuoteForm({
        quotationNumber: formattedQuote.quotationReference || '',
        quotationExpiryDate: '',
        systemSize: '',
        systemType: 'grid-tie',
        panelsNeeded: '',
        inverterType: '',
        batteryType: '',
        installationCost: 0,
        equipmentCost: 0,
        totalCost: 0,
        paymentTerms: '',
        warrantyYears: 10,
        remarks: formattedQuote.adminRemarks || ''
      });
    } catch (err) {
      console.error('Error fetching free quote details:', err);
      showNotification('Failed to load quote details', 'error');
    }
  };

  const fetchPreAssessmentDetails = async (assessmentId) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`/api/pre-assessments/${assessmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const assessment = response.data.assessment;
      
      const formattedAssessment = {
        ...assessment,
        clientName: assessment.clientId?.contactFirstName || '',
        clientLastName: assessment.clientId?.contactLastName || '',
        clientEmail: assessment.clientId?.userId?.email || '',
        clientPhone: assessment.clientId?.contactNumber || '',
        clientType: assessment.clientId?.client_type || 'Residential',
        assignedDevice: assessment.assignedDevice,
        assignedDeviceId: assessment.assignedDeviceId,
        iotDeviceId: assessment.iotDeviceId,
        deviceDeployedAt: assessment.deviceDeployedAt,
        deviceDeployedBy: assessment.deviceDeployedBy
      };
      
      setSelectedItem(formattedAssessment);
      setSelectedType('pre_assessment');
      
      if (assessment.engineerAssessment) {
        setAssessmentForm({
          roofCondition: assessment.engineerAssessment.roofCondition || '',
          roofLength: assessment.engineerAssessment.roofLength || '',
          roofWidth: assessment.engineerAssessment.roofWidth || '',
          structuralIntegrity: assessment.engineerAssessment.structuralIntegrity || '',
          estimatedInstallationTime: assessment.engineerAssessment.estimatedInstallationTime || '',
          recommendations: assessment.engineerAssessment.recommendations || '',
          technicalFindings: assessment.technicalFindings || '',
          siteVisitNotes: assessment.engineerAssessment.inspectionNotes || ''
        });
      }
      
      if (assessment.quotation?.systemDetails) {
        setQuotationForm({
          quotationNumber: assessment.quotation.quotationNumber || '',
          quotationExpiryDate: assessment.quotation.quotationExpiryDate?.split('T')[0] || '',
          systemSize: assessment.quotation.systemDetails.systemSize || '',
          systemType: assessment.quotation.systemDetails.systemType || 'grid-tie',
          panelsNeeded: assessment.quotation.systemDetails.panelsNeeded || '',
          inverterType: assessment.quotation.systemDetails.inverterType || '',
          batteryType: assessment.quotation.systemDetails.batteryType || '',
          installationCost: assessment.quotation.systemDetails.installationCost || 0,
          equipmentCost: assessment.quotation.systemDetails.equipmentCost || 0,
          totalCost: assessment.quotation.systemDetails.totalCost || 0,
          paymentTerms: assessment.quotation.systemDetails.paymentTerms || '',
          warrantyYears: assessment.quotation.systemDetails.warrantyYears || 10
        });
      }
      
      if (assessment.sitePhotos) {
        setSiteImages(assessment.sitePhotos);
      }
    } catch (err) {
      console.error('Error fetching pre-assessment details:', err);
      showNotification('Failed to load assessment details', 'error');
    }
  };

  const handleSelectItem = (item) => {
    if (item.type === 'free_quote') {
      fetchFreeQuoteDetails(item.id);
    } else {
      fetchPreAssessmentDetails(item.id);
    }
    setActiveTab('overview');
  };

  const handleBackToList = () => {
    setSelectedItem(null);
    setSelectedType(null);
    fetchAllAssessments();
  };

  const handleFreeQuoteFormChange = (field, value) => {
    setFreeQuoteForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAssessmentFormChange = (field, value) => {
    setAssessmentForm(prev => ({ ...prev, [field]: value }));
  };

  const handleQuotationChange = (field, value) => {
    setQuotationForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(
        `/api/pre-assessments/${selectedItem._id}/upload-images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSiteImages([...siteImages, ...response.data.images]);
      showNotification('Images uploaded successfully');
    } catch (err) {
      console.error('Error uploading images:', err);
      showNotification('Failed to upload images', 'error');
    } finally {
      setUploading(false);
      setShowImageUploader(false);
    }
  };

  const uploadFreeQuoteQuotation = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('quotation', file);
    
    Object.entries(freeQuoteForm).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(
        `/api/free-quotes/${selectedItem._id}/upload-quotation`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      showNotification('Quotation uploaded successfully');
      await axios.put(
        `/api/free-quotes/${selectedItem._id}/status`,
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFreeQuoteDetails(selectedItem._id);
    } catch (err) {
      console.error('Error uploading quotation:', err);
      showNotification('Failed to upload quotation', 'error');
    } finally {
      setUploading(false);
    }
  };

  const uploadPreAssessmentQuotation = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('quotation', file);
    
    Object.entries(quotationForm).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(
        `/api/pre-assessments/${selectedItem._id}/upload-quotation`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      showNotification('Quotation uploaded successfully');
      fetchPreAssessmentDetails(selectedItem._id);
    } catch (err) {
      console.error('Error uploading quotation:', err);
      showNotification('Failed to upload quotation', 'error');
    } finally {
      setUploading(false);
    }
  };

  const deployDevice = async () => {
    if (!window.confirm('Are you sure you want to deploy the device on site? This will start data collection.')) {
      return;
    }
    
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(
        `/api/pre-assessments/${selectedItem._id}/deploy-device`,
        { notes: deployNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification(response.data.message || 'Device deployed successfully');
      setDeployNotes('');
      fetchPreAssessmentDetails(selectedItem._id);
    } catch (err) {
      console.error('Error deploying device:', err);
      showNotification(err.response?.data?.message || 'Failed to deploy device', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const saveSiteAssessment = async () => {
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(
        `/api/pre-assessments/${selectedItem._id}/update-assessment`,
        assessmentForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification('Site assessment saved successfully');
      fetchPreAssessmentDetails(selectedItem._id);
    } catch (err) {
      console.error('Error saving assessment:', err);
      showNotification('Failed to save assessment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const submitFinalReport = async () => {
    if (!window.confirm('Are you sure you want to submit the final report? This action cannot be undone.')) {
      return;
    }
    
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(
        `/api/pre-assessments/${selectedItem._id}/submit-report`,
        {
          finalSystemSize: quotationForm.systemSize,
          finalSystemCost: quotationForm.totalCost,
          recommendedSystemType: quotationForm.systemType,
          panelsNeeded: quotationForm.panelsNeeded,
          estimatedAnnualProduction: (quotationForm.systemSize || 0) * 1200,
          estimatedAnnualSavings: (quotationForm.totalCost || 0) * 0.15,
          paybackPeriod: Math.ceil((quotationForm.totalCost || 0) / ((quotationForm.systemSize || 1) * 1200 * 0.1)),
          co2Offset: (quotationForm.systemSize || 0) * 800,
          engineerRecommendations: assessmentForm.recommendations,
          technicalFindings: assessmentForm.technicalFindings
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification('Final report submitted successfully');
      fetchPreAssessmentDetails(selectedItem._id);
    } catch (err) {
      console.error('Error submitting report:', err);
      showNotification('Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(
        `/api/pre-assessments/${selectedItem._id}/add-comment`,
        { comment: commentText, isPublic: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText('');
      showNotification('Comment added successfully');
      fetchPreAssessmentDetails(selectedItem._id);
    } catch (err) {
      console.error('Error adding comment:', err);
      showNotification('Failed to add comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchAllAssessments();
  }, []);

  useEffect(() => {
    let filtered = [...allAssessments];
    
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const name = `${item.clientName || ''} ${item.clientLastName || ''}`.toLowerCase();
        const ref = (item.bookingReference || item.quotationReference || '').toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || ref.includes(searchTerm.toLowerCase());
      });
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        const status = item.type === 'free_quote' ? item.status : item.assessmentStatus;
        return status === statusFilter;
      });
    }
    
    setFilteredAssessments(filtered);
  }, [allAssessments, searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    const total = (quotationForm.installationCost || 0) + (quotationForm.equipmentCost || 0);
    setQuotationForm(prev => ({ ...prev, totalCost: total }));
  }, [quotationForm.installationCost, quotationForm.equipmentCost]);

  useEffect(() => {
    const total = (freeQuoteForm.installationCost || 0) + (freeQuoteForm.equipmentCost || 0);
    setFreeQuoteForm(prev => ({ ...prev, totalCost: total }));
  }, [freeQuoteForm.installationCost, freeQuoteForm.equipmentCost]);

  // Skeleton Loader Components
  const SkeletonCard = () => (
    <div className="assessment-card-enad skeleton-card-enad">
      <div className="card-content-enad">
        <div className="card-header-enad">
          <div className="skeleton-badge-enad"></div>
          <div className="skeleton-badge-enad"></div>
        </div>
        <div className="skeleton-line-enad medium-enad"></div>
        <div className="skeleton-line-enad small-enad"></div>
        <div className="card-details-enad">
          <div className="skeleton-line-enad tiny-enad"></div>
          <div className="skeleton-line-enad tiny-enad"></div>
          <div className="skeleton-line-enad tiny-enad"></div>
        </div>
        <div className="card-footer-enad">
          <div className="skeleton-button-enad small-enad"></div>
        </div>
      </div>
    </div>
  );

  const SkeletonList = () => (
    <div className="my-assessments-enad">
      <div className="assessments-header-enad">
        <div className="skeleton-line-enad large-enad"></div>
        <div className="skeleton-line-enad medium-enad"></div>
      </div>
      <div className="search-filters-enad">
        <div className="skeleton-search-enad"></div>
        <div className="skeleton-select-enad"></div>
        <div className="skeleton-select-enad"></div>
      </div>
      <div className="assessments-grid-enad">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );

  const SkeletonDetail = () => (
    <div className="my-assessments-enad">
      <div className="detail-view-enad">
        <div className="detail-content-enad">
          <div className="skeleton-button-enad back-enad"></div>
          <div className="detail-header-enad">
            <div>
              <div className="skeleton-line-enad medium-enad"></div>
              <div className="skeleton-line-enad small-enad"></div>
            </div>
            <div className="skeleton-badge-enad"></div>
          </div>
          <div className="tabs-enad">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton-tab-enad"></div>
            ))}
          </div>
          <div className="info-grid-enad">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-info-item-enad"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && allAssessments.length === 0) {
    return <SkeletonList />;
  }

  // Assessment List View
  if (!selectedItem) {
    const availableStatuses = [...new Set(allAssessments.map(item => {
      return item.type === 'free_quote' ? item.status : item.assessmentStatus;
    }))];
    
    return (
      <>
        <Helmet>
          <title>My Assessments | Engineer | SOLARIS</title>
        </Helmet>

        <div className="my-assessments-enad">
          <div className="assessments-header-enad">
            <h1>My Assessments</h1>
            <p>Manage free quotes and site assessments assigned to you</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="search-filters-enad">
            <div className="search-wrapper-enad">
              <FaSearch className="search-icon-enad" />
              <input
                type="text"
                placeholder="Search by reference or client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-enad"
              />
            </div>
            <div className="filter-wrapper-enad">
              <FaFilter className="filter-icon-enad" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select-enad"
              >
                <option value="all">All Types</option>
                <option value="free_quote">Free Quotes</option>
                <option value="pre_assessment">Pre-Assessments</option>
              </select>
            </div>
            <div className="filter-wrapper-enad">
              <FaFilter className="filter-icon-enad" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select-enad"
              >
                <option value="all">All Status</option>
                {availableStatuses.map(status => (
                  <option key={status} value={status}>
                    {status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="error-container-enad">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}

          {filteredAssessments.length === 0 ? (
            <div className="empty-state-enad">
              <FaClipboardList className="empty-icon-enad" />
              <h3>No assessments found</h3>
              <p>
                {allAssessments.length === 0 
                  ? "You don't have any assessments assigned yet."
                  : "No assessments match your search criteria."}
              </p>
            </div>
          ) : (
            <div className="assessments-grid-enad">
              {filteredAssessments.map((item) => {
                const StatusConfig = getStatusConfig(item);
                const TypeConfig = getTypeConfig(item.type);
                const StatusIcon = StatusConfig.icon;
                const TypeIcon = TypeConfig.icon;
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="assessment-card-enad"
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="card-content-enad">
                      <div className="card-header-enad">
                        <div className={`type-badge-enad ${TypeConfig.color}`}>
                          <TypeIcon />
                          {TypeConfig.label}
                        </div>
                        <div className={`status-badge-enad ${StatusConfig.color}`}>
                          <StatusIcon />
                          {StatusConfig.label}
                        </div>
                      </div>
                      
                      <h3 className="client-name-enad">
                        {item.clientName} {item.clientLastName}
                      </h3>
                      <p className="reference-enad">
                        Ref: {item.bookingReference || item.quotationReference}
                      </p>
                      
                      <div className="card-details-enad">
                        <div className="detail-item-enad">
                          <FaMapMarkerAlt className="detail-icon-enad" />
                          <span className="truncate">{getFullAddress(item.address)}</span>
                        </div>
                        <div className="detail-item-enad">
                          <FaCalendarAlt className="detail-icon-enad" />
                          <span>Requested: {formatDate(item.preferredDate || item.requestedAt)}</span>
                        </div>
                        <div className="detail-item-enad">
                          <FaHome className="detail-icon-enad" />
                          <span className="capitalize">{item.propertyType || 'N/A'}</span>
                        </div>
                        {item.type === 'free_quote' && item.monthlyBill && (
                          <div className="detail-item-enad">
                            <FaDollarSign className="detail-icon-enad" />
                            <span>Monthly Bill: {formatCurrency(item.monthlyBill)}</span>
                          </div>
                        )}
                        {item.type === 'pre_assessment' && hasDeviceAssigned(item) && (
                          <div className="detail-item-enad">
                            <FaMicrochip className="detail-icon-enad" />
                            <span className="badge-small-enad">Device Assigned</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="card-footer-enad">
                        <div className="card-badges-enad">
                          {item.type === 'pre_assessment' && item.sitePhotos?.length > 0 && (
                            <span className="badge-small-enad photos-enad">
                              <FaCamera /> {item.sitePhotos.length} Photos
                            </span>
                          )}
                          {item.type === 'free_quote' && item.quotationFile && (
                            <span className="badge-small-enad quotation-enad">
                              <FaFilePdf /> Quotation Ready
                            </span>
                          )}
                        </div>
                        <button className="view-link-enad">
                          View Details <FaArrowLeft className="rotate-180" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`notification-enad ${notification.type === 'success' ? 'success-enad' : 'error-enad'}`}>
            {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            {notification.message}
          </div>
        )}
      </>
    );
  }

  // Detail View for Free Quote
  if (selectedType === 'free_quote') {
    const StatusConfig = getStatusConfig(selectedItem);
    const TypeConfig = getTypeConfig('free_quote');
    const StatusIcon = StatusConfig.icon;
    const TypeIcon = TypeConfig.icon;
    
    return (
      <>
        <Helmet>
          <title>Free Quote Details | Engineer | SOLARIS</title>
        </Helmet>

        <div className="my-assessments-enad">
          <div className="detail-view-enad">
            <div className="detail-content-enad">
              <button onClick={handleBackToList} className="back-button-enad">
                <FaArrowLeft /> Back to Assessments
              </button>
              
              <div className="detail-header-enad">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`type-badge-enad ${TypeConfig.color}`}>
                      <TypeIcon /> {TypeConfig.label}
                    </span>
                    <h1 className="detail-title-enad">{selectedItem.quotationReference}</h1>
                  </div>
                  <div className="client-meta-enad">
                    <div className="client-meta-item-enad">
                      <FaUser /> {selectedItem.clientName} {selectedItem.clientLastName}
                    </div>
                    <div className="client-meta-item-enad">
                      <FaEnvelope /> {selectedItem.clientEmail || 'No email'}
                    </div>
                    <div className="client-meta-item-enad">
                      <FaPhone /> {selectedItem.clientPhone || 'No contact'}
                    </div>
                    <div className="client-meta-item-enad">
                      <FaBuilding /> <span className="capitalize">{selectedItem.clientType || 'Residential'}</span>
                    </div>
                  </div>
                </div>
                <div className={`status-badge-enad ${StatusConfig.color}`}>
                  <StatusIcon /> {StatusConfig.label}
                </div>
              </div>

              <div className="info-grid-enad">
                <div className="info-item-enad">
                  <span className="info-label-enad">Monthly Bill</span>
                  <span className="info-value-enad">{formatCurrency(selectedItem.monthlyBill)}</span>
                </div>
                <div className="info-item-enad">
                  <span className="info-label-enad">Property Type</span>
                  <span className="info-value-enad capitalize">{selectedItem.propertyType}</span>
                </div>
                <div className="info-item-enad">
                  <span className="info-label-enad">Desired Capacity</span>
                  <span className="info-value-enad">{selectedItem.desiredCapacity || 'Not specified'}</span>
                </div>
                <div className="info-item-enad">
                  <span className="info-label-enad">Requested Date</span>
                  <span className="info-value-enad">{formatDate(selectedItem.requestedAt)}</span>
                </div>
                <div className="info-item-enad info-full-width-enad">
                  <span className="info-label-enad">Address</span>
                  <span className="info-value-enad">{getFullAddress(selectedItem.address)}</span>
                </div>
              </div>

              {/* Quotation Form */}
              <div className="detail-section-enad">
                <h3 className="detail-section-title-enad">Generate Quotation</h3>
                
                <div className="form-grid-enad">
                  <div className="form-group-enad">
                    <label className="form-label-enad">Quotation Number</label>
                    <input
                      type="text"
                      value={freeQuoteForm.quotationNumber}
                      onChange={(e) => handleFreeQuoteFormChange('quotationNumber', e.target.value)}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">Expiry Date</label>
                    <input
                      type="date"
                      value={freeQuoteForm.quotationExpiryDate}
                      onChange={(e) => handleFreeQuoteFormChange('quotationExpiryDate', e.target.value)}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">System Type</label>
                    <select
                      value={freeQuoteForm.systemType}
                      onChange={(e) => handleFreeQuoteFormChange('systemType', e.target.value)}
                      className="form-select-enad"
                    >
                      {SYSTEM_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">System Size (kWp)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={freeQuoteForm.systemSize}
                      onChange={(e) => handleFreeQuoteFormChange('systemSize', parseFloat(e.target.value))}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">Panels Needed</label>
                    <input
                      type="number"
                      value={freeQuoteForm.panelsNeeded}
                      onChange={(e) => handleFreeQuoteFormChange('panelsNeeded', parseInt(e.target.value))}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">Inverter Type</label>
                    <input
                      type="text"
                      value={freeQuoteForm.inverterType}
                      onChange={(e) => handleFreeQuoteFormChange('inverterType', e.target.value)}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">Battery Type</label>
                    <input
                      type="text"
                      value={freeQuoteForm.batteryType}
                      onChange={(e) => handleFreeQuoteFormChange('batteryType', e.target.value)}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">Warranty Years</label>
                    <input
                      type="number"
                      value={freeQuoteForm.warrantyYears}
                      onChange={(e) => handleFreeQuoteFormChange('warrantyYears', parseInt(e.target.value))}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">Equipment Cost (₱)</label>
                    <input
                      type="number"
                      value={freeQuoteForm.equipmentCost}
                      onChange={(e) => handleFreeQuoteFormChange('equipmentCost', parseFloat(e.target.value))}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">Installation Cost (₱)</label>
                    <input
                      type="number"
                      value={freeQuoteForm.installationCost}
                      onChange={(e) => handleFreeQuoteFormChange('installationCost', parseFloat(e.target.value))}
                      className="form-input-enad"
                    />
                  </div>
                </div>
                
                <div className="cost-summary-enad">
                  <div className="cost-row-enad">
                    <span className="cost-label-enad">Total Cost:</span>
                    <span className="cost-value-enad total-cost-enad">{formatCurrency(freeQuoteForm.totalCost)}</span>
                  </div>
                </div>
                
                <div className="form-group-enad">
                  <label className="form-label-enad">Payment Terms</label>
                  <textarea
                    value={freeQuoteForm.paymentTerms}
                    onChange={(e) => handleFreeQuoteFormChange('paymentTerms', e.target.value)}
                    rows={2}
                    className="form-textarea-enad"
                  />
                </div>
                
                <div className="form-group-enad">
                  <label className="form-label-enad">Remarks</label>
                  <textarea
                    value={freeQuoteForm.remarks}
                    onChange={(e) => handleFreeQuoteFormChange('remarks', e.target.value)}
                    rows={3}
                    className="form-textarea-enad"
                  />
                </div>
                
                <div className="file-upload-enad">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={uploadFreeQuoteQuotation}
                    className="file-upload-input-enad"
                    id="free-quote-file-input"
                  />
                  <label htmlFor="free-quote-file-input" className="file-upload-label-enad">
                    <FaFilePdf className="upload-icon-enad" />
                    <span className="upload-text-enad">Click to upload quotation PDF</span>
                  </label>
                  {uploading && (
                    <div className="uploading-enad">
                      <FaSpinner className="spinner-enad" /> Uploading...
                    </div>
                  )}
                  {selectedItem.quotationFile && (
                    <div className="uploaded-file-enad">
                      <span>Quotation PDF uploaded</span>
                      <a href={selectedItem.quotationFile} target="_blank" rel="noopener noreferrer">
                        <FaDownload />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {notification.show && (
          <div className={`notification-enad ${notification.type === 'success' ? 'success-enad' : 'error-enad'}`}>
            {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            {notification.message}
          </div>
        )}
      </>
    );
  }

  // Detail View for Pre-Assessment
  const StatusConfig = getStatusConfig(selectedItem);
  const TypeConfig = getTypeConfig('pre_assessment');
  const StatusIcon = StatusConfig.icon;
  const TypeIcon = TypeConfig.icon;
  const deviceAssigned = hasDeviceAssigned(selectedItem);
  
  return (
    <>
      <Helmet>
        <title>Pre-Assessment Details | Engineer | SOLARIS</title>
      </Helmet>

      <div className="my-assessments-enad">
        <div className="detail-view-enad">
          <div className="detail-content-enad">
            <button onClick={handleBackToList} className="back-button-enad">
              <FaArrowLeft /> Back to Assessments
            </button>
            
            <div className="detail-header-enad">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`type-badge-enad ${TypeConfig.color}`}>
                    <TypeIcon /> {TypeConfig.label}
                  </span>
                  <h1 className="detail-title-enad">{selectedItem.bookingReference}</h1>
                </div>
                <div className="client-meta-enad">
                  <div className="client-meta-item-enad">
                    <FaUser /> {selectedItem.clientName} {selectedItem.clientLastName}
                  </div>
                  <div className="client-meta-item-enad">
                    <FaEnvelope /> {selectedItem.clientEmail || 'No email'}
                  </div>
                  <div className="client-meta-item-enad">
                    <FaPhone /> {selectedItem.clientPhone || 'No contact'}
                  </div>
                  <div className="client-meta-item-enad">
                    <FaBuilding /> <span className="capitalize">{selectedItem.clientType || 'Residential'}</span>
                  </div>
                </div>
              </div>
              <div className={`status-badge-enad ${StatusConfig.color}`}>
                <StatusIcon /> {StatusConfig.label}
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs-enad">
              {['overview', 'site-inspection', 'quotation', 'documents', 'comments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`tab-btn-enad ${activeTab === tab ? 'active-enad' : ''}`}
                >
                  {tab === 'overview' && <><FaEye /> Overview</>}
                  {tab === 'site-inspection' && <><FaHardHat /> Site Inspection</>}
                  {tab === 'quotation' && <><FaFilePdf /> Quotation</>}
                  {tab === 'documents' && <><FaImages /> Documents</>}
                  {tab === 'comments' && <><FaComment /> Comments</>}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <div className="info-grid-enad">
                  <div className="info-item-enad">
                    <span className="info-label-enad">Address</span>
                    <span className="info-value-enad">{getFullAddress(selectedItem.address)}</span>
                  </div>
                  <div className="info-item-enad">
                    <span className="info-label-enad">Property Type</span>
                    <span className="info-value-enad capitalize">{selectedItem.propertyType}</span>
                  </div>
                  <div className="info-item-enad">
                    <span className="info-label-enad">Roof Type</span>
                    <span className="info-value-enad capitalize">{selectedItem.roofType || 'Not specified'}</span>
                  </div>
                  <div className="info-item-enad">
                    <span className="info-label-enad">Desired Capacity</span>
                    <span className="info-value-enad">{selectedItem.desiredCapacity || 'Not specified'}</span>
                  </div>
                  <div className="info-item-enad">
                    <span className="info-label-enad">Booked Date</span>
                    <span className="info-value-enad">{formatDate(selectedItem.bookedAt)}</span>
                  </div>
                  <div className="info-item-enad">
                    <span className="info-label-enad">Preferred Date</span>
                    <span className="info-value-enad">{formatDate(selectedItem.preferredDate)}</span>
                  </div>
                  {selectedItem.siteVisitDate && (
                    <div className="info-item-enad">
                      <span className="info-label-enad">Site Visit Date</span>
                      <span className="info-value-enad">{formatDate(selectedItem.siteVisitDate)}</span>
                    </div>
                  )}
                  {selectedItem.deviceDeployedAt && (
                    <div className="info-item-enad">
                      <span className="info-label-enad">Device Deployed</span>
                      <span className="info-value-enad">{formatDate(selectedItem.deviceDeployedAt)}</span>
                    </div>
                  )}
                  <div className="info-item-enad">
                    <span className="info-label-enad">Assessment Fee</span>
                    <span className="info-value-enad">{formatCurrency(selectedItem.assessmentFee)}</span>
                  </div>
                  <div className="info-item-enad">
                    <span className="info-label-enad">Payment Status</span>
                    <span className={`status-badge-enad ${selectedItem.paymentStatus === 'paid' ? 'completed-enad' : 'pending-enad'}`}>
                      {selectedItem.paymentStatus}
                    </span>
                  </div>
                </div>
                
                {/* Assigned Device Section */}
                {deviceAssigned ? (
                  <div className="device-card-enad">
                    <div className="device-card-title-enad">
                      <FaMicrochip /> Assigned Device
                    </div>
                    <div className="device-info-enad">
                      <div className="device-info-item-enad">
                        <span className="device-info-label-enad">Device ID</span>
                        <span className="device-info-value-enad">
                          {selectedItem.iotDeviceId?.deviceId || 
                           selectedItem.assignedDevice?.deviceId || 
                           selectedItem.assignedDeviceId || 
                           'N/A'}
                        </span>
                      </div>
                      <div className="device-info-item-enad">
                        <span className="device-info-label-enad">Device Name</span>
                        <span className="device-info-value-enad">
                          {selectedItem.iotDeviceId?.deviceName || selectedItem.assignedDevice?.deviceName || 'IoT Device'}
                        </span>
                      </div>
                      <div className="device-info-item-enad">
                        <span className="device-info-label-enad">Status</span>
                        <span className={`device-info-value-enad ${selectedItem.deviceDeployedAt ? 'text-green-600' : 'text-yellow-600'}`}>
                          {selectedItem.deviceDeployedAt ? 'Deployed' : 'Ready for Deployment'}
                        </span>
                      </div>
                      {selectedItem.deviceDeployedAt && (
                        <>
                          <div className="device-info-item-enad">
                            <span className="device-info-label-enad">Deployed At</span>
                            <span className="device-info-value-enad">{formatDate(selectedItem.deviceDeployedAt)}</span>
                          </div>
                          <div className="device-info-item-enad">
                            <span className="device-info-label-enad">Deployed By</span>
                            <span className="device-info-value-enad">
                              {selectedItem.deviceDeployedBy?.firstName} {selectedItem.deviceDeployedBy?.lastName}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="no-device-card-enad">
                    <FaExclamationTriangle /> No device assigned yet. Please contact admin.
                  </div>
                )}
                
                {selectedItem.iotDeviceId && selectedItem.deviceDeployedAt && (
                  <div className="detail-section-enad">
                    <h3 className="detail-section-title-enad">Data Collection Status</h3>
                    <div className="info-grid-enad">
                      {selectedItem.dataCollectionStart && (
                        <div className="info-item-enad">
                          <span className="info-label-enad">Start Date</span>
                          <span className="info-value-enad">{formatDate(selectedItem.dataCollectionStart)}</span>
                        </div>
                      )}
                      {selectedItem.dataCollectionEnd && (
                        <div className="info-item-enad">
                          <span className="info-label-enad">End Date</span>
                          <span className="info-value-enad">{formatDate(selectedItem.dataCollectionEnd)}</span>
                        </div>
                      )}
                      {selectedItem.totalReadings > 0 && (
                        <div className="info-item-enad">
                          <span className="info-label-enad">Total Readings</span>
                          <span className="info-value-enad">{selectedItem.totalReadings}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Site Inspection Tab */}
            {activeTab === 'site-inspection' && (
              <div>
                <div className="action-buttons-enad">
                  <button
                    onClick={saveSiteAssessment}
                    disabled={submitting}
                    className="btn-secondary-enad"
                  >
                    {submitting ? <FaSpinner className="spinner-enad" /> : <FaSave />} Save Draft
                  </button>
                  {selectedItem.assessmentStatus !== 'device_deployed' && 
                   selectedItem.assessmentStatus !== 'data_collecting' && 
                   deviceAssigned && (
                    <button
                      onClick={deployDevice}
                      disabled={submitting}
                      className="btn-success-enad"
                    >
                      {submitting ? <FaSpinner className="spinner-enad" /> : <FaMicrochip />} Deploy Device
                    </button>
                  )}
                </div>
                
                <div className="form-group-enad">
                  <label className="form-label-enad">Roof Condition</label>
                  <div className="options-group-enad">
                    {ROOF_CONDITIONS.map(condition => (
                      <button
                        key={condition.value}
                        type="button"
                        onClick={() => handleAssessmentFormChange('roofCondition', condition.value)}
                        className={`option-btn-enad ${assessmentForm.roofCondition === condition.value ? 'active-enad' : ''}`}
                      >
                        {condition.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-group-enad">
                  <label className="form-label-enad">Roof Dimensions (meters)</label>
                  <div className="form-row-enad">
                    <input
                      type="number"
                      step="0.1"
                      value={assessmentForm.roofLength || ''}
                      onChange={(e) => handleAssessmentFormChange('roofLength', parseFloat(e.target.value))}
                      className="form-input-enad"
                      placeholder="Length"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={assessmentForm.roofWidth || ''}
                      onChange={(e) => handleAssessmentFormChange('roofWidth', parseFloat(e.target.value))}
                      className="form-input-enad"
                      placeholder="Width"
                    />
                  </div>
                </div>
                
                <div className="form-group-enad">
                  <label className="form-label-enad">Structural Integrity</label>
                  <div className="options-group-enad">
                    {STRUCTURAL_INTEGRITY.map(integrity => (
                      <button
                        key={integrity.value}
                        type="button"
                        onClick={() => handleAssessmentFormChange('structuralIntegrity', integrity.value)}
                        className={`option-btn-enad ${assessmentForm.structuralIntegrity === integrity.value ? 'active-enad' : ''}`}
                      >
                        {integrity.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-group-enad">
                  <label className="form-label-enad">Estimated Installation Time (days)</label>
                  <input
                    type="number"
                    value={assessmentForm.estimatedInstallationTime}
                    onChange={(e) => handleAssessmentFormChange('estimatedInstallationTime', e.target.value)}
                    className="form-input-enad"
                    style={{ width: '150px' }}
                  />
                </div>
                
                {deviceAssigned && (
                  <div className="form-group-enad">
                    <label className="form-label-enad">Deployment Notes</label>
                    <textarea
                      value={deployNotes}
                      onChange={(e) => setDeployNotes(e.target.value)}
                      rows={3}
                      className="form-textarea-enad"
                      placeholder="Enter deployment notes, device placement location, etc..."
                    />
                  </div>
                )}
                
                <div className="form-group-enad">
                  <label className="form-label-enad">Site Visit Notes</label>
                  <textarea
                    value={assessmentForm.siteVisitNotes}
                    onChange={(e) => handleAssessmentFormChange('siteVisitNotes', e.target.value)}
                    rows={4}
                    className="form-textarea-enad"
                    placeholder="Additional notes, observations, recommendations..."
                  />
                </div>
                
                <div className="form-group-enad">
                  <label className="form-label-enad">Engineer Recommendations</label>
                  <textarea
                    value={assessmentForm.recommendations}
                    onChange={(e) => handleAssessmentFormChange('recommendations', e.target.value)}
                    rows={3}
                    className="form-textarea-enad"
                    placeholder="Summary of recommendations for the client..."
                  />
                </div>
                
                <div className="form-group-enad">
                  <label className="form-label-enad">Technical Findings</label>
                  <textarea
                    value={assessmentForm.technicalFindings}
                    onChange={(e) => handleAssessmentFormChange('technicalFindings', e.target.value)}
                    rows={3}
                    className="form-textarea-enad"
                    placeholder="Technical observations, electrical assessment, structural findings..."
                  />
                </div>
              </div>
            )}

            {/* Quotation Tab */}
            {activeTab === 'quotation' && (
              <div>
                <div className="action-buttons-enad">
                  {selectedItem.assessmentStatus !== 'completed' && (
                    <button
                      onClick={submitFinalReport}
                      disabled={submitting}
                      className="btn-success-enad"
                    >
                      {submitting ? <FaSpinner className="spinner-enad" /> : <FaCheckCircle />} Submit Final Report
                    </button>
                  )}
                </div>
                
                <div className="form-grid-enad">
                  <div className="form-group-enad">
                    <label className="form-label-enad">Quotation Number</label>
                    <input
                      type="text"
                      value={quotationForm.quotationNumber}
                      onChange={(e) => handleQuotationChange('quotationNumber', e.target.value)}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">Expiry Date</label>
                    <input
                      type="date"
                      value={quotationForm.quotationExpiryDate}
                      onChange={(e) => handleQuotationChange('quotationExpiryDate', e.target.value)}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">System Type</label>
                    <select
                      value={quotationForm.systemType}
                      onChange={(e) => handleQuotationChange('systemType', e.target.value)}
                      className="form-select-enad"
                    >
                      {SYSTEM_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">System Size (kWp)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={quotationForm.systemSize}
                      onChange={(e) => handleQuotationChange('systemSize', parseFloat(e.target.value))}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">Panels Needed</label>
                    <input
                      type="number"
                      value={quotationForm.panelsNeeded}
                      onChange={(e) => handleQuotationChange('panelsNeeded', parseInt(e.target.value))}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">Inverter Type</label>
                    <input
                      type="text"
                      value={quotationForm.inverterType}
                      onChange={(e) => handleQuotationChange('inverterType', e.target.value)}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">Battery Type</label>
                    <input
                      type="text"
                      value={quotationForm.batteryType}
                      onChange={(e) => handleQuotationChange('batteryType', e.target.value)}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">Warranty Years</label>
                    <input
                      type="number"
                      value={quotationForm.warrantyYears}
                      onChange={(e) => handleQuotationChange('warrantyYears', parseInt(e.target.value))}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">Equipment Cost (₱)</label>
                    <input
                      type="number"
                      value={quotationForm.equipmentCost}
                      onChange={(e) => handleQuotationChange('equipmentCost', parseFloat(e.target.value))}
                      className="form-input-enad"
                    />
                  </div>
                  <div className="form-group-enad">
                    <label className="form-label-enad">Installation Cost (₱)</label>
                    <input
                      type="number"
                      value={quotationForm.installationCost}
                      onChange={(e) => handleQuotationChange('installationCost', parseFloat(e.target.value))}
                      className="form-input-enad"
                    />
                  </div>
                </div>
                
                <div className="cost-summary-enad">
                  <div className="cost-row-enad">
                    <span className="cost-label-enad">Total Cost:</span>
                    <span className="cost-value-enad total-cost-enad">{formatCurrency(quotationForm.totalCost)}</span>
                  </div>
                </div>
                
                <div className="form-group-enad">
                  <label className="form-label-enad">Payment Terms</label>
                  <textarea
                    value={quotationForm.paymentTerms}
                    onChange={(e) => handleQuotationChange('paymentTerms', e.target.value)}
                    rows={2}
                    className="form-textarea-enad"
                  />
                </div>
                
                <div className="file-upload-enad">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={uploadPreAssessmentQuotation}
                    className="file-upload-input-enad"
                    id="pre-quotation-file-input"
                  />
                  <label htmlFor="pre-quotation-file-input" className="file-upload-label-enad">
                    <FaFilePdf className="upload-icon-enad" />
                    <span className="upload-text-enad">Click to upload quotation PDF</span>
                  </label>
                  {uploading && (
                    <div className="uploading-enad">
                      <FaSpinner className="spinner-enad" /> Uploading...
                    </div>
                  )}
                  {selectedItem.quotation?.quotationUrl && (
                    <div className="uploaded-file-enad">
                      <span>Quotation PDF uploaded</span>
                      <a href={selectedItem.quotation.quotationUrl} target="_blank" rel="noopener noreferrer">
                        <FaDownload />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                <div className="action-buttons-enad">
                  <button onClick={() => setShowImageUploader(!showImageUploader)} className="btn-primary-enad">
                    <FaCamera /> Upload Photos
                  </button>
                </div>
                
                {showImageUploader && (
                  <div className="file-upload-enad">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="file-upload-input-enad"
                    />
                    {uploading && (
                      <div className="uploading-enad">
                        <FaSpinner className="spinner-enad" /> Uploading images...
                      </div>
                    )}
                  </div>
                )}
                
                <div className="image-grid-enad">
                  {siteImages.map((image, idx) => (
                    <div key={idx} className="image-card-enad">
                      <img src={image} alt={`Site photo ${idx + 1}`} />
                      <div className="image-overlay-enad">
                        <a href={image} target="_blank" rel="noopener noreferrer" className="image-overlay-icon-enad">
                          <FaEye />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                
                {siteImages.length === 0 && (
                  <div className="empty-state-enad">
                    <FaImages className="empty-icon-enad" />
                    <p>No photos uploaded yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div>
                <div className="comment-input-wrapper-enad">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="comment-textarea-enad"
                  />
                  <button
                    onClick={addComment}
                    disabled={submitting || !commentText.trim()}
                    className="comment-send-btn-enad"
                  >
                    <FaPaperPlane /> Send
                  </button>
                </div>
                
                <div className="comment-list-enad">
                  {selectedItem.engineerComments?.length === 0 && (
                    <div className="empty-state-enad">
                      <p>No comments yet</p>
                    </div>
                  )}
                  {selectedItem.engineerComments?.map((comment, idx) => (
                    <div key={idx} className="comment-item-enad">
                      <div className="comment-header-enad">
                        <div className="comment-user-enad">
                          <div className="comment-avatar-enad">
                            <FaUser />
                          </div>
                          <div>
                            <p className="comment-name-enad">{comment.commentedBy?.firstName} {comment.commentedBy?.lastName}</p>
                            <p className="comment-time-enad">{formatDate(comment.commentedAt)}</p>
                          </div>
                        </div>
                        {comment.isPublic && <span className="comment-badge-enad">Public</span>}
                      </div>
                      <p className="comment-text-enad">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {notification.show && (
        <div className={`notification-enad ${notification.type === 'success' ? 'success-enad' : 'error-enad'}`}>
          {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          {notification.message}
        </div>
      )}
    </>
  );
};

export default MyAssessments;