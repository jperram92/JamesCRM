import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
};

// Company services
export const companyService = {
  getAll: async () => {
    const response = await api.get('/companies');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },
  create: async (companyData) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },
  update: async (id, companyData) => {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },
};

// Contact services
export const contactService = {
  getAll: async () => {
    const response = await api.get('/contacts');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },
  create: async (contactData) => {
    const response = await api.post('/contacts', contactData);
    return response.data;
  },
  update: async (id, contactData) => {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },
};

// Deal services
export const dealService = {
  getAll: async () => {
    const response = await api.get('/deals');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/deals/${id}`);
    return response.data;
  },
  create: async (dealData) => {
    const response = await api.post('/deals', dealData);
    return response.data;
  },
  update: async (id, dealData) => {
    const response = await api.put(`/deals/${id}`, dealData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/deals/${id}`);
    return response.data;
  },
};

// Activity services
export const activityService = {
  getAll: async () => {
    const response = await api.get('/activities');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },
  create: async (activityData) => {
    const response = await api.post('/activities', activityData);
    return response.data;
  },
  update: async (id, activityData) => {
    const response = await api.put(`/activities/${id}`, activityData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },
  complete: async (id) => {
    const response = await api.post(`/activities/${id}/complete`);
    return response.data;
  },
};

export default api;
