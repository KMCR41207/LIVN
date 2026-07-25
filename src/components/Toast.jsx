import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './Toast.css';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  position = 'top-right',
  showIcon = true,
  showCloseButton = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const IconComponent = icons[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`toast toast-${type} toast-${position} ${isRemoving ? 'removing' : ''} ${className}`}>
      <div className="toast-content">
        {showIcon && IconComponent && (
          <div className="toast-icon">
            <IconComponent size={18} />
          </div>
        )}
        <div className="toast-message">{message}</div>
        {showCloseButton && (
          <button 
            className="toast-close"
            onClick={handleClose}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {duration > 0 && (
        <div 
          className="toast-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
};

export default Toast;