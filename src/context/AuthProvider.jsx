import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';

const STORAGE_KEY = 'livn_auth_state';
const TOKEN_KEY = 'livn_token';
const REFRESH_TOKEN_KEY = 'livn_refresh_token';
const API = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);

  const isAuthenticated = !!currentUser && !!accessToken;

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedState = localStorage.getItem(STORAGE_KEY);

      if (storedToken && storedState) {
        try {
          const user = JSON.parse(storedState);
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          if (payload.exp * 1000 > Date.now()) {
            setAccessToken(storedToken);
            setRefreshToken(localStorage.getItem(REFRESH_TOKEN_KEY));
            setCurrentUser(user);
            setTokenExpiry(payload.exp * 1000);
          } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const storeAuthState = useCallback((user, token, refresh, expiryTime) => {
    setCurrentUser(user);
    setAccessToken(token);
    setRefreshToken(refresh);
    setTokenExpiry(expiryTime);
    localStorage.setItem(TOKEN_KEY, token);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, []);

  const clearAuthState = useCallback(() => {
    setCurrentUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setTokenExpiry(null);
    setError(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Email/password login
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr);
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }
      
      if (!res.ok) throw new Error(data?.error || data?.message || 'Login failed');

      if (!data.token) throw new Error('No token in response');

      const payload = JSON.parse(atob(data.token.split('.')[1]));
      storeAuthState(data.user || { email }, data.token, data.refreshToken, payload.exp * 1000);
    } catch (err) {
      setError({ message: err.message, code: 'LOGIN_ERROR' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeAuthState]);

  // Email/password signup
  const signupEmail = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr);
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }
      
      if (!res.ok) throw new Error(data?.error || data?.message || 'Sign up failed');

      if (!data.token) throw new Error('No token in response');

      const payload = JSON.parse(atob(data.token.split('.')[1]));
      storeAuthState(data.user || { email }, data.token, data.refreshToken, payload.exp * 1000);
    } catch (err) {
      setError({ message: err.message, code: 'SIGNUP_ERROR' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeAuthState]);

  // Google OAuth
  const loginWithGoogle = useCallback(async (accessTokenOrIdToken) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: accessTokenOrIdToken }),
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr);
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }
      
      if (!res.ok) throw new Error(data?.error || data?.message || 'Google login failed');

      if (!data.token) throw new Error('No token in response');

      const payload = JSON.parse(atob(data.token.split('.')[1]));
      storeAuthState(data.user, data.token, data.refreshToken, payload.exp * 1000);
    } catch (err) {
      setError({ message: err.message, code: 'GOOGLE_LOGIN_ERROR' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeAuthState]);

  // Facebook OAuth
  const loginWithFacebook = useCallback(async (fbAccessToken) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/facebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: fbAccessToken }),
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr);
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }
      
      if (!res.ok) throw new Error(data?.error || data?.message || 'Facebook login failed');

      if (!data.token) throw new Error('No token in response');

      const payload = JSON.parse(atob(data.token.split('.')[1]));
      storeAuthState(data.user, data.token, data.refreshToken, payload.exp * 1000);
    } catch (err) {
      setError({ message: err.message, code: 'FACEBOOK_LOGIN_ERROR' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeAuthState]);

  // Logout
  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await fetch(`${API}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } catch {
      // silent
    } finally {
      clearAuthState();
    }
  }, [accessToken, clearAuthState]);

  // Token refresh
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) { clearAuthState(); return; }
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (!res.ok) { clearAuthState(); return; }

      const payload = JSON.parse(atob(data.token.split('.')[1]));
      setAccessToken(data.token);
      setTokenExpiry(payload.exp * 1000);
      localStorage.setItem(TOKEN_KEY, data.token);
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      }
    } catch {
      clearAuthState();
    }
  }, [refreshToken, clearAuthState]);

  // Password reset
  const resetPassword = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed');
    } catch (err) {
      setError({ message: err.message, code: 'PASSWORD_RESET_ERROR' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Complete profile
  const completeProfile = useCallback(async (profileData) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!accessToken) throw new Error('User not authenticated');
      const res = await fetch(`${API}/auth/profile/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Profile completion failed');

      const updatedUser = { ...currentUser, ...data.user };
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (err) {
      setError({ message: err.message, code: 'PROFILE_COMPLETION_ERROR' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, currentUser]);

  const contextValue = {
    currentUser,
    isLoading,
    error,
    isAuthenticated,
    accessToken,
    refreshToken,
    tokenExpiry,
    login,
    signupEmail,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    refreshAccessToken,
    resetPassword,
    completeProfile,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
