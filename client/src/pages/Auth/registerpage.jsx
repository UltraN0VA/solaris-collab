import React, { useState } from 'react';
import { FaSolarPanel, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { auth, googleProvider, facebookProvider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import '../../styles/Auth/register.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(''); // 'google' | 'facebook' | ''

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[0-9])/.test(formData.password)) newErrors.password = 'Password must contain at least one number';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';
    return newErrors;
  };

  // Email/password registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Account created successfully");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // GOOGLE REGISTER/LOGIN
  const handleGoogleRegister = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const response = await fetch("http://localhost:5000/api/auth/google-register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: user.displayName,
        email: user.email,
        googleId: user.uid,
        photoURL: user.photoURL
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Google login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.user.fullName);
    localStorage.setItem("userEmail", data.user.email);
    localStorage.setItem("userRole", data.user.role);

    if (data.user.photoURL) {
      localStorage.setItem("userPhotoURL", data.user.photoURL);
    }

    navigate("/dashboard");

  } catch (error) {
    console.error("Google login error:", error);
  }
};

  // FACEBOOK REGISTER/LOGIN
  const handleFacebookRegister = async () => {
    try {
      setSocialLoading('facebook');
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      // Send token to backend (you can create /facebook-login route similarly if needed)
      const idToken = await user.getIdToken();
      const response = await fetch("http://localhost:5000/api/auth/google-login", { // reuse google-login route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Facebook login failed");
        return;
      }

      // Save user info and JWT
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.fullName);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userRole", data.user.role);
      if (data.user.photoURL) localStorage.setItem("userPhotoURL", data.user.photoURL);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Facebook login failed");
    } finally {
      setSocialLoading('');
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {/* LEFT BRANDING */}
        <div className="register-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <FaSolarPanel className="brand-icon" />
              <h1 className="brand-name">SOLARIS</h1>
            </div>
            <h2 className="brand-tagline">IoT-Based Solar Site Pre-Assessment System</h2>
            <p className="brand-description">
              Join SOLARIS to access environmental data for solar installation planning
            </p>
            <div className="brand-features">
              <div className="brand-feature"><span className="feature-dot"></span> Environmental Data Collection</div>
              <div className="brand-feature"><span className="feature-dot"></span> Temporary Site Deployment</div>
              <div className="brand-feature"><span className="feature-dot"></span> Data Reference for Planning</div>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="register-form-container">
          <div className="register-form-wrapper">
            <div className="form-header">
              <h2 className="form-title">Create Account</h2>
              <p className="form-subtitle">Join SOLARIS for solar site assessment</p>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              {/* FULL NAME */}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="fullName"
                    className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              {/* EMAIL */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              {/* PASSWORD */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              {/* TERMS */}
              <div className="form-checkbox">
                <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} />
                <label>
                  I agree to the <Link to="/terms" className="terms-link">Terms</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                </label>
              </div>
              {errors.acceptTerms && <span className="error-message">{errors.acceptTerms}</span>}

              {/* SUBMIT */}
              <button type="submit" className="register-submit-btn" disabled={isLoading || socialLoading !== ''}>
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>

              {/* SOCIAL LOGIN */}
              <div className="social-login">
                <p className="social-login-text">Or sign up with</p>
                <div className="social-buttons">
                  <button type="button" className="social-btn google" onClick={handleGoogleRegister} disabled={socialLoading !== ''}>
                    {socialLoading === 'google' ? '⏳' : <FaGoogle />}
                  </button>
                  <button type="button" className="social-btn facebook" onClick={handleFacebookRegister} disabled={socialLoading !== ''}>
                    {socialLoading === 'facebook' ? '⏳' : <FaFacebook />}
                  </button>
                </div>
              </div>

              {/* LOGIN LINK */}
              <div className="login-prompt">
                <p className="login-text">
                  Already have an account? <Link to="/login" className="login-link">Sign in</Link>
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;