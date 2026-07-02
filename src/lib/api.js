// Central API client — talks to the Express/MongoDB backend
// In dev: VITE_API_URL points to http://localhost:5000/api
// In production build served by Express: falls back to /api (same origin)
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Helpers ────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem('livn_token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ─── Auth ────────────────────────────────────────────────────────────────────

export const signUp = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Sign up failed');
  if (data.token) localStorage.setItem('livn_token', data.token);
  return data;
};

export const signIn = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Sign in failed');
  if (data.token) localStorage.setItem('livn_token', data.token);
  return data;
};

export const signOut = () => {
  localStorage.removeItem('livn_token');
};

// Returns the decoded user from the stored JWT, or null
export const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check expiry
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('livn_token');
      return null;
    }
    return payload; // { id, email, role }
  } catch {
    return null;
  }
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const createOrder = async (orderData) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const getMyOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders/my`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const getOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const updateOrderStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};
