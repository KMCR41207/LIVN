import React, { useState, useRef } from 'react';
import './Tabs.css';

const Tabs = ({ 
  children, 
  defaultTab = 0, 
  variant = 'default',
  size = 'medium',
  orientation = 'horizontal',
  className = '',
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const tabRefs = useRef([]);

  const handleTabClick = (index) => {
    setActiveTab(index);
    onTabChange?.(index);
  };

  const handleKeyDown = (e, index) => {
    let newIndex = activeTab;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = activeTab < children.length - 1 ? activeTab + 1 : 0;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = activeTab > 0 ? activeTab - 1 : children.length - 1;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = children.length - 1;
        break;
      default:
        return;
    }
    
    setActiveTab(newIndex);
    onTabChange?.(newIndex);
    tabRefs.current[newIndex]?.focus();
  };

  return (
    <div className={`tabs tabs-${variant} tabs-${size} tabs-${orientation} ${className}`}>
      <div className="tabs-list" role="tablist" aria-orientation={orientation}>
        {React.Children.map(children, (child, index) => (
          <button
            key={index}
            ref={el => tabRefs.current[index] = el}
            className={`tab-button ${activeTab === index ? 'active' : ''}`}
            onClick={() => handleTabClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tabpanel-${index}`}
            id={`tab-${index}`}
            tabIndex={activeTab === index ? 0 : -1}
          >
            {child.props.icon && (
              <span className="tab-icon">{child.props.icon}</span>
            )}
            <span className="tab-label">{child.props.label}</span>
            {child.props.badge && (
              <span className="tab-badge">{child.props.badge}</span>
            )}
          </button>
        ))}
      </div>
      
      <div className="tabs-content">
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className={`tab-panel ${activeTab === index ? 'active' : ''}`}
            role="tabpanel"
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            hidden={activeTab !== index}
          >
            {child.props.children}
          </div>
        ))}
      </div>
    </div>
  );
};

const TabPanel = ({ children, label, icon, badge }) => {
  return <>{children}</>;
};

Tabs.Panel = TabPanel;

export default Tabs;