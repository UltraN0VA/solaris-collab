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

// Helper function to format date
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

// Assessment Type Configuration
const ASSESSMENT_TYPES = {
  free_quote: { 
    label: 'Free Quote', 
    color: 'bg-blue-100 text-blue-800',
    icon: FaQuoteRight,
    statusKey: 'status'
  },
  pre_assessment: { 
    label: 'Pre-Assessment', 
    color: 'bg-purple-100 text-purple-800',
    icon: FaClipboardCheck,
    statusKey: 'assessmentStatus'
  }
};

// Status configuration for Free Quotes
const FREE_QUOTE_STATUS = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: FaClock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: FaTools },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: FaTimes }
};

// In MyAssessments.jsx, verify this is present:
const PRE_ASSESSMENT_STATUS = {
  pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800', icon: FaDollarSign },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: FaClock },
  site_visit_ongoing: { label: 'Site Visit Ongoing', color: 'bg-orange-100 text-orange-800', icon: FaHardHat },
  device_deployed: { label: 'Device Deployed', color: 'bg-purple-100 text-purple-800', icon: FaMicrochip },  // Make sure this exists
  data_collecting: { label: 'Collecting Data', color: 'bg-indigo-100 text-indigo-800', icon: FaChartLine },
  data_analyzing: { label: 'Analyzing Data', color: 'bg-pink-100 text-pink-800', icon: FaChartLine },
  report_draft: { label: 'Report Draft', color: 'bg-gray-100 text-gray-800', icon: FaFileAlt },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: FaTimes }
};

const ROOF_CONDITIONS = [
  { value: 'excellent', label: 'Excellent', color: 'green' },
  { value: 'good', label: 'Good', color: 'blue' },
  { value: 'fair', label: 'Fair', color: 'yellow' },
  { value: 'poor', label: 'Poor', color: 'red' }
];

const STRUCTURAL_INTEGRITY = [
  { value: 'excellent', label: 'Excellent', color: 'green' },
  { value: 'good', label: 'Good', color: 'blue' },
  { value: 'fair', label: 'Fair', color: 'yellow' },
  { value: 'poor', label: 'Poor', color: 'red' }
];

const SYSTEM_TYPES = [
  { value: 'grid-tie', label: 'Grid-Tie System' },
  { value: 'hybrid', label: 'Hybrid System' },
  { value: 'off-grid', label: 'Off-Grid System' }
];

