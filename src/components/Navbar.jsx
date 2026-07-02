import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, ShoppingBag } from 'lucide-react';
import { getCurrentUser, signOut } from '../lib/api';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Restore session from stored JWT
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      if (u.role === 'admin') navigate('/admin');
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  const handleAuthSuccess = (u) => {
    setUser(u);
    if (u.role === 'admin') navigate('/admin');
  };

  const handleLogout = () => {
    signOut();
    setUser(null);
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
            <button className="icon-btn" aria-label="Search">
              <Search size={22} />
            </button>

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
    </>
  );
};

export default Navbar;
