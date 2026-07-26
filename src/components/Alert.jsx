import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './Alert.css';

const Alert = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
  icon = true,
  actions
}) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const IconComponent = icons[variant];

  return (
    <div className={`alert alert-${variant} ${className}`} role="alert">
      <div className="alert-content">
        {icon && IconComponent && (
          <div className="alert-icon">
            <IconComponent size={20} />
          </div>
        )}
        <div className="alert-body">
          {title && <div className="alert-title">{title}</div>}
          <div className="alert-message">{children}</div>
          {actions && <div className="alert-actions">{actions}</div>}
        </div>
        {dismissible && (
          <button 
            className="alert-dismiss"
            onClick={onDismiss}
            aria-label="Dismiss alert"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;