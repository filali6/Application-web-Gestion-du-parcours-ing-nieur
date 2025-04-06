import axios from 'axios';

const API_URL = 'http://localhost:5000/subjects';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
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
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export const fetchSubjects = async () => {
  try {
    const response = await api.get('/'); 
    console.log('Subjects API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching subjects:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch subjects');
  }
};

export const getSubjectDetails = async (subjectId) => {
  try {
    const response = await api.get(`/${subjectId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch subject details');
  }
};


