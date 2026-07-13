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

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = async (category = '') => {
  const url = category
    ? `${BASE_URL}/products?category=${encodeURIComponent(category)}`
    : `${BASE_URL}/products`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const searchProducts = async (q) => {
  const res = await fetch(`${BASE_URL}/products/search?q=${encodeURIComponent(q)}`);
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const createProduct = async (productData) => {
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(productData),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const updateProduct = async (id, productData) => {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(productData),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const getCoupons = async () => {
  const res = await fetch(`${BASE_URL}/coupons`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const createCoupon = async (data) => {
  const res = await fetch(`${BASE_URL}/coupons`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const updateCoupon = async (id, data) => {
  const res = await fetch(`${BASE_URL}/coupons/${id}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const deleteCoupon = async (id) => {
  const res = await fetch(`${BASE_URL}/coupons/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const validateCoupon = async (code, orderAmount) => {
  const res = await fetch(`${BASE_URL}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, orderAmount }),
  });
  const json = await res.json();
  return { data: json.data, error: json.error };
};

// ─── Discounts ────────────────────────────────────────────────────────────────

export const getDiscounts = async () => {
  const res = await fetch(`${BASE_URL}/discounts`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const createDiscount = async (data) => {
  const res = await fetch(`${BASE_URL}/discounts`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const updateDiscount = async (id, data) => {
  const res = await fetch(`${BASE_URL}/discounts/${id}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const deleteDiscount = async (id) => {
  const res = await fetch(`${BASE_URL}/discounts/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export const getFaqs = async () => {
  const res = await fetch(`${BASE_URL}/faqs`);
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const createFaq = async (data) => {
  const res = await fetch(`${BASE_URL}/faqs`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const updateFaq = async (id, data) => {
  const res = await fetch(`${BASE_URL}/faqs/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const deleteFaq = async (id) => {
  const res = await fetch(`${BASE_URL}/faqs/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

// ─── Testimonials ────────────────────────────────────────────────────────────

export const getTestimonials = async () => {
  const res = await fetch(`${BASE_URL}/testimonials`);
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const createTestimonial = async (data) => {
  const res = await fetch(`${BASE_URL}/testimonials`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const updateTestimonial = async (id, data) => {
  const res = await fetch(`${BASE_URL}/testimonials/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

export const deleteTestimonial = async (id) => {
  const res = await fetch(`${BASE_URL}/testimonials/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getAnalyticsDashboard = async () => {
  const res = await fetch(`${BASE_URL}/analytics/dashboard`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error };
  return { data: json.data, error: null };
};
