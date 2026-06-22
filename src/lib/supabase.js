import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

// Initialize Supabase. If missing keys, it won't actually connect, 
// so we'll add a mock fallback in our data fetching logic for demonstrations.
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to handle orders (supports mock fallback)
export const createOrder = async (orderData) => {
  if (supabaseUrl === 'https://mock.supabase.co') {
    // Mock Mode (No Supabase keys provided)
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedOrders = JSON.parse(localStorage.getItem('livn_orders') || '[]');
        const newOrder = {
          id: Math.random().toString(36).substring(2, 9),
          created_at: new Date().toISOString(),
          status: 'New',
          ...orderData
        };
        localStorage.setItem('livn_orders', JSON.stringify([newOrder, ...storedOrders]));
        resolve({ data: newOrder, error: null });
      }, 1000);
    });
  } else {
    // Real Supabase
    return await supabase.from('orders').insert([
      { ...orderData, status: 'New' }
    ]).select();
  }
};

export const getOrders = async () => {
  if (supabaseUrl === 'https://mock.supabase.co') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedOrders = JSON.parse(localStorage.getItem('livn_orders') || '[]');
        resolve({ data: storedOrders, error: null });
      }, 500);
    });
  } else {
    return await supabase.from('orders').select('*').order('created_at', { ascending: false });
  }
};

export const updateOrderStatus = async (id, status) => {
  if (supabaseUrl === 'https://mock.supabase.co') {
    return new Promise((resolve) => {
      setTimeout(() => {
        let storedOrders = JSON.parse(localStorage.getItem('livn_orders') || '[]');
        storedOrders = storedOrders.map(o => o.id === id ? { ...o, status } : o);
        localStorage.setItem('livn_orders', JSON.stringify(storedOrders));
        resolve({ data: true, error: null });
      }, 500);
    });
  } else {
    return await supabase.from('orders').update({ status }).eq('id', id);
  }
};
