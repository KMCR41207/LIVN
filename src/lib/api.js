import axios from 'axios';

// Central API client — talks to the Express/MongoDB backend
// In dev: VITE_API_URL points to http://localhost:5000/api
// In production build served by Express: falls back to /api (same origin)
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Safe Fetch Wrapper ────────────────────────────────────────────────────
// Handles JSON parsing errors and backend failures gracefully
const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers?.get?.('content-type') || '';
    
    let json;
    try {
      if (contentType.includes('application/json')) {
        json = await res.json();
      } else if (contentType.includes('text/html')) {
        console.error('Backend returned HTML (error page) for', url);
        return { data: null, error: 'Backend server error. Please ensure the backend server is running.' };
      } else {
        const text = await res.text();
        if (!text.trim()) {
          return { data: null, error: 'Backend returned empty response.' };
        }
        json = JSON.parse(text);
      }
    } catch (parseErr) {
      console.error('JSON parse error for', url, ':', parseErr);
      return { data: null, error: 'Backend returned invalid data. Please restart the server and try again.' };
    }
    
    if (!res.ok) {
      return { data: null, error: json?.error || `Server error: ${res.status}` };
    }
    
    return { data: json?.data, error: null };
  } catch (err) {
    console.error('Fetch error for', url, ':', err);
    return { data: null, error: 'Unable to connect to backend server. Make sure it\'s running.' };
  }
};

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
  try {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        throw new Error(data.error || `Sign up failed with status ${res.status}`);
      } else {
        throw new Error(`Sign up failed with status ${res.status}`);
      }
    }
    
    const data = await res.json();
    if (data.token) localStorage.setItem('livn_token', data.token);
    if (data.refreshToken) localStorage.setItem('livn_refresh_token', data.refreshToken);
    return data;
  } catch (err) {
    throw err;
  }
};

export const signIn = async (email, password) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        throw new Error(data.error || `Sign in failed with status ${res.status}`);
      } else {
        throw new Error(`Sign in failed with status ${res.status}`);
      }
    }
    
    const data = await res.json();
    if (data.token) localStorage.setItem('livn_token', data.token);
    if (data.refreshToken) localStorage.setItem('livn_refresh_token', data.refreshToken);
    return data;
  } catch (err) {
    throw err;
  }
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
  return safeFetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
};

export const getMyOrders = async () => {
  return safeFetch(`${BASE_URL}/orders/my`, { headers: authHeaders() });
};

export const getOrders = async () => {
  return safeFetch(`${BASE_URL}/orders`, { headers: authHeaders() });
};

export const updateOrderStatus = async (id, status) => {
  return safeFetch(`${BASE_URL}/orders/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
};

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = async (category = '') => {
  const url = category
    ? `${BASE_URL}/products?category=${encodeURIComponent(category)}`
    : `${BASE_URL}/products`;
  return safeFetch(url);
};

export const searchProducts = async (q) => {
  return safeFetch(`${BASE_URL}/products/search?q=${encodeURIComponent(q)}`);
};

export const createProduct = async (productData) => {
  return safeFetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(productData),
  });
};

export const updateProduct = async (id, productData) => {
  return safeFetch(`${BASE_URL}/products/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(productData),
  });
};

export const deleteProduct = async (id) => {
  return safeFetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
};

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const getCoupons = async () => {
  return safeFetch(`${BASE_URL}/coupons`, { headers: authHeaders() });
};

export const createCoupon = async (data) => {
  return safeFetch(`${BASE_URL}/coupons`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const updateCoupon = async (id, data) => {
  return safeFetch(`${BASE_URL}/coupons/${id}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const deleteCoupon = async (id) => {
  return safeFetch(`${BASE_URL}/coupons/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
};

export const validateCoupon = async (code, orderAmount) => {
  return safeFetch(`${BASE_URL}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, orderAmount }),
  });
};

// ─── Discounts ────────────────────────────────────────────────────────────────

export const getDiscounts = async () => {
  return safeFetch(`${BASE_URL}/discounts`, { headers: authHeaders() });
};

export const createDiscount = async (data) => {
  return safeFetch(`${BASE_URL}/discounts`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const updateDiscount = async (id, data) => {
  return safeFetch(`${BASE_URL}/discounts/${id}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const deleteDiscount = async (id) => {
  return safeFetch(`${BASE_URL}/discounts/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
};

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export const getFaqs = async () => {
  return safeFetch(`${BASE_URL}/faqs`);
};

export const createFaq = async (data) => {
  return safeFetch(`${BASE_URL}/faqs`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const updateFaq = async (id, data) => {
  return safeFetch(`${BASE_URL}/faqs/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const deleteFaq = async (id) => {
  return safeFetch(`${BASE_URL}/faqs/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
};

// ─── Testimonials ────────────────────────────────────────────────────────────

export const getTestimonials = async () => {
  return safeFetch(`${BASE_URL}/testimonials`);
};

export const createTestimonial = async (data) => {
  return safeFetch(`${BASE_URL}/testimonials`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const updateTestimonial = async (id, data) => {
  return safeFetch(`${BASE_URL}/testimonials/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const deleteTestimonial = async (id) => {
  return safeFetch(`${BASE_URL}/testimonials/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getAnalyticsDashboard = async () => {
  return safeFetch(`${BASE_URL}/analytics/dashboard`, { headers: authHeaders() });
};

// ─── Inventory ────────────────────────────────────────────────────────────────

export const getInventory = async () => {
  return safeFetch(`${BASE_URL}/inventory`, { headers: authHeaders() });
};

export const getInventorySummary = async () => {
  return safeFetch(`${BASE_URL}/inventory/summary`, { headers: authHeaders() });
};

export const updateStock = async (productId, action, quantity, note = '') => {
  return safeFetch(`${BASE_URL}/inventory/${productId}/stock`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ action, quantity, note }),
  });
};

export const getStockHistory = async (productId) => {
  return safeFetch(`${BASE_URL}/inventory/${productId}/history`, { headers: authHeaders() });
};

export const getLowStockProducts = async () => {
  return safeFetch(`${BASE_URL}/inventory/low-stock`, { headers: authHeaders() });
};

export const getOutOfStockProducts = async () => {
  return safeFetch(`${BASE_URL}/inventory/out-of-stock`, { headers: authHeaders() });
};

// ─── Business Module ──────────────────────────────────────────────────────────

// --- Invoices ---
export const getInvoices = async () => {
  return safeFetch(`${BASE_URL}/invoices`, { headers: authHeaders() });
};

export const getInvoiceByOrder = async (orderId) => {
  return safeFetch(`${BASE_URL}/invoices/order/${orderId}`, { headers: authHeaders() });
};

export const generateInvoice = async (orderId) => {
  return safeFetch(`${BASE_URL}/invoices/generate/${orderId}`, {
    method: 'POST', headers: authHeaders(),
  });
};

export const regenerateInvoice = async (invoiceId) => {
  return safeFetch(`${BASE_URL}/invoices/${invoiceId}/regenerate`, {
    method: 'POST', headers: authHeaders(),
  });
};

export const updateInvoice = async (id, data) => {
  return safeFetch(`${BASE_URL}/invoices/${id}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
  });
};

// --- Returns ---
export const getReturns = async () => {
  return safeFetch(`${BASE_URL}/returns`, { headers: authHeaders() });
};

export const createReturn = async (data) => {
  return safeFetch(`${BASE_URL}/returns`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const updateReturn = async (id, data) => {
  return safeFetch(`${BASE_URL}/returns/${id}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const deleteReturn = async (id) => {
  return safeFetch(`${BASE_URL}/returns/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
};

// --- Exchanges ---
export const getExchanges = async () => {
  return safeFetch(`${BASE_URL}/exchanges`, { headers: authHeaders() });
};

export const createExchange = async (data) => {
  return safeFetch(`${BASE_URL}/exchanges`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const updateExchange = async (id, data) => {
  return safeFetch(`${BASE_URL}/exchanges/${id}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const deleteExchange = async (id) => {
  return safeFetch(`${BASE_URL}/exchanges/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
};

// --- Cancellations ---
export const getCancellations = async () => {
  return safeFetch(`${BASE_URL}/cancellations`, { headers: authHeaders() });
};

export const createCancellation = async (data) => {
  return safeFetch(`${BASE_URL}/cancellations`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const updateCancellation = async (id, data) => {
  return safeFetch(`${BASE_URL}/cancellations/${id}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const deleteCancellation = async (id) => {
  return safeFetch(`${BASE_URL}/cancellations/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
};

// --- Purchase Orders ---
export const getPurchaseOrders = async () => {
  return safeFetch(`${BASE_URL}/purchase-orders`, { headers: authHeaders() });
};

export const createPurchaseOrder = async (data) => {
  return safeFetch(`${BASE_URL}/purchase-orders`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const updatePurchaseOrder = async (id, data) => {
  return safeFetch(`${BASE_URL}/purchase-orders/${id}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
  });
};

export const deletePurchaseOrder = async (id) => {
  return safeFetch(`${BASE_URL}/purchase-orders/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
};

export const receivePurchaseOrder = async (id, data) => {
  return safeFetch(`${BASE_URL}/purchase-orders/${id}/receive`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  });
};

// --- Business KPIs ---
export const getBusinessKPIs = async () => {
  return safeFetch(`${BASE_URL}/business/kpis`, { headers: authHeaders() });
};
