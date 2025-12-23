import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    return api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  
  register: (userData: any) => {
    return api.post('/api/auth/register', userData);
  },
  
  getCurrentUser: () => {
    return api.get('/api/auth/me');
  },
  
  updateUser: (userData: any) => {
    return api.put('/api/auth/me', userData);
  },
  
  logout: () => {
    return api.post('/api/auth/logout');
  },
};

// Generations API
export const generationsApi = {
  createGeneration: (data: {
    prompt: string;
    template_id?: number;
    style?: string;
  }) => {
    return api.post('/api/generations', data);
  },
  
  getGenerations: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    return api.get('/api/generations', { params });
  },
  
  getGeneration: (id: number) => {
    return api.get(`/api/generations/${id}`);
  },
  
  downloadGeneration: (id: number) => {
    return api.get(`/api/generations/${id}/download`, {
      responseType: 'blob',
    });
  },
  
  shareGeneration: (id: number) => {
    return api.post(`/api/generations/${id}/share`);
  },
  
  deleteGeneration: (id: number) => {
    return api.delete(`/api/generations/${id}`);
  },
};

// WhatsApp API
export const whatsappApi = {
  connectNumber: (phoneNumber: string) => {
    return api.post('/api/whatsapp/connect', { phone_number: phoneNumber });
  },
  
  getNumbers: () => {
    return api.get('/api/whatsapp/numbers');
  },
  
  disconnectNumber: (id: number) => {
    return api.delete(`/api/whatsapp/numbers/${id}`);
  },
  
  sendTestMessage: (phoneNumber: string, message: string) => {
    return api.post('/api/whatsapp/test', {
      phone_number: phoneNumber,
      message: message,
    });
  },
};

// Templates API
export const templatesApi = {
  getTemplates: (category?: string) => {
    return api.get('/api/templates', { params: { category } });
  },
  
  getTemplate: (id: number) => {
    return api.get(`/api/templates/${id}`);
  },
  
  createTemplate: (data: any) => {
    return api.post('/api/templates', data);
  },
  
  updateTemplate: (id: number, data: any) => {
    return api.put(`/api/templates/${id}`, data);
  },
  
  deleteTemplate: (id: number) => {
    return api.delete(`/api/templates/${id}`);
  },
  
  setFavorite: (id: number, favorite: boolean) => {
    return api.put(`/api/templates/${id}/favorite`, { favorite });
  },
};

// Subscriptions API
export const subscriptionsApi = {
  getPlans: () => {
    return api.get('/api/subscriptions/plans');
  },
  
  getCurrentSubscription: () => {
    return api.get('/api/subscriptions/current');
  },
  
  createSubscription: (planId: string, paymentMethod: any) => {
    return api.post('/api/subscriptions', {
      plan_id: planId,
      payment_method: paymentMethod,
    });
  },
  
  cancelSubscription: () => {
    return api.post('/api/subscriptions/cancel');
  },
  
  updatePaymentMethod: (paymentMethod: any) => {
    return api.put('/api/subscriptions/payment-method', paymentMethod);
  },
  
  getInvoices: () => {
    return api.get('/api/subscriptions/invoices');
  },
};

// Stats API
export const statsApi = {
  getDashboardStats: () => {
    return api.get('/api/stats/dashboard');
  },
  
  getGenerationStats: (period: 'day' | 'week' | 'month' | 'year') => {
    return api.get(`/api/stats/generations?period=${period}`);
  },
  
  getEngagementStats: () => {
    return api.get('/api/stats/engagement');
  },
};

export default api;