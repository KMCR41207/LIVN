import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from '../lib/api';
import './AuthModal.css';

const AuthModal = ({ onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        const { user } = await signUp(email, password);
        setMessage('Account created! You are now signed in.');
        onAuthSuccess(user);
        onClose();
      } else {
        try {
          const { user } = await signIn(email, password);
          onAuthSuccess(user);
          onClose();
        } catch (signInErr) {
          if (signInErr.message === 'Invalid credentials' || signInErr.message.includes('Invalid')) {
            try {
              const { user } = await signUp(email, password);
              onAuthSuccess(user);
              onClose();
            } catch {
              throw signInErr;
            }
          } else {
            throw signInErr;
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}><X size={20} /></button>

        <h2 className="auth-title">{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="auth-subtitle">
          {mode === 'signin' ? 'Sign in to your account' : 'Join the Livaani family'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />

          {/* Password field with eye toggle */}
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
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setMessage(''); }}>
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
