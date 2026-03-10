import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSolarPanel, 
  FaUser, 
  FaPhone, 
  FaBirthdayCake,
  FaHome,
  FaMapMarkerAlt,
  FaCity,
  FaGlobe,
  FaMailBulk,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';
import '../../styles/Customer/setupacc.css';

const SetupAccount = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    birthday: '',
    
    // Address Info
    houseNumber: '',
    street: '',
    barangay: '',
    municipality: '',
    province: '',
    zipCode: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Validate Step 1 (Personal Info)
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.birthday) newErrors.birthday = 'Birthday is required';
    
    // Phone number validation (Philippines format)
    if (formData.phoneNumber && !/^(09|\+639)\d{9}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Enter a valid Philippine mobile number (09XXXXXXXXX or +639XXXXXXXXX)';
    }
    
    return newErrors;
  };

  // Validate Step 2 (Address Info)
  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.houseNumber) newErrors.houseNumber = 'House number is required';
    if (!formData.street) newErrors.street = 'Street is required';
    if (!formData.barangay) newErrors.barangay = 'Barangay is required';
    if (!formData.municipality) newErrors.municipality = 'Municipality is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    
    // ZIP code validation
    if (formData.zipCode && !/^\d{4}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'ZIP code must be 4 digits';
    }
    
    return newErrors;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const stepErrors = validateStep1();
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep === 2) {
      const stepErrors = validateStep2();
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to localStorage or send to backend
      localStorage.setItem('userSetupComplete', 'true');
      
      // Go to success step
      setCurrentStep(3);
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="setup-page">
      <div className="setup-card">
        {/* Left Side - Progress */}
        <div className="setup-progress">
          <div className="progress-header">
            <div className="logo-container">
              <div className="logo-icon">
                <FaSolarPanel />
              </div>
              <h1 className="logo-text">SOLARIS</h1>
            </div>
            <p className="progress-subtitle">Complete your account setup</p>
          </div>

          <div className="progress-steps">
            <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-indicator">
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <div className="step-info">
                <span className="step-label">Step 1</span>
                <span className="step-title">Personal Information</span>
              </div>
            </div>

            <div className={`progress-line ${currentStep >= 2 ? 'active' : ''}`}></div>

            <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-indicator">
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <div className="step-info">
                <span className="step-label">Step 2</span>
                <span className="step-title">Address Information</span>
              </div>
            </div>

            <div className={`progress-line ${currentStep >= 3 ? 'active' : ''}`}></div>

            <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-indicator">3</div>
              <div className="step-info">
                <span className="step-label">Step 3</span>
                <span className="step-title">Complete</span>
              </div>
            </div>
          </div>

          <div className="progress-illustration">
            <div className="illustration-icon">⚡</div>
            <p>You're almost there! Complete your profile to start using SOLARIS.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="setup-form-container">
          <div className="setup-form-wrapper">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <>
                <div className="form-header">
                  <h2 className="form-title">Personal Information</h2>
                  <p className="form-subtitle">Tell us about yourself</p>
                </div>

                <form className="setup-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <div className="input-wrapper">
                        <FaUser className="input-icon" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`form-input ${errors.firstName ? 'error' : ''}`}
                          placeholder="Enter first name"
                        />
                      </div>
                      {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Middle Name</label>
                      <div className="input-wrapper">
                        <FaUser className="input-icon" />
                        <input
                          type="text"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter middle name (optional)"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <div className="input-wrapper">
                        <FaUser className="input-icon" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`form-input ${errors.lastName ? 'error' : ''}`}
                          placeholder="Enter last name"
                        />
                      </div>
                      {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <div className="input-wrapper">
                        <FaPhone className="input-icon" />
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                          placeholder="09XXXXXXXXX"
                        />
                      </div>
                      {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Birthday</label>
                      <div className="input-wrapper">
                        <FaBirthdayCake className="input-icon" />
                        <input
                          type="date"
                          name="birthday"
                          value={formData.birthday}
                          onChange={handleChange}
                          className={`form-input ${errors.birthday ? 'error' : ''}`}
                        />
                      </div>
                      {errors.birthday && <span className="error-message">{errors.birthday}</span>}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button"
                      onClick={handleNext}
                      className="btn-next"
                    >
                      Next Step <FaArrowRight />
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 2: Address Information */}
            {currentStep === 2 && (
              <>
                <div className="form-header">
                  <h2 className="form-title">Address Information</h2>
                  <p className="form-subtitle">Where are you located?</p>
                </div>

                <form onSubmit={handleSubmit} className="setup-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">House Number</label>
                      <div className="input-wrapper">
                        <FaHome className="input-icon" />
                        <input
                          type="text"
                          name="houseNumber"
                          value={formData.houseNumber}
                          onChange={handleChange}
                          className={`form-input ${errors.houseNumber ? 'error' : ''}`}
                          placeholder="Enter house/bldg number"
                        />
                      </div>
                      {errors.houseNumber && <span className="error-message">{errors.houseNumber}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Street</label>
                      <div className="input-wrapper">
                        <FaMapMarkerAlt className="input-icon" />
                        <input
                          type="text"
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          className={`form-input ${errors.street ? 'error' : ''}`}
                          placeholder="Enter street name"
                        />
                      </div>
                      {errors.street && <span className="error-message">{errors.street}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Barangay</label>
                      <div className="input-wrapper">
                        <FaCity className="input-icon" />
                        <input
                          type="text"
                          name="barangay"
                          value={formData.barangay}
                          onChange={handleChange}
                          className={`form-input ${errors.barangay ? 'error' : ''}`}
                          placeholder="Enter barangay"
                        />
                      </div>
                      {errors.barangay && <span className="error-message">{errors.barangay}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Municipality/City</label>
                      <div className="input-wrapper">
                        <FaCity className="input-icon" />
                        <input
                          type="text"
                          name="municipality"
                          value={formData.municipality}
                          onChange={handleChange}
                          className={`form-input ${errors.municipality ? 'error' : ''}`}
                          placeholder="Enter municipality/city"
                        />
                      </div>
                      {errors.municipality && <span className="error-message">{errors.municipality}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Province</label>
                      <div className="input-wrapper">
                        <FaGlobe className="input-icon" />
                        <input
                          type="text"
                          name="province"
                          value={formData.province}
                          onChange={handleChange}
                          className={`form-input ${errors.province ? 'error' : ''}`}
                          placeholder="Enter province"
                        />
                      </div>
                      {errors.province && <span className="error-message">{errors.province}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">ZIP Code</label>
                      <div className="input-wrapper">
                        <FaMailBulk className="input-icon" />
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          className={`form-input ${errors.zipCode ? 'error' : ''}`}
                          placeholder="Enter ZIP code"
                          maxLength="4"
                        />
                      </div>
                      {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button"
                      onClick={handleBack}
                      className="btn-back"
                    >
                      <FaArrowLeft /> Back
                    </button>
                    <button 
                      type="submit"
                      className="btn-submit"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Complete Setup'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 3: Success */}
            {currentStep === 3 && (
              <div className="success-container">
                <div className="success-icon">
                  <FaCheckCircle />
                </div>
                <h2 className="success-title">✓ All Set-Up</h2>
                <p className="success-message">
                  Your account setup is complete.
                </p>
                <button 
                  onClick={handleContinueToDashboard}
                  className="btn-dashboard"
                >
                  Continue to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupAccount;