import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Menu, X, User, LogOut, ShoppingBag,
  Inbox, Package, Star, RotateCcw, Headphones,
  Heart, ChevronRight, Settings, Shield, MapPin,
  ShoppingCart, MessageSquare, Eye, Ruler, ChevronDown,
  ChevronUp, Lock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import SearchBar from './SearchBar';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const [showOtherItems, setShowOtherItems] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowAccountPanel(false);
      }
    };
    if (showAccountPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAccountPanel]);

  // Close panel on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowAccountPanel(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setShowAccountPanel(false);
  };

  const handleLogout = async () => {
    setShowAccountPanel(false);
    await logout();
    navigate('/');
  };

  const handleUserIconClick = () => {
    if (isLoading) return;
    if (isAuthenticated) {
      // Logged in → show account panel
      setShowAccountPanel(prev => !prev);
    } else {
      // Not logged in → show login modal
      setShowAuth(true);
    }
  };

  const navTo = (path) => {
    setShowAccountPanel(false);
    setShowOtherItems(false);
    navigate(path);
  };

  const greeting = currentUser?.name
    ? `Hi, ${currentUser.name.split(' ')[0]}!`
    : currentUser?.email
    ? `Hi, ${currentUser.email.split('@')[0]}!`
    : 'My Account';

  return (
    <>
      <div className={`navbar-wrapper ${isScrolled ? 'scrolled' : ''}`}>
        <nav className="temple-navbar">
          {/* Logo */}
          <div className="navbar-logo">
            <Link to="/">
              <div className="logo-text">Livaani</div>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/collections" className="nav-link">Collections</Link>
            <Link to="/bespoke" className="nav-link">Bespoke</Link>
          </div>

          {/* Icons */}
          <div className="navbar-icons">
            {/* Search */}
            <button className="icon-btn" aria-label="Search" onClick={() => setShowSearch(s => !s)}>
              {showSearch ? <X size={22} /> : <Search size={22} />}
            </button>

            {/* Admin Inbox */}
            {isAuthenticated && currentUser?.role === 'admin' && (
              <Link to="/admin" className="icon-btn inbox-btn" aria-label="Admin Inbox" title="Orders Inbox">
                <Inbox size={22} />
              </Link>
            )}

            {/* Cart */}
            <Link to="/checkout" className="icon-btn cart-icon-btn" aria-label="Cart">
              <ShoppingBag size={22} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>

            {/* Account Icon — always visible */}
            <div className="account-icon-wrapper" ref={panelRef}>
              <button
                className={`icon-btn account-btn ${isAuthenticated ? 'logged-in' : ''}`}
                aria-label={isAuthenticated ? 'My Account' : 'Sign In'}
                title={isAuthenticated ? greeting : 'Sign In'}
                onClick={handleUserIconClick}
              >
                {isAuthenticated && currentUser?.profilePhoto ? (
                  <img
                    src={currentUser.profilePhoto}
                    alt="profile"
                    className="nav-profile-photo"
                  />
                ) : (
                  <User size={22} />
                )}
                {/* Green dot — shows as soon as user is logged in, regardless of loading */}
                {isAuthenticated && <span className="logged-in-dot" aria-hidden="true" />}
              </button>

              {/* ── ACCOUNT PANEL (shown when logged in) ── */}
              {showAccountPanel && isAuthenticated && (
                <div className="account-panel animate-fade-in-up">
                  {/* Header */}
                  <div className="account-panel-header">
                    <div className="account-panel-avatar">
                      {currentUser?.profilePhoto ? (
                        <img src={currentUser.profilePhoto} alt="" className="panel-avatar-img" />
                      ) : (
                        <div className="panel-avatar-placeholder">
                          <User size={28} />
                        </div>
                      )}
                    </div>
                    <div className="account-panel-info">
                      <p className="panel-name">{currentUser?.name || currentUser?.email?.split('@')[0]}</p>
                      <p className="panel-email">{currentUser?.email}</p>
                      {currentUser?.role === 'admin' && (
                        <span className="panel-admin-badge">
                          <Shield size={12} /> Admin
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="account-panel-menu">
                    {/* ── Primary items (always visible) ── */}
                    <button className="panel-item" onClick={() => navTo('/profile')}>
                      <User size={18} />
                      <span>My Profile</span>
                      <ChevronRight size={16} className="panel-arrow" />
                    </button>

                    <button className="panel-item" onClick={() => navTo('/account?tab=orders')}>
                      <Package size={18} />
                      <span>My Orders</span>
                      <ChevronRight size={16} className="panel-arrow" />
                    </button>

                    <button className="panel-item" onClick={() => navTo('/track-order')}>
                      <Star size={18} />
                      <span>Track Order</span>
                      <ChevronRight size={16} className="panel-arrow" />
                    </button>

                    <button className="panel-item" onClick={() => navTo('/account?tab=cart')}>
                      <ShoppingCart size={18} />
                      <span>Your Cart</span>
                      <ChevronRight size={16} className="panel-arrow" />
                    </button>

                    <button className="panel-item" onClick={() => navTo('/account?tab=returns')}>
                      <RotateCcw size={18} />
                      <span>Returns & Exchanges</span>
                      <ChevronRight size={16} className="panel-arrow" />
                    </button>

                    {/* ── Other (expandable) ── */}
                    <button
                      className="panel-item panel-item-other"
                      onClick={() => setShowOtherItems(prev => !prev)}
                    >
                      <ChevronDown size={18} className={`other-chevron ${showOtherItems ? 'rotated' : ''}`} />
                      <span>Other</span>
                      {showOtherItems ? <ChevronUp size={16} className="panel-arrow" /> : <ChevronDown size={16} className="panel-arrow" />}
                    </button>

                    {/* ── Expanded "Other" items ── */}
                    {showOtherItems && (
                      <div className="panel-other-items">
                        <button className="panel-item panel-item-sub" onClick={() => navTo('/account?tab=wishlist')}>
                          <Heart size={17} />
                          <span>Wishlist</span>
                          <ChevronRight size={15} className="panel-arrow" />
                        </button>

                        <button className="panel-item panel-item-sub" onClick={() => navTo('/rewards')}>
                          <Heart size={17} />
                          <span>Rewards & Loyalty</span>
                          <ChevronRight size={15} className="panel-arrow" />
                        </button>

                        <button className="panel-item panel-item-sub" onClick={() => navTo('/account?tab=addresses')}>
                          <MapPin size={17} />
                          <span>Manage Addresses</span>
                          <ChevronRight size={15} className="panel-arrow" />
                        </button>

                        <button className="panel-item panel-item-sub" onClick={() => navTo('/account?tab=measurements')}>
                          <Ruler size={17} />
                          <span>Saved Measurements</span>
                          <ChevronRight size={15} className="panel-arrow" />
                        </button>

                        <button className="panel-item panel-item-sub" onClick={() => navTo('/account?tab=recently-viewed')}>
                          <Eye size={17} />
                          <span>Recently Viewed</span>
                          <ChevronRight size={15} className="panel-arrow" />
                        </button>

                        <button className="panel-item panel-item-sub" onClick={() => navTo('/account?tab=reviews')}>
                          <MessageSquare size={17} />
                          <span>Your Reviews</span>
                          <ChevronRight size={15} className="panel-arrow" />
                        </button>

                        <button className="panel-item panel-item-sub" onClick={() => navTo('/account?tab=care')}>
                          <Headphones size={17} />
                          <span>Customer Care</span>
                          <ChevronRight size={15} className="panel-arrow" />
                        </button>

                        <button className="panel-item panel-item-sub" onClick={() => navTo('/account?tab=settings')}>
                          <Lock size={17} />
                          <span>Settings & Privacy</span>
                          <ChevronRight size={15} className="panel-arrow" />
                        </button>
                      </div>
                    )}

                    {currentUser?.role === 'admin' && (
                      <>
                        <div className="panel-divider" />
                        <button className="panel-item panel-item-admin" onClick={() => navTo('/admin')}>
                          <Settings size={18} />
                          <span>Admin Dashboard</span>
                          <ChevronRight size={16} className="panel-arrow" />
                        </button>
                        <button className="panel-item panel-item-admin" onClick={() => navTo('/admin/profile')}>
                          <Shield size={18} />
                          <span>Admin Profile</span>
                          <ChevronRight size={16} className="panel-arrow" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="account-panel-footer">
                    <button className="panel-logout-btn" onClick={handleLogout}>
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </nav>

        <div className="navbar-gopuram-base"></div>
        <div className="navbar-gopuram-base-2"></div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/collections" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
          <Link to="/bespoke" onClick={() => setIsMobileMenuOpen(false)}>Bespoke</Link>

          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
              <Link to="/account" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>
              <Link to="/track-order" onClick={() => setIsMobileMenuOpen(false)}>Track Order</Link>
              <Link to="/rewards" onClick={() => setIsMobileMenuOpen(false)}>Rewards</Link>
              <Link to="/whatsapp" onClick={() => setIsMobileMenuOpen(false)}>Customer Care</Link>
              {currentUser?.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
              )}
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="mobile-logout-btn"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => { setShowAuth(true); setIsMobileMenuOpen(false); }}
              className="mobile-signin-btn"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal — only when NOT logged in */}
      {showAuth && !isAuthenticated && (
        <AuthModal onClose={() => setShowAuth(false)} onAuthSuccess={handleAuthSuccess} />
      )}

      {/* Search Overlay */}
      {showSearch && (
        <div className="navbar-search-overlay">
          <div className="navbar-search-inner container">
            <SearchBar onClose={() => setShowSearch(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
