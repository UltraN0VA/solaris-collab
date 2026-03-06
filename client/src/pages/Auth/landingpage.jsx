import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; // Add this import
import "../../styles/Auth/landingpage.css";
import { 
  FaChartBar, 
  FaMapMarkerAlt, 
  FaDatabase, 
  FaUsers, 
  FaHardHat,
  FaProjectDiagram,
  FaClipboardList,
  FaExclamationTriangle,
  FaBan,
  FaTimesCircle,
  FaArrowRight,
  FaMicrochip,
  FaSolarPanel,
  FaTemperatureHigh,
  FaTint,
  FaBolt,
  FaUserTie,
  FaUserCog,
  FaUserCheck,
  FaShieldAlt,
  FaChartLine,
  FaCopy,
  FaBook,
  FaCalendarAlt,
  FaSignal,
  FaWifi,
  FaServer,
  FaCloud,
  FaBatteryFull,
  FaRuler,
  FaWind,
  FaSun
} from 'react-icons/fa';

const LandingPage = () => {
  const navigate = useNavigate(); // Add this hook
  const [activeSection, setActiveSection] = useState("home");

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'what', 'how', 'features', 'users', 'limitations'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add navigation handlers
  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="solaris-landing-page">
      {/* Header */}
      <header className="solaris-header">
        <div className="header-container">
          <div className="logo-container">
            <div className="logo-icon">
              <FaSolarPanel style={{ color: '#f39c12' }} />
            </div>
            <h1 className="logo-text">SOLARIS</h1>
          </div>
          
          <nav className="main-nav">
            <button 
              className={`nav-btn ${activeSection === 'what' ? 'active' : ''}`}
              onClick={() => scrollToSection('what')}
            >
              What It Does
            </button>
            <button 
              className={`nav-btn ${activeSection === 'how' ? 'active' : ''}`}
              onClick={() => scrollToSection('how')}
            >
              How It Works
            </button>
            <button 
              className={`nav-btn ${activeSection === 'features' ? 'active' : ''}`}
              onClick={() => scrollToSection('features')}
            >
              Features
            </button>
            <button 
              className={`nav-btn ${activeSection === 'users' ? 'active' : ''}`}
              onClick={() => scrollToSection('users')}
            >
              Users
            </button>
          </nav>

          <div className="auth-buttons">
            <button 
              className="btn-login"
              onClick={handleLoginClick} // Add click handler
            >
              Log In
            </button>
            <button 
              className="btn-register"
              onClick={handleRegisterClick} // Add click handler
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Rest of your component remains the same */}
      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h2 className="hero-title">IoT-Based Solar Site Pre-Assessment System</h2>
            <p className="hero-subtitle">
              Collect, transmit, and review environmental data for solar installation planning
            </p>
            <div className="hero-buttons">
              <button 
                className="btn-primary"
                onClick={() => scrollToSection('what')}
              >
                Learn How It Works
              </button>
              <button 
                className="btn-secondary"
                onClick={() => scrollToSection('limitations')}
              >
                View System Scope
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="stats-grid">
              <div className="stat-card">
                <FaSun className="stat-icon" style={{ color: '#f39c12' }} />
                <div className="stat-info">
                  <span className="stat-label">Solar Irradiance</span>
                  <span className="stat-value">850 W/m²</span>
                </div>
              </div>
              <div className="stat-card">
                <FaTemperatureHigh className="stat-icon" style={{ color: '#e67e22' }} />
                <div className="stat-info">
                  <span className="stat-label">Temperature</span>
                  <span className="stat-value">24°C</span>
                </div>
              </div>
              <div className="stat-card">
                <FaTint className="stat-icon" style={{ color: '#3498db' }} />
                <div className="stat-info">
                  <span className="stat-label">Humidity</span>
                  <span className="stat-value">45%</span>
                </div>
              </div>
              <div className="stat-card">
                <FaWind className="stat-icon" style={{ color: '#2ecc71' }} />
                <div className="stat-info">
                  <span className="stat-label">Wind Speed</span>
                  <span className="stat-value">12 km/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What It Does Section */}
      <section id="what" className="section what-section">
        <div className="section-container">
          <h2 className="section-title">What the System Does</h2>
          <p className="section-subtitle">Pre-installation environmental data collection for solar site assessment</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaChartLine style={{ color: '#f39c12' }} />
              </div>
              <h3>Environmental Data Collection</h3>
              <p>Uses an IoT device to collect site-specific data including solar irradiance, ambient temperature, and weather conditions during pre-installation inspections.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaCalendarAlt style={{ color: '#e67e22' }} />
              </div>
              <h3>Temporary Site Deployment</h3>
              <p>Device is temporarily deployed only during the site inspection phase, prior to any solar panel installation, typically for 1-4 weeks.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaBook style={{ color: '#3498db' }} />
              </div>
              <h3>Data Reference for Planning</h3>
              <p>Provides organized reference data to support engineers and project teams in manual solar system design and layout planning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="section how-section">
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three-phase process from data collection to platform access</p>
          
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-icon">
                <FaMapMarkerAlt style={{ color: '#f39c12' }} />
              </div>
              <h3>Device Deployment</h3>
              <p>Temporary installation of IoT device at potential solar site for data collection period</p>
            </div>
            
            <div className="step-arrow">
              <FaArrowRight style={{ color: '#cccccc' }} />
            </div>
            
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-icon">
                <FaWifi style={{ color: '#3498db' }} />
              </div>
              <h3>Data Transmission</h3>
              <p>Collected environmental data transmitted to secure web-based platform</p>
            </div>
            
            <div className="step-arrow">
              <FaArrowRight style={{ color: '#cccccc' }} />
            </div>
            
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-icon">
                <FaServer style={{ color: '#2ecc71' }} />
              </div>
              <h3>Platform Access</h3>
              <p>Authorized users view, store, and review assessment data through dashboards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="section features-section">
        <div className="section-container">
          <h2 className="section-title">Key Features</h2>
          <p className="section-subtitle">Core functionality of the SOLARIS system</p>
          
          <div className="features-grid-4">
            <div className="feature-card-4">
              <div className="feature-icon-4">
                <FaChartBar style={{ color: '#f39c12' }} />
              </div>
              <h3>Data Dashboards</h3>
              <p>Visual presentation of collected environmental metrics with clear charts and historical data views.</p>
            </div>
            
            <div className="feature-card-4">
              <div className="feature-icon-4">
                <FaUsers style={{ color: '#3498db' }} />
              </div>
              <h3>Role-Based Access</h3>
              <p>Secure authentication system providing different access levels for engineers, project managers, and inspectors.</p>
            </div>
            
            <div className="feature-card-4">
              <div className="feature-icon-4">
                <FaDatabase style={{ color: '#2ecc71' }} />
              </div>
              <h3>Structured Data Storage</h3>
              <p>Organized database for all site assessment records with metadata, timestamps, and location data.</p>
            </div>
            
            <div className="feature-card-4">
              <div className="feature-icon-4">
                <FaCopy style={{ color: '#e67e22' }} />
              </div>
              <h3>Site Comparison Tools</h3>
              <p>Compare environmental data across multiple potential installation sites for better decision making.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Intended Users Section */}
      <section id="users" className="section users-section">
        <div className="section-container">
          <h2 className="section-title">Intended Users</h2>
          <p className="section-subtitle">Professional roles supported by the SOLARIS system</p>
          
          <div className="users-grid">
            <div className="user-card">
              <div className="user-icon">
                <FaUserTie style={{ color: '#f39c12' }} />
              </div>
              <h3>Solar Engineers</h3>
              <p>Use collected environmental data as reference for manual system design and component selection.</p>
            </div>
            
            <div className="user-card">
              <div className="user-icon">
                <FaProjectDiagram style={{ color: '#3498db' }} />
              </div>
              <h3>Project Teams</h3>
              <p>Review site assessment data during planning and feasibility stages of solar projects.</p>
            </div>
            
            <div className="user-card">
              <div className="user-icon">
                <FaHardHat style={{ color: '#e67e22' }} />
              </div>
              <h3>Site Inspectors</h3>
              <p>Deploy and manage IoT devices during on-site assessments and data collection periods.</p>
            </div>
          </div>
        </div>
      </section>

      {/* System Limitations Section */}
      <section id="limitations" className="section limitations-section">
        <div className="section-container">
          <h2 className="section-title">System Limitations</h2>
          <p className="section-subtitle">Clear scope boundaries of the SOLARIS system</p>
          
          <div className="limitations-list">
            <div className="limitation-card">
              <div className="limitation-icon">
                <FaBan style={{ color: '#e74c3c' }} />
              </div>
              <div>
                <h3>Not a Monitoring System</h3>
                <p>SOLARIS is not a real-time monitoring system for installed solar panels. It is used exclusively during pre-installation site assessment.</p>
              </div>
            </div>
            
            <div className="limitation-card">
              <div className="limitation-icon">
                <FaExclamationTriangle style={{ color: '#e67e22' }} />
              </div>
              <div>
                <h3>No Automated Analysis</h3>
                <p>The system does not perform automated analysis, optimization, forecasting, or decision-making. It provides raw and organized data for human review.</p>
              </div>
            </div>
            
            <div className="limitation-card">
              <div className="limitation-icon">
                <FaTimesCircle style={{ color: '#e74c3c' }} />
              </div>
              <div>
                <h3>No Design Recommendations</h3>
                <p>SOLARIS does not generate design recommendations, financial evaluations, or system layouts. It serves as a data reference tool for manual planning.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="solaris-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="logo-container">
                <div className="logo-icon">
                  <FaSolarPanel style={{ color: '#f39c12' }} />
                </div>
                <h3 className="logo-text">SOLARIS</h3>
              </div>
              <p className="footer-tagline">IoT-Based Solar Site Pre-Assessment System</p>
            </div>
            
            <div className="footer-info">
              <p>Academic Prototype System | Capstone Project</p>
              <p className="footer-note">Focus: IoT data collection and review for solar site assessment</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;