import { useState } from 'react';
import { X, Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import './AuthModal.css';

// ─── Google Icon ─────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.3 0 24 0 14.7 0 6.7 5.4 2.9 13.3l7.8 6C12.5 13 17.8 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.8 37.4 46.5 31.4 46.5 24.5z"/>
    <path fill="#FBBC05" d="M10.7 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8l8.2-6.1z"/>
    <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7.5-5.8c-2.1 1.4-4.8 2.2-8.5 2.2-6.2 0-11.5-4.2-13.4-9.9l-8.2 6.1C6.6 42.6 14.7 48 24 48z"/>
  </svg>
);

// ─── Facebook Icon ────────────────────────────────────────────────────────────
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/>
  </svg>
);

// ─── Main component ───────────────────────────────────────────────────────────
const AuthModal = ({ onClose, onAuthSuccess }) => {
  const [screen, setScreen] = useState('landing'); // 'landing' | 'email'
  const [emailMode, setEmailMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Pull ALL auth methods from context — so storeAuthState is always called
  const { login, signupEmail, loginWithGoogle, loginWithFacebook } = useAuth();

  const clearMessages = () => { setError(''); setMessage(''); };

  // ── Google — uses AuthContext so token is stored in localStorage ──────────
  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      clearMessages();
      try {
        await loginWithGoogle(tokenResponse.access_token);
        onAuthSuccess?.();
        onClose();
      } catch (err) {
        setError(err.message || 'Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google sign-in was cancelled or failed'),
    flow: 'implicit',
  });

  // ── Facebook — uses AuthContext so token is stored in localStorage ────────
  const handleFacebook = () => {
    if (!window.FB) {
      setError('Facebook SDK not loaded. Please refresh and try again.');
      return;
    }
    clearMessages();
    window.FB.login(
      async (response) => {
        if (response.authResponse) {
          setLoading(true);
          try {
            await loginWithFacebook(response.authResponse.accessToken);
            onAuthSuccess?.();
            onClose();
          } catch (err) {
            setError(err.message || 'Facebook login failed. Please try again.');
          } finally {
            setLoading(false);
          }
        }
      },
      { scope: 'email,public_profile' }
    );
  };

  // ── Email / Password ──────────────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();
    try {
      if (emailMode === 'signup') {
        await signupEmail(email, password);
      } else {
        await login(email, password);
      }
      onAuthSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal animate-fade-in-up" onClick={(e) => e.stopPropagation()}>

        <button className="auth-close" onClick={onClose} aria-label="Close"><X size={20} /></button>

        {screen !== 'landing' && (
          <button className="auth-back-btn" onClick={() => { setScreen('landing'); clearMessages(); }} aria-label="Back">
            <ArrowLeft size={18} />
          </button>
        )}

        {/* ── LANDING ── */}
        {screen === 'landing' && (
          <>
            <div className="auth-brand"><span className="auth-brand-name">Livaani</span></div>
            <h2 className="auth-title">Welcome</h2>
            <p className="auth-subtitle">Sign in or create your account</p>

            {error && <p className="auth-error">{error}</p>}

            <div className="auth-providers">
              <button
                className="auth-provider-btn auth-provider-google"
                onClick={handleGoogle}
                disabled={loading}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <button
                className="auth-provider-btn auth-provider-facebook"
                onClick={handleFacebook}
                disabled={loading}
              >
                <FacebookIcon />
                Continue with Facebook
              </button>
            </div>

            <div className="auth-divider">or</div>

            <div className="auth-alt-btns">
              <button
                className="auth-alt-btn"
                onClick={() => { setScreen('email'); clearMessages(); }}
                disabled={loading}
              >
                <Mail size={16} />
                Email &amp; Password
              </button>
            </div>
          </>
        )}

        {/* ── EMAIL ── */}
        {screen === 'email' && (
          <>
            <h2 className="auth-title">{emailMode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
            <p className="auth-subtitle">{emailMode === 'signin' ? 'Welcome back' : 'Join the Livaani family'}</p>

            <form onSubmit={handleEmailSubmit} className="auth-form">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                autoFocus
              />

              <div className="auth-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input auth-input-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && <p className="auth-error">{error}</p>}
              {message && <p className="auth-message">{message}</p>}

              <button type="submit" className="btn btn-primary full-width-btn" disabled={loading}>
                {loading ? 'Please wait…' : emailMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <p className="auth-toggle">
              {emailMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setEmailMode(m => m === 'signin' ? 'signup' : 'signin'); clearMessages(); }}>
                {emailMode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  );
};

export default AuthModal;