// Helper function to check if device is assigned
const hasDeviceAssigned = (item) => {
  return !!(item.iotDeviceId || item.assignedDevice || item.assignedDeviceId);
};

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

  // Quotation Form State (for pre-assessment)
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

  // Fetch all assessments on mount
  useEffect(() => {
    fetchAllAssessments();
  }, []);

  // Filter assessments when search or filter changes
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

  // Auto-calculate total cost
  useEffect(() => {
    const total = (quotationForm.installationCost || 0) + (quotationForm.equipmentCost || 0);
    setQuotationForm(prev => ({ ...prev, totalCost: total }));
  }, [quotationForm.installationCost, quotationForm.equipmentCost]);

  // Auto-calculate for free quote form
  useEffect(() => {
    const total = (freeQuoteForm.installationCost || 0) + (freeQuoteForm.equipmentCost || 0);
    setFreeQuoteForm(prev => ({ ...prev, totalCost: total }));
  }, [freeQuoteForm.installationCost, freeQuoteForm.equipmentCost]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };

  const fetchAllAssessments = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      
      // Fetch free quotes assigned to engineer
      const freeQuotesRes = await axios.get('/api/free-quotes/engineer/my-quotes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch pre-assessments assigned to engineer
      const preAssessmentsRes = await axios.get('/api/pre-assessments/engineer/my-assessments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Format free quotes with client info
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
      
      // Format pre-assessments with client info - include all device fields
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
      
      // Ensure client data is properly structured
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
      
      // Populate free quote form with existing data
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
      
      // Ensure client data is properly structured with all device fields
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
      
      // Populate forms with existing data
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
    
    // Add quotation details to form data
    Object.entries(freeQuoteForm).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(
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
      // Update status to completed
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
    
    // Add quotation details to form data
    Object.entries(quotationForm).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(
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

  // Deploy Device function
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

  // Save site assessment
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

  if (loading && allAssessments.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading assessments...</p>
        </div>
      </div>
    );
  }

  // Assessment List View
  if (!selectedItem) {
    const availableStatuses = [...new Set(allAssessments.map(item => {
      return item.type === 'free_quote' ? item.status : item.assessmentStatus;
    }))];
    
    return (
      <>
        <Helmet>
          <title>My Assessments - Engineer | Solar CRM</title>
        </Helmet>

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Assessments</h1>
            <p className="text-gray-600">Manage free quotes and site assessments</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by reference or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="w-36">
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Types</option>
                  <option value="free_quote">Free Quotes</option>
                  <option value="pre_assessment">Pre-Assessments</option>
                </select>
              </div>
            </div>
            <div className="w-40">
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
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
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center text-red-700">
                <FaExclamationTriangle className="mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {filteredAssessments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No assessments found</h3>
              <p className="text-gray-500">
                {allAssessments.length === 0 
                  ? "You don't have any assessments assigned yet."
                  : "No assessments match your search criteria."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAssessments.map((item) => {
                const StatusIcon = getStatusConfig(item).icon;
                const TypeIcon = getTypeConfig(item.type).icon;
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeConfig(item.type).color}`}>
                            <TypeIcon className="text-xs" />
                            {getTypeConfig(item.type).label}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {item.clientName} {item.clientLastName}
                          </h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusConfig(item).color}`}>
                          <StatusIcon className="text-xs" />
                          {getStatusConfig(item).label}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-3">
                        Ref: {item.bookingReference || item.quotationReference}
                      </p>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{getFullAddress(item.address)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          <span>Requested: {formatDate(item.preferredDate || item.requestedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaHome className="text-gray-400" />
                          <span className="capitalize">{item.propertyType || 'N/A'}</span>
                        </div>
                        {item.type === 'free_quote' && item.monthlyBill && (
                          <div className="flex items-center gap-2">
                            <FaDollarSign className="text-gray-400" />
                            <span>Monthly Bill: {formatCurrency(item.monthlyBill)}</span>
                          </div>
                        )}
                        {item.type === 'pre_assessment' && hasDeviceAssigned(item) && (
                          <div className="flex items-center gap-2">
                            <FaMicrochip className="text-gray-400" />
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                              Device Assigned
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {item.type === 'pre_assessment' && item.sitePhotos?.length > 0 && (
                            <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded flex items-center gap-1">
                              <FaCamera /> {item.sitePhotos.length} Photos
                            </span>
                          )}
                          {item.type === 'free_quote' && item.quotationFile && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded flex items-center gap-1">
                              <FaFilePdf /> Quotation Ready
                            </span>
                          )}
                        </div>
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
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
          <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white z-50`}>
            {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            {notification.message}
          </div>
        )}
      </>
    );
  }

  // Detail View for Free Quote
  if (selectedType === 'free_quote') {
    const StatusIcon = getStatusConfig(selectedItem).icon;
    const TypeIcon = getTypeConfig('free_quote').icon;
    
    return (
      <>
        <Helmet>
          <title>Free Quote Details - Engineer | Solar CRM</title>
        </Helmet>

        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={handleBackToList}
              className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <FaArrowLeft /> Back to Assessments
            </button>
            
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getTypeConfig('free_quote').color}`}>
                    <TypeIcon />
                    Free Quote
                  </span>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {selectedItem.quotationReference}
                  </h1>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaUser />
                    <span>{selectedItem.clientName} {selectedItem.clientLastName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope />
                    <span>{selectedItem.clientEmail || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone />
                    <span>{selectedItem.clientPhone || 'No contact'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBuilding />
                    <span className="capitalize">{selectedItem.clientType || 'Residential'}</span>
                  </div>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusConfig(selectedItem).color}`}>
                <StatusIcon />
                {getStatusConfig(selectedItem).label}
              </span>
            </div>
          </div>

          {/* Free Quote Content */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaUser /> Client Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedItem.clientName} {selectedItem.clientLastName}</p>
                    <p><span className="font-medium">Contact:</span> {selectedItem.clientPhone || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {selectedItem.clientEmail || 'N/A'}</p>
                    <p><span className="font-medium">Client Type:</span> <span className="capitalize">{selectedItem.clientType}</span></p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaFileAlt /> Request Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Monthly Bill:</span> {formatCurrency(selectedItem.monthlyBill)}</p>
                    <p><span className="font-medium">Property Type:</span> <span className="capitalize">{selectedItem.propertyType}</span></p>
                    <p><span className="font-medium">Desired Capacity:</span> {selectedItem.desiredCapacity || 'Not specified'}</p>
                    <p><span className="font-medium">Requested:</span> {formatDate(selectedItem.requestedAt)}</p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt /> Address
                </h3>
                <p className="text-sm">{getFullAddress(selectedItem.address)}</p>
              </div>
              
              {/* Quotation Form */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaFilePdf /> Generate Quotation
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Number</label>
                      <input type="text" value={freeQuoteForm.quotationNumber} onChange={(e) => handleFreeQuoteFormChange('quotationNumber', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input type="date" value={freeQuoteForm.quotationExpiryDate} onChange={(e) => handleFreeQuoteFormChange('quotationExpiryDate', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">System Type</label>
                      <select value={freeQuoteForm.systemType} onChange={(e) => handleFreeQuoteFormChange('systemType', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2">
                        {SYSTEM_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">System Size (kWp)</label>
                      <input type="number" step="0.1" value={freeQuoteForm.systemSize} onChange={(e) => handleFreeQuoteFormChange('systemSize', parseFloat(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Panels Needed</label>
                      <input type="number" value={freeQuoteForm.panelsNeeded} onChange={(e) => handleFreeQuoteFormChange('panelsNeeded', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inverter Type</label>
                      <input type="text" value={freeQuoteForm.inverterType} onChange={(e) => handleFreeQuoteFormChange('inverterType', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Battery Type</label>
                      <input type="text" value={freeQuoteForm.batteryType} onChange={(e) => handleFreeQuoteFormChange('batteryType', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Years</label>
                      <input type="number" value={freeQuoteForm.warrantyYears} onChange={(e) => handleFreeQuoteFormChange('warrantyYears', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Cost</label>
                      <input type="number" value={freeQuoteForm.equipmentCost} onChange={(e) => handleFreeQuoteFormChange('equipmentCost', parseFloat(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Installation Cost</label>
                      <input type="number" value={freeQuoteForm.installationCost} onChange={(e) => handleFreeQuoteFormChange('installationCost', parseFloat(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Cost:</span>
                    <span className="text-green-600">{formatCurrency(freeQuoteForm.totalCost)}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <textarea value={freeQuoteForm.paymentTerms} onChange={(e) => handleFreeQuoteFormChange('paymentTerms', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg p-2" />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea value={freeQuoteForm.remarks} onChange={(e) => handleFreeQuoteFormChange('remarks', e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg p-2" />
                </div>
                
                <div className="mt-6 border-t pt-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input type="file" accept=".pdf" onChange={uploadFreeQuoteQuotation} className="hidden" id="free-quote-file-input" />
                    <label htmlFor="free-quote-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                      <FaFilePdf className="text-4xl text-red-500" />
                      <span className="text-sm text-gray-600">Click to upload quotation PDF</span>
                    </label>
                    {uploading && <div className="mt-2 text-center"><FaSpinner className="animate-spin inline mr-2" /> Uploading...</div>}
                  </div>
                  {selectedItem.quotationFile && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg flex justify-between">
                      <span className="text-sm">Quotation PDF uploaded</span>
                      <a href={selectedItem.quotationFile} target="_blank" rel="noopener noreferrer" className="text-green-600"><FaDownload /></a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {notification.show && (
          <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white z-50`}>
            {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            {notification.message}
          </div>
        )}
      </>
    );
  }

  // Detail View for Pre-Assessment
  const StatusIcon = getStatusConfig(selectedItem).icon;
  const deviceAssigned = hasDeviceAssigned(selectedItem);
  
  return (
    <>
      <Helmet>
        <title>Pre-Assessment Details - Engineer | Solar CRM</title>
      </Helmet>

      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={handleBackToList}
            className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <FaArrowLeft /> Back to Assessments
          </button>
          
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Pre-Assessment: {selectedItem.bookingReference}
              </h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaUser />
                  <span>{selectedItem.clientName} {selectedItem.clientLastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaEnvelope />
                  <span>{selectedItem.clientEmail || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPhone />
                  <span>{selectedItem.clientPhone || 'No contact'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaBuilding />
                  <span className="capitalize">{selectedItem.clientType || 'Residential'}</span>
                </div>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusConfig(selectedItem).color}`}>
              <StatusIcon />
              {getStatusConfig(selectedItem).label}
            </span>
          </div>
        </div>

        {/* Tabs for Pre-Assessment */}
        <div className="border-b border-gray-200 mb-6 overflow-x-auto">
          <nav className="flex gap-4 min-w-max">
            {['overview', 'site-inspection', 'quotation', 'documents', 'comments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'overview' && <><FaEye className="inline mr-2" /> Overview</>}
                {tab === 'site-inspection' && <><FaHardHat className="inline mr-2" /> Site Inspection</>}
                {tab === 'quotation' && <><FaFilePdf className="inline mr-2" /> Quotation</>}
                {tab === 'documents' && <><FaImages className="inline mr-2" /> Documents</>}
                {tab === 'comments' && <><FaComment className="inline mr-2" /> Comments</>}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaUser /> Client Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedItem.clientName} {selectedItem.clientLastName}</p>
                    <p><span className="font-medium">Contact:</span> {selectedItem.clientPhone || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {selectedItem.clientEmail || 'N/A'}</p>
                    <p><span className="font-medium">Client Type:</span> <span className="capitalize">{selectedItem.clientType}</span></p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaBuilding /> Property Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Address:</span> {getFullAddress(selectedItem.address)}</p>
                    <p><span className="font-medium">Property Type:</span> <span className="capitalize">{selectedItem.propertyType}</span></p>
                    <p><span className="font-medium">Roof Type:</span> <span className="capitalize">{selectedItem.roofType || 'Not specified'}</span></p>
                    <p><span className="font-medium">Desired Capacity:</span> {selectedItem.desiredCapacity || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaCalendarAlt /> Assessment Timeline
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Booked:</span> {formatDate(selectedItem.bookedAt)}</p>
                    <p><span className="font-medium">Preferred Date:</span> {formatDate(selectedItem.preferredDate)}</p>
                    {selectedItem.siteVisitDate && (
                      <p><span className="font-medium">Site Visit:</span> {formatDate(selectedItem.siteVisitDate)}</p>
                    )}
                    {selectedItem.deviceDeployedAt && (
                      <p><span className="font-medium">Device Deployed:</span> {formatDate(selectedItem.deviceDeployedAt)}</p>
                    )}
                    {selectedItem.completedAt && (
                      <p><span className="font-medium">Completed:</span> {formatDate(selectedItem.completedAt)}</p>
                    )}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaFileAlt /> Payment Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Assessment Fee:</span> {formatCurrency(selectedItem.assessmentFee)}</p>
                    <p><span className="font-medium">Payment Method:</span> <span className="capitalize">{selectedItem.paymentMethod || 'Pending'}</span></p>
                    <p><span className="font-medium">Payment Status:</span> 
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        selectedItem.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        selectedItem.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedItem.paymentStatus}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Assigned Device Section */}
              {deviceAssigned ? (
                <div className="mt-6 border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaMicrochip className="text-blue-600" /> Assigned Device
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Device ID:</span>
                      <p className="text-blue-700 font-mono">
                        {selectedItem.iotDeviceId?.deviceId || 
                         selectedItem.assignedDevice?.deviceId || 
                         selectedItem.assignedDeviceId || 
                         'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Device Name:</span>
                      <p>{selectedItem.iotDeviceId?.deviceName || selectedItem.assignedDevice?.deviceName || 'IoT Device'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <p className={`capitalize ${selectedItem.deviceDeployedAt ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedItem.deviceDeployedAt ? 'Deployed' : 'Ready for Deployment'}
                      </p>
                    </div>
                    {selectedItem.deviceDeployedAt && (
                      <>
                        <div>
                          <span className="font-medium">Deployed At:</span>
                          <p>{formatDate(selectedItem.deviceDeployedAt)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Deployed By:</span>
                          <p>{selectedItem.deviceDeployedBy?.firstName} {selectedItem.deviceDeployedBy?.lastName}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6 border rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <FaExclamationTriangle />
                    <span className="font-medium">No device assigned yet</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">
                    Please contact admin to assign a device for this assessment.
                  </p>
                </div>
              )}
              
              {selectedItem.iotDeviceId && selectedItem.deviceDeployedAt && (
                <div className="mt-4 border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaWifi /> Data Collection Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {selectedItem.dataCollectionStart && (
                      <div>
                        <span className="font-medium">Start:</span>
                        <p>{formatDate(selectedItem.dataCollectionStart)}</p>
                      </div>
                    )}
                    {selectedItem.dataCollectionEnd && (
                      <div>
                        <span className="font-medium">End:</span>
                        <p>{formatDate(selectedItem.dataCollectionEnd)}</p>
                      </div>
                    )}
                    {selectedItem.totalReadings > 0 && (
                      <div>
                        <span className="font-medium">Total Readings:</span>
                        <p>{selectedItem.totalReadings}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Site Inspection Tab */}
          {activeTab === 'site-inspection' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Site Inspection Report</h2>
                <div className="flex gap-3">
                  <button
                    onClick={saveSiteAssessment}
                    disabled={submitting}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    Save Draft
                  </button>
                  {/* Deploy Device Button - Shows when device is assigned and not yet deployed */}
                  {selectedItem.assessmentStatus !== 'device_deployed' && 
                   selectedItem.assessmentStatus !== 'data_collecting' && 
                   deviceAssigned && (
                    <button
                      onClick={deployDevice}
                      disabled={submitting}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? <FaSpinner className="animate-spin" /> : <FaMicrochip />}
                      Deploy Device
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-6 max-w-3xl">
                {/* Roof Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roof Condition</label>
                  <div className="flex flex-wrap gap-4">
                    {ROOF_CONDITIONS.map(condition => (
                      <button
                        key={condition.value}
                        type="button"
                        onClick={() => handleAssessmentFormChange('roofCondition', condition.value)}
                        className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                          assessmentForm.roofCondition === condition.value
                            ? `bg-${condition.color}-600 text-white`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {condition.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Roof Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roof Length (meters)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={assessmentForm.roofLength || ''}
                      onChange={(e) => handleAssessmentFormChange('roofLength', parseFloat(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 10.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roof Width (meters)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={assessmentForm.roofWidth || ''}
                      onChange={(e) => handleAssessmentFormChange('roofWidth', parseFloat(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 8.0"
                    />
                  </div>
                </div>
                
                {/* Structural Integrity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Structural Integrity</label>
                  <div className="flex flex-wrap gap-4">
                    {STRUCTURAL_INTEGRITY.map(integrity => (
                      <button
                        key={integrity.value}
                        type="button"
                        onClick={() => handleAssessmentFormChange('structuralIntegrity', integrity.value)}
                        className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                          assessmentForm.structuralIntegrity === integrity.value
                            ? `bg-${integrity.color}-600 text-white`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {integrity.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Estimated Installation Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Installation Time (days)
                  </label>
                  <input
                    type="number"
                    value={assessmentForm.estimatedInstallationTime}
                    onChange={(e) => handleAssessmentFormChange('estimatedInstallationTime', e.target.value)}
                    className="w-32 border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                {/* Deployment Notes - only show if device assigned */}
                {deviceAssigned && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deployment Notes
                    </label>
                    <textarea
                      value={deployNotes}
                      onChange={(e) => setDeployNotes(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter deployment notes, device placement location, etc..."
                    />
                  </div>
                )}
                
                {/* Site Visit Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Visit Notes
                  </label>
                  <textarea
                    value={assessmentForm.siteVisitNotes}
                    onChange={(e) => handleAssessmentFormChange('siteVisitNotes', e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-green-500 focus:border-green-500"
                    placeholder="Additional notes, observations, recommendations..."
                  />
                </div>
                
                {/* Engineer Recommendations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engineer Recommendations
                  </label>
                  <textarea
                    value={assessmentForm.recommendations}
                    onChange={(e) => handleAssessmentFormChange('recommendations', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-green-500 focus:border-green-500"
                    placeholder="Summary of recommendations for the client..."
                  />
                </div>
                
                {/* Technical Findings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technical Findings
                  </label>
                  <textarea
                    value={assessmentForm.technicalFindings}
                    onChange={(e) => handleAssessmentFormChange('technicalFindings', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-green-500 focus:border-green-500"
                    placeholder="Technical observations, electrical assessment, structural findings..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quotation Tab */}
          {activeTab === 'quotation' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Quotation Generation</h2>
                {selectedItem.assessmentStatus !== 'completed' && (
                  <button
                    onClick={submitFinalReport}
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                    Submit Final Report
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Number</label>
                    <input type="text" value={quotationForm.quotationNumber} onChange={(e) => handleQuotationChange('quotationNumber', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input type="date" value={quotationForm.quotationExpiryDate} onChange={(e) => handleQuotationChange('quotationExpiryDate', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">System Type</label>
                    <select value={quotationForm.systemType} onChange={(e) => handleQuotationChange('systemType', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2">
                      {SYSTEM_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">System Size (kWp)</label>
                    <input type="number" step="0.1" value={quotationForm.systemSize} onChange={(e) => handleQuotationChange('systemSize', parseFloat(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Panels Needed</label>
                    <input type="number" value={quotationForm.panelsNeeded} onChange={(e) => handleQuotationChange('panelsNeeded', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-gray-800 mb-4">Cost Breakdown</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Cost</label>
                        <input type="number" value={quotationForm.equipmentCost} onChange={(e) => handleQuotationChange('equipmentCost', parseFloat(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Installation Cost</label>
                        <input type="number" value={quotationForm.installationCost} onChange={(e) => handleQuotationChange('installationCost', parseFloat(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex justify-between text-base font-medium">
                          <span>Total Cost:</span>
                          <span className="text-green-600 text-xl">{formatCurrency(quotationForm.totalCost)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Upload Quotation PDF</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input type="file" accept=".pdf" onChange={uploadPreAssessmentQuotation} className="hidden" id="pre-quotation-file-input" />
                      <label htmlFor="pre-quotation-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                        <FaFilePdf className="text-4xl text-red-500" />
                        <span className="text-sm text-gray-600">Click to upload quotation PDF</span>
                      </label>
                      {uploading && <div className="mt-2 text-center"><FaSpinner className="animate-spin inline mr-2" /> Uploading...</div>}
                    </div>
                    {selectedItem.quotation?.quotationUrl && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg flex justify-between">
                        <span className="text-sm">Quotation PDF uploaded</span>
                        <a href={selectedItem.quotation.quotationUrl} target="_blank" rel="noopener noreferrer" className="text-green-600"><FaDownload /></a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Site Documents</h2>
                <button onClick={() => setShowImageUploader(!showImageUploader)} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
                  <FaCamera /> Upload Photos
                </button>
              </div>
              
              {showImageUploader && (
                <div className="mb-6 p-4 border border-dashed border-gray-300 rounded-lg">
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="w-full" />
                  {uploading && <div className="mt-2 text-center"><FaSpinner className="animate-spin inline mr-2" /> Uploading images...</div>}
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {siteImages.map((image, idx) => (
                  <div key={idx} className="relative group">
                    <img src={image} alt={`Site photo ${idx + 1}`} className="w-full h-40 object-cover rounded-lg" />
                    <a href={image} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <FaEye className="text-white text-2xl" />
                    </a>
                  </div>
                ))}
              </div>
              
              {siteImages.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FaImages className="text-4xl mx-auto mb-2" />
                  <p>No photos uploaded yet</p>
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Comments & Discussion</h2>
              <div className="mb-6 flex gap-2">
                <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." rows={3} className="flex-1 border border-gray-300 rounded-lg p-3" />
                <button onClick={addComment} disabled={submitting || !commentText.trim()} className="px-4 py-2 bg-green-600 text-white rounded-lg h-fit flex items-center gap-2">
                  <FaPaperPlane /> Send
                </button>
              </div>
              <div className="space-y-4">
                {selectedItem.engineerComments?.length === 0 && <p className="text-gray-500 text-center py-8">No comments yet</p>}
                {selectedItem.engineerComments?.map((comment, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><FaUser className="text-gray-500 text-sm" /></div>
                        <div>
                          <p className="font-medium text-sm">{comment.commentedBy?.firstName} {comment.commentedBy?.lastName}</p>
                          <p className="text-xs text-gray-500">{formatDate(comment.commentedAt)}</p>
                        </div>
                      </div>
                      {comment.isPublic ? <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Public</span> : <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Private</span>}
                    </div>
                    <p className="text-gray-700 mt-2">{comment.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white z-50`}>
          {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          {notification.message}
        </div>
      )}
    </>
  );
};

export default MyAssessments;