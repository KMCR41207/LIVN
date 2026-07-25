import React from 'react';
import { Check, Circle } from 'lucide-react';
import './ProgressIndicator.css';

const ProgressIndicator = ({ 
  steps = [], 
  currentStep = 0, 
  orientation = 'horizontal',
  size = 'medium',
  showLabels = true,
  className = '' 
}) => {
  const sizes = {
    small: { circle: 24, icon: 12, line: 2 },
    medium: { circle: 32, icon: 16, line: 3 },
    large: { circle: 40, icon: 20, line: 4 }
  };

  const currentSize = sizes[size] || sizes.medium;

  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className={`progress-indicator ${orientation} ${size} ${className}`}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="progress-step-container">
            <div className={`progress-step ${status}`}>
              <div 
                className="step-circle"
                style={{
                  width: currentSize.circle,
                  height: currentSize.circle
                }}
              >
                {status === 'completed' ? (
                  <Check size={currentSize.icon} />
                ) : status === 'active' ? (
                  <div className="active-dot" />
                ) : (
                  <Circle size={currentSize.icon - 4} />
                )}
              </div>
              
              {showLabels && (
                <div className="step-label">
                  <div className="step-title">{step.title || `Step ${index + 1}`}</div>
                  {step.description && (
                    <div className="step-description">{step.description}</div>
                  )}
                </div>
              )}
            </div>

            {!isLast && (
              <div 
                className={`step-connector ${index < currentStep ? 'completed' : ''}`}
                style={{
                  [orientation === 'horizontal' ? 'height' : 'width']: currentSize.line
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressIndicator;