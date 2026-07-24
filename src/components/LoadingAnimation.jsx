import React from 'react';
import './LoadingAnimation.css';

const LoadingAnimation = ({ 
  type = 'bars', 
  size = 'medium',
  text = '',
  className = '' 
}) => {
  if (type === 'bars') {
    return (
      <div className={`loading-animation ${className}`}>
        <div className="loading">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }

  if (type === 'words') {
    return (
      <div className={`loading-animation ${className}`}>
        <div className="card">
          <div className="loader">
            <p>loading</p>
            <div className="words">
              <span className="word">kurtis</span>
              <span className="word">sets</span>
              <span className="word">fabrics</span>
              <span className="word">styles</span>
              <span className="word">kurtis</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`loading-animation ${className}`}>
      <div className="spinner"></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingAnimation;