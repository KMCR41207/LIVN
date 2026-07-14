import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, ShoppingBag, Inbox, Package, Star } from 'lucide-react';
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
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { currentUser, logout } = useAuth();

  // Keep a plain `user` shape the rest of the component already uses
  const user = currentUser;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthSuccess = (u) => {
    // AuthProvider already stored the user; just close modal + redirect admins
    setShowAuth(false);
    if (u?.role === 'admin') navigate('/admin');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <div className={`navbar-wrapper ${isScrolled ? 'scrolled' : ''}`}>
        <nav className="temple-navbar">
          <div className="navbar-logo">
            <Link to="/">
              <div className="logo-text">Livaani</div>
            </Link>
          </div>

          <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/collections" className="nav-link">Collections</Link>
            <Link to="/bespoke" className="nav-link">Bespoke</Link>
          </div>

          <div className="navbar-icons">
            <button className="icon-btn" aria-label="Search" onClick={() => setShowSearch(s => !s)}>
              {showSearch ? <X size={22} /> : <Search size={22} />}
            </button>

            {/* My Orders — visible to logged-in non-admin users */}
            {user && user.role !== 'admin' && (
              <Link to="/track-order" className="icon-btn" aria-label="My Orders" title="My Orders">
                <Package size={22} />
              </Link>
            )}

            {/* Rewards — visible to logged-in non-admin users */}
            {user && user.role !== 'admin' && (
              <Link to="/rewards" className="icon-btn" aria-label="Rewards" title="My Rewards">
                <Star size={22} />
              </Link>
            )}

            {/* Admin Inbox button — only visible when admin is logged in */}
            {user?.role === 'admin' && (
              <Link to="/admin" className="icon-btn inbox-btn" aria-label="Admin Orders Inbox" title="Orders Inbox">
                <Inbox size={22} />
              </Link>
            )}

            {/* Cart icon with badge */}
            <Link to="/checkout" className="icon-btn cart-icon-btn" aria-label="Cart">
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </Link>

            {user ? (
              <button className="icon-btn" onClick={handleLogout} aria-label="Logout" title={`Logout (${user.email})`}>
                <LogOut size={22} />
              </button>
            ) : (
              <button className="icon-btn" onClick={() => setShowAuth(true)} aria-label="Account">
                <User size={22} />
              </button>
            )}

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
          {user
            ? <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>Logout</button>
            : <button onClick={() => { setShowAuth(true); setIsMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>Sign In</button>
          }
        </div>
      </div>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuthSuccess={handleAuthSuccess} />
      )}

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
