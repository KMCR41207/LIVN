import { Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './AccountHeader.css';

const AccountHeader = ({ user, activeMenuItem, onSidebarToggle }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="account-header">
      <div className="account-header-left">
        <button 
          className="account-menu-toggle-btn"
          onClick={() => onSidebarToggle(true)}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1>{activeMenuItem?.label || 'Your Account'}</h1>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="account-header-right">
        <button 
          className="account-header-btn"
          onClick={() => navigate('/account?tab=settings')}
        >
          Edit Profile
        </button>
        <button 
          className="account-header-btn primary"
          onClick={handleLogout}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default AccountHeader;
