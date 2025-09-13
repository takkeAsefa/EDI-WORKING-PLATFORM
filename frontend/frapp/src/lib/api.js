import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // body:FormData
});
// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/update/', data),
};

// User Management API
export const userAPI = {
  getStaff: () => api.get('/auth/staff/', ),
  getTrainers: () => api.get('/auth/trainers/', ),
  getRworkers: () => api.get('/auth/rworkers/', ),
  getTrainees: () => api.get('/auth/trainees/', ), // Pass params here
  createUser: (data) => api.post('auth/register/', data),
  createInnovator: (data) => api.post('/auth/innovators/', data),
  getInnovators:() =>api.get(`/auth/innovators/`),
  getInnovatorsdetails:(id) =>api.get(`/auth/innovators/${id}`),
  // updateTrainee: (id, data) => api.put(`/auth/trainees/${id}`, data),
  // deleteTrainee: (id) => api.delete(`/auth/trainees/${id}`),
};

// Department API
export const departmentAPI = {
  getDepartments: () => api.get('auth/departments'),
  createDepartment: (data) => api.post('auth/departments', data),
  updateDepartment: (id, data) => api.put(`auth/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`auth/departments/${id}`),
};

// Training API
export const trainingAPI = {
  getTrainingTypes: () => api.get('/training/types'),
  createTrainingType: (data) => api.post('/training/types', data),
  updateTrainingType: (id, data) => api.put(`/training/types/${id}`, data),
  deleteTrainingType: (id) => api.delete(`/training/types/${id}`),
  
  getTrainingSessions: () => api.get('/training/sessions/'),
  createTrainingSession: (data) => api.post('/training/sessions/', data),
  updateTrainingSession: (id, data) => api.put(`/training/sessions/${id}`, data),
  deleteTrainingSession: (id) => api.delete(`/training/sessions/${id}`),
  
  getApplications: () => api.get('/training/applications/'),
  createApplication: (data) => api.post('/training/applications/', data),
  approveApplication: (id) => api.post(`/training/applications/${id}/approve/`),
  rejectApplication: (id) => api.post(`/training/applications/${id}/reject/`),
  applyApplication: (trn)=> api.post(`/training/applications/${trn}/apply/`),
  completeApplication: (id)=>api.post(`/training/applications/${id}/complete/`),
  
  // getCertificates: () => api.get('/training/certificates'),
  // createCertificate: (data) => api.post('/training/certificates', data),
  
  // getPayments: () => api.get('/payments'),
  // createPayment: (data) => api.post('/payments', data),
  // approvePayment: (id) => api.put(`/payments/${id}/approve`),
  
  // getInnovations: () => api.get('/training/innovations/'),
  // createInnovation: (data) => api.post('/training/innovations/', data),
  
  
};


// Contract API
export const contractAPI = {
  getContracts: () => api.get('/contracts/'),
  createContract: (data) => api.post('/contracts/', data),
  updateContract: (id, data) => api.put(`/contracts/${id}/`, data),
  deleteContract: (id) => api.delete(`/contracts/${id}/`),
  activateContract: (id) => api.post(`/contracts/${id}/activate/`),
  completeContract: (id) => api.post(`/contracts/${id}/complete/`),
  terminateContract: (id) => api.post(`/contracts/${id}/terminate/`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};


export const paymentAPI={
  getPayments: () => api.get('/training/payments/'),
  createPayment: (data) => api.post('/training/payments/', data),
  approvePayment: (id) => api.post(`/training/payments/${id}/approve/`),
  rejectPayment:(id)=>api.post(`/training/payments/${id}/reject/`),
  requestPayment:(id)=> api.post(`/training/payments/${id}/request/`,),

};
export const warrantyAPI={
  getWarranties: () => api.get('/training/warranties/'),
  createWarranty: (data) => api.post('/training/warranties/', data),
};

export const innovationAPI={
  getInnovations: () => api.get('/training/innovations/'),
  createInnovation: (data) => api.post('/training/innovations/', data),
  updateInnovations:() => api.put(`/training/payments/${id}/update/`),
};

export const certificateAPI={
  getCertificates: () => api.get('/training/certificates/'),
  createCertificate: (data) => api.post('/training/certificates/', data),
};

export default api;

