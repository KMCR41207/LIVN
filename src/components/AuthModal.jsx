import { useState } from 'react';
import { X } from 'lucide-react';
import { signIn, signUp } from '../lib/api';
import './AuthModal.css';

const AuthModal = ({ onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        const { user } = await signIn(email, password);
        onAuthSuccess(user);
        onClose();
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
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
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
