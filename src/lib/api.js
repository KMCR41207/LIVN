import axios from 'axios';

// Central API client — talks to the Express/MongoDB backend
// In dev: VITE_API_URL points to http://localhost:5000/api
// In production build served by Express: falls back to /api (same origin)
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Axios Instance ─────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('livn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ───────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('livn_refresh_token');
        if (!refreshToken) {
          // No refresh token available, clear storage and reject
          localStorage.removeItem('livn_token');
          localStorage.removeItem('livn_refresh_token');
          localStorage.removeItem('livn_auth_state');
          return Promise.reject(error);
        }

        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        if (response.data.token) {
          localStorage.setItem('livn_token', response.data.token);
          if (response.data.refreshToken) {
            localStorage.setItem('livn_refresh_token', response.data.refreshToken);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear auth state
        localStorage.removeItem('livn_token');
        localStorage.removeItem('livn_refresh_token');
        localStorage.removeItem('livn_auth_state');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

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
