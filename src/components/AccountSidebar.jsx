import { useEffect, useRef } from 'react';
import {
  Settings, MapPin, Package, ShoppingBag, Heart, Star, 
  Headphones, RotateCcw, Ruler, Eye, MessageSquare, Shield, X
} from 'lucide-react';
import './AccountSidebar.css';

const ICON_MAP = {
  Settings, MapPin, Package, ShoppingBag, Heart, Star,
  Headphones, RotateCcw, Ruler, Eye, MessageSquare, Shield,
};

const AccountSidebar = ({ 
  menuItems, 
  activeTab, 
  onTabChange, 
  sidebarOpen, 
  onSidebarToggle 
}) => {
  const sidebarRef = useRef(null);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onSidebarToggle(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen, onSidebarToggle]);

  // Close sidebar on escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        onSidebarToggle(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [sidebarOpen, onSidebarToggle]);

  const handleItemClick = (itemId) => {
    onTabChange(itemId);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && <div className="account-sidebar-overlay" onClick={() => onSidebarToggle(false)} />}

      {/* Sidebar */}
      <div className={`account-sidebar ${sidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
        {/* Close button (mobile) */}
        <button 
          className="sidebar-close-btn"
          onClick={() => onSidebarToggle(false)}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="sidebar-header">
          <h3>Your Account</h3>
        </div>

        {/* Menu */}
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const IconComponent = ICON_MAP[item.icon];
            return (
              <li key={item.id} className="sidebar-menu-item">
                <button
                  className={`sidebar-menu-btn ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                  title={item.label}
                >
                  {IconComponent && <IconComponent size={18} />}
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default AccountSidebar;
