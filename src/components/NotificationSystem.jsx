import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './NotificationSystem.css';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification Component
const Notification = ({ notification, onRemove }) => {
  const { id, type, title, message, duration, action } = notification;
  
  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
  };

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onRemove(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-icon">
        {icons[type]}
      </div>
      <div className="notification-content">
        {title && <div className="notification-title">{title}</div>}
        <div className="notification-message">{message}</div>
        {action && (
          <div className="notification-actions">
            <button 
              className="notification-action-btn"
              onClick={() => {
                action.onClick();
                onRemove(id);
              }}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
      <button 
        className="notification-close"
        onClick={() => onRemove(id)}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Notification Provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = ({
    type = 'info',
    title,
    message,
    duration = 5000,
    action
  }) => {
    const id = Date.now() + Math.random();
    const notification = { id, type, title, message, duration, action };
    
    setNotifications(prev => [...prev, notification]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const showSuccess = (message, title = 'Success') => 
    addNotification({ type: 'success', title, message });
  
  const showError = (message, title = 'Error') => 
    addNotification({ type: 'error', title, message, duration: 8000 });
  
  const showWarning = (message, title = 'Warning') => 
    addNotification({ type: 'warning', title, message });
  
  const showInfo = (message, title = 'Info') => 
    addNotification({ type: 'info', title, message });

  return (
    <NotificationContext.Provider value={{
      addNotification,
      removeNotification,
      clearAll,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      
      {/* Notification Container */}
      <div className="notification-container">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;