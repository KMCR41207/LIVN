import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import '../AuthModal.css';

/**
 * AuthModal Component - Unified authentication modal with multiple auth modes
 * Modes: login, signup, phone, reset
 */
export const AuthModal = ({ mode = 'login', onModeChange, onSuccess, onClose }) => {
  const { login, signupEmail, loginWithPhone, verifyOTP, resetPassword, isLoading, error } = useAuth();

  const [currentMode, setCurrentMode] = useState(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('US');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
    onModeChange?.(newMode);
    setLocalError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPhoneNumber('');
    setOtp('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setLocalError(err.message || 'Login failed');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      await signupEmail(email, password);
      onSuccess?.();
    } catch (err) {
      setLocalError(err.message || 'Sign up failed');
    }
  };

  const handlePhoneInitiate = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!phoneNumber) {
      setLocalError('Phone number is required');
      return;
    }

    try {
      await loginWithPhone(phoneNumber, country);
      setLocalError('');
      // Move to OTP verification step
      handleModeChange('otp');
    } catch (err) {
      setLocalError(err.message || 'Failed to send OTP');
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!otp || otp.length !== 6) {
      setLocalError('OTP must be 6 digits');
      return;
    }

    try {
      await verifyOTP(phoneNumber, otp);
      onSuccess?.();
    } catch (err) {
      setLocalError(err.message || 'OTP verification failed');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      await resetPassword(email);
      setLocalError('');
      handleModeChange('login');
    } catch (err) {
      setLocalError(err.message || 'Password reset failed');
    }
  };

  const displayError = localError || error?.message;

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button className="auth-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        )}

        {/* Login Mode */}
        {currentMode === 'login' && (
          <>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your account</p>

            <form onSubmit={handleLogin} className="auth-form">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
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
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {displayError && <p className="auth-error">{displayError}</p>}

              <button type="submit" className="btn btn-primary full-width-btn" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider">or</div>

            <div className="auth-options">
              <button
                type="button"
                className="auth-option-btn"
                onClick={() => handleModeChange('phone')}
              >
                Sign in with Phone
              </button>
            </div>

            <p className="auth-toggle">
              Don't have an account?{' '}
              <button onClick={() => handleModeChange('signup')}>Sign Up</button>
            </p>

            <p className="auth-toggle">
              Forgot password?{' '}
              <button onClick={() => handleModeChange('reset')}>Reset</button>
            </p>
          </>
        )}

        {/* Signup Mode */}
        {currentMode === 'signup' && (
          <>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join our community</p>

            <form onSubmit={handleSignup} className="auth-form">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
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
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="auth-input"
              />

              {displayError && <p className="auth-error">{displayError}</p>}

              <button type="submit" className="btn btn-primary full-width-btn" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className="auth-toggle">
              Already have an account?{' '}
              <button onClick={() => handleModeChange('login')}>Sign In</button>
            </p>
          </>
        )}

        {/* Phone Mode */}
        {currentMode === 'phone' && (
          <>
            <h2 className="auth-title">Sign in with Phone</h2>
            <p className="auth-subtitle">Enter your phone number</p>

            <form onSubmit={handlePhoneInitiate} className="auth-form">
              <div className="auth-phone-group">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="auth-input auth-country-select"
                >
                  <option value="US">🇺🇸 United States</option>
                  <option value="GB">🇬🇧 United Kingdom</option>
                  <option value="IN">🇮🇳 India</option>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="AU">🇦🇺 Australia</option>
                </select>

                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  required
                  className="auth-input"
                />
              </div>

              {displayError && <p className="auth-error">{displayError}</p>}

              <button type="submit" className="btn btn-primary full-width-btn" disabled={isLoading}>
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            <p className="auth-toggle">
              <button onClick={() => handleModeChange('login')}>Back to Email</button>
            </p>
          </>
        )}

        {/* OTP Verification Mode */}
        {currentMode === 'otp' && (
          <>
            <h2 className="auth-title">Verify OTP</h2>
            <p className="auth-subtitle">Enter the 6-digit code sent to {phoneNumber}</p>

            <form onSubmit={handleOtpVerify} className="auth-form">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                required
                className="auth-input auth-otp-input"
                inputMode="numeric"
              />

              {displayError && <p className="auth-error">{displayError}</p>}

              <button type="submit" className="btn btn-primary full-width-btn" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <p className="auth-toggle">
              <button onClick={() => handleModeChange('phone')}>Use different number</button>
            </p>
          </>
        )}

        {/* Password Reset Mode */}
        {currentMode === 'reset' && (
          <>
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">Enter your email to receive reset instructions</p>

            <form onSubmit={handlePasswordReset} className="auth-form">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />

              {displayError && <p className="auth-error">{displayError}</p>}

              <button type="submit" className="btn btn-primary full-width-btn" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="auth-toggle">
              <button onClick={() => handleModeChange('login')}>Back to Sign In</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
