import { useState, useEffect, useCallback, useRef } from 'react';
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
  const refreshingRef = useRef(false);

  // isAuthenticated: user exists (either from localStorage restore or fresh login)
  const isAuthenticated = !!currentUser;

  // ── Clear all auth state ────────────────────────────────────────────────
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

  // ── Token refresh ────────────────────────────────────────────────────────
  const refreshAccessToken = useCallback(async (storedRefresh) => {
    const rt = storedRefresh || refreshToken;
    if (!rt || refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) return; // Don't clear state if backend is temporarily down
      const data = await res.json();
      if (data?.token) {
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        setAccessToken(data.token);
        setTokenExpiry(payload.exp * 1000);
        localStorage.setItem(TOKEN_KEY, data.token);
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        }
      }
    } catch {
      // Backend down — keep user logged in from localStorage
    } finally {
      refreshingRef.current = false;
    }
  }, [refreshToken]);

  // ── Restore session on app load ──────────────────────────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const storedState = localStorage.getItem(STORAGE_KEY);

        if (storedState) {
          // Always restore the user from localStorage first
          // This ensures the user is "logged in" immediately on page load
          try {
            const user = JSON.parse(storedState);
            setCurrentUser(user);

            if (storedToken) {
              try {
                const payload = JSON.parse(atob(storedToken.split('.')[1]));
                const isTokenValid = payload.exp * 1000 > Date.now();

                if (isTokenValid) {
                  // Token still valid - restore everything
                  setAccessToken(storedToken);
                  setRefreshToken(storedRefreshToken);
                  setTokenExpiry(payload.exp * 1000);
                } else if (storedRefreshToken) {
                  // Token expired - try to silently refresh in background
                  setRefreshToken(storedRefreshToken);
                  refreshAccessToken(storedRefreshToken);
                }
              } catch {
                // Bad token format - still keep user logged in
                setAccessToken(storedToken);
              }
            }
          } catch {
            // Bad stored user JSON - clear everything
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [refreshAccessToken]);

  // ── Auto-refresh token before expiry ────────────────────────────────────
  useEffect(() => {
    if (!tokenExpiry || !refreshToken) return;
    const refreshInterval = setInterval(() => {
      const timeUntilExpiry = tokenExpiry - Date.now();
      if (timeUntilExpiry < 120000 && timeUntilExpiry > 0) {
        refreshAccessToken();
      }
    }, 30000);
    return () => clearInterval(refreshInterval);
  }, [tokenExpiry, refreshToken, refreshAccessToken]);

  // ── Store auth state after login ─────────────────────────────────────────
  const storeAuthState = useCallback((user, token, refresh, expiryTime) => {
    setCurrentUser(user);
    setAccessToken(token);
    setRefreshToken(refresh);
    setTokenExpiry(expiryTime);
    localStorage.setItem(TOKEN_KEY, token);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, []);

  // ── Safe JSON fetch helper ───────────────────────────────────────────────
  const safeFetch = async (url, options) => {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Server error (${res.status}). Please ensure backend is running.`);
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || data?.message || `Server error: ${res.status}`);
    return data;
  };

  // ── Email/password login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await safeFetch(`${API}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!data.token) throw new Error('No token received. Please try again.');
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      storeAuthState(data.user || { email }, data.token, data.refreshToken, payload.exp * 1000);
      return data;
    } catch (err) {
      setError({ message: err.message, code: 'LOGIN_ERROR' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeAuthState]);

  // ── Email/password signup ────────────────────────────────────────────────
  const signupEmail = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await safeFetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!data.token) throw new Error('No token received. Please try again.');
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      storeAuthState(data.user || { email }, data.token, data.refreshToken, payload.exp * 1000);
      return data;
    } catch (err) {
      setError({ message: err.message, code: 'SIGNUP_ERROR' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeAuthState]);

  // ── Google OAuth ─────────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async (googleAccessToken) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await safeFetch(`${API}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: googleAccessToken }),
      });
      if (!data.token) throw new Error('No token received. Please try again.');
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      storeAuthState(data.user, data.token, data.refreshToken, payload.exp * 1000);
      return data;
    } catch (err) {
      setError({ message: err.message, code: 'GOOGLE_LOGIN_ERROR' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeAuthState]);

  // ── Facebook OAuth ───────────────────────────────────────────────────────
  const loginWithFacebook = useCallback(async (fbAccessToken) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await safeFetch(`${API}/auth/facebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: fbAccessToken }),
      });
      if (!data.token) throw new Error('No token received. Please try again.');
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      storeAuthState(data.user, data.token, data.refreshToken, payload.exp * 1000);
      return data;
    } catch (err) {
      setError({ message: err.message, code: 'FACEBOOK_LOGIN_ERROR' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeAuthState]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await fetch(`${API}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }).catch(() => {}); // Silent fail
      }
    } finally {
      clearAuthState();
      // Clear ALL sensitive storage
      try {
        localStorage.removeItem('livn_cart_local');
        localStorage.removeItem('livn_wa_prefs');
        sessionStorage.clear();
      } catch {}
    }
  }, [accessToken, clearAuthState]);

  // ── Complete profile ─────────────────────────────────────────────────────
  const completeProfile = useCallback(async (profileData) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!accessToken) throw new Error('User not authenticated');
      const data = await safeFetch(`${API}/auth/profile/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profileData),
      });
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
    completeProfile,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
