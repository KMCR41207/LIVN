import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from '../components/Auth/AuthModal';

/**
 * Auth page - Handles user authentication flows
 * Can be rendered as a page or modal overlay
 */
export const Auth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'phone', 'reset'

  const handleAuthSuccess = () => {
    // Navigate to home or dashboard after successful auth
    navigate('/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isAuthenticated) {
    return (
      <div className="auth-page authenticated">
        <div className="auth-container">
          <h1>You are logged in</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <AuthModal
        mode={authMode}
        onModeChange={setAuthMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};
