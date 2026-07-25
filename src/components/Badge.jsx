import React from 'react';
import './Badge.css';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'medium',
  shape = 'rounded',
  className = '',
  onClick,
  disabled = false,
  icon,
  ...props 
}) => {
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      className={`badge badge-${variant} badge-${size} badge-${shape} ${onClick ? 'badge-clickable' : ''} ${disabled ? 'badge-disabled' : ''} ${className}`}
      onClick={onClick && !disabled ? onClick : undefined}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </Component>
  );
};

export default Badge;