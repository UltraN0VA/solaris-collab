// assets/toastnotification.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaTimesCircle,
  FaTimes 
} from 'react-icons/fa';

// ============================================
// TOAST NOTIFICATION COMPONENT
// ============================================
const ToastNotification = ({ 
  show, 
  message, 
  type = 'success', 
  duration = 5000, 
  onClose,
  position = 'bottom-left'
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const getIcon = () => {
    switch(type) {
      case 'success':
        return <FaCheckCircle className="toast-icon" />;
      case 'error':
        return <FaTimesCircle className="toast-icon" />;
      case 'warning':
        return <FaExclamationTriangle className="toast-icon" />;
      case 'info':
        return <FaInfoCircle className="toast-icon" />;
      default:
        return <FaCheckCircle className="toast-icon" />;
    }
  };

  const getBackgroundClass = () => {
    switch(type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      case 'info':
        return 'toast-info';
      default:
        return 'toast-success';
    }
  };

  return (
    <div className={`toast-notification ${getBackgroundClass()} toast-${position}`}>
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>
        <FaTimes />
      </button>
    </div>
  );
};

// ============================================
// CUSTOM HOOK
// ============================================
const useToast = (initialState = { show: false, message: '', type: 'success', position: 'bottom-left' }) => {
  const [toast, setToast] = useState(initialState);

  const showToast = (message, type = 'success', duration = 5000, position = 'bottom-left') => {
    setToast({ show: true, message, type, duration, position });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success', duration: 5000, position: 'bottom-left' });
  };

  return {
    toast,
    showToast,
    hideToast,
    setToast
  };
};

// ============================================
// CSS STYLES
// ============================================
const toastStyles = `
.toast-notification {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 280px;
  max-width: 420px;
  animation: slideInLeft 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Position Variations */
.toast-notification.toast-bottom-right {
  left: auto;
  right: 2rem;
  animation: slideInRight 0.3s ease;
}

.toast-notification.toast-top-left {
  top: 2rem;
  bottom: auto;
  left: 2rem;
}

.toast-notification.toast-top-right {
  top: 2rem;
  bottom: auto;
  left: auto;
  right: 2rem;
  animation: slideInRight 0.3s ease;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.toast-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
  color: #ffffff;
}

.toast-message {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
  color: #ffffff;
}

.toast-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 4px;
}

.toast-close:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

/* Toast Types */
.toast-success {
  background: #2ecc71;
  border-left: 4px solid #27ae60;
}

.toast-error {
  background: #e74c3c;
  border-left: 4px solid #c0392b;
}

.toast-warning {
  background: #f39c12;
  border-left: 4px solid #e67e22;
}

.toast-info {
  background: #3498db;
  border-left: 4px solid #2980b9;
}

/* Animations */
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .toast-notification {
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    min-width: auto;
    max-width: none;
  }
  
  .toast-notification.toast-bottom-right {
    left: 1rem;
    right: 1rem;
  }
  
  .toast-notification.toast-top-left,
  .toast-notification.toast-top-right {
    top: 1rem;
    left: 1rem;
    right: 1rem;
  }
}

@media (max-width: 480px) {
  .toast-notification {
    padding: 0.75rem 1rem;
  }
  
  .toast-message {
    font-size: 0.75rem;
  }
  
  .toast-icon {
    font-size: 1rem;
  }
}
`;

// Inject CSS into head
if (typeof document !== 'undefined') {
  const styleId = 'toast-notification-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = toastStyles;
    document.head.appendChild(style);
  }
}

// ============================================
// EXPORTS
// ============================================
export { ToastNotification, useToast };
export default ToastNotification;