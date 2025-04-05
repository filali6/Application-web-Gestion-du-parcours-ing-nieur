import axios from 'axios';

const API_URL = 'http://localhost:5000/period';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
});

// Error mapping for backend responses
const errorMessages = {
  default: "An unexpected error occurred. Please try again.",
  400: "Invalid request data. Please check your inputs.",
  401: "Session expired. Please login again.",
  403: "You don't have permission for this action.",
  404: "The requested resource wasn't found.",
  500: "Server error. Please try again later.",
};
const handleServiceError = (error) => {
  // Handle our custom no-change error first
  if (error.isNoChangeError) {
    throw error;
  }

  // Network errors (no response)
  if (error.message === "Network Error") {
    throw new Error("Network issue. Please check your internet connection.");
  }

  // Timeout errors
  if (error.code === "ECONNABORTED") {
    throw new Error("Request timeout. Please try again.");
  }

  // Backend response errors
  if (error.response) {
    const { status, data } = error.response;
    
    // Handle known error patterns from your existing backend
    if (status === 400 && data.error) {
      if (data.error.includes("already exists") || 
          data.error.includes("already open")) {
        throw new Error(data.error);
      }
      throw new Error(data.error || errorMessages[400]);
    }
    
    // Generic error handling based on status code
    throw new Error(errorMessages[status] || errorMessages.default);
  }

  // Fallback for other errors
  throw new Error(errorMessages.default);
};



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

// Helper function to check admin role
const isAdmin = () => {
  return localStorage.getItem('role') === 'admin';
};

export const getAllPeriods = async () => {
  if (!isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }
  try {
    const response = await api.get('/getPeriods');
    return response.data;
  } catch (error) {
    console.error('Error fetching periods:', error);
    throw error;
  }
};

export const getPeriodById = async (id) => {
  if (!isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }
  try {
    const response = await api.get(`/getPeriod/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching period:', error);
    throw error;
  }
};

const formatDateForBackend = (date) => {
  // Handle both Date objects and ISO strings
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0]; // Extracts just yyyy-MM-dd
};

export const addPeriod = async (periodData) => {
  try {
    const formattedData = {
      ...periodData,
      StartDate: formatDateForBackend(periodData.StartDate),
      EndDate: formatDateForBackend(periodData.EndDate)
    };
    
    const response = await api.post('/addPeriod', formattedData);
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const updatePeriod = async (id, periodData) => {
  try {
    // First get the current period data
    const currentPeriodResponse = await getPeriodById(id);
    const currentPeriod = currentPeriodResponse.period;
    // Check if any fields have actually changed
    const isSameStartDate = new Date(periodData.StartDate).getTime() === new Date(currentPeriod.StartDate).getTime();
    const isSameEndDate = new Date(periodData.EndDate).getTime() === new Date(currentPeriod.EndDate).getTime();
    const isSameType = periodData.type === currentPeriod.type;
    
    if (isSameStartDate && isSameEndDate && isSameType) {
      throw {
        isNoChangeError: true,
        message: 'No changes detected. Please modify at least one field before saving.'
      };
    }
    const formattedData = {
      ...periodData,
      StartDate: formatDateForBackend(periodData.StartDate),
      EndDate: formatDateForBackend(periodData.EndDate)
    };
    
    const response = await api.patch(`/updatePeriod/${id}`, formattedData);
    return response.data;
  } catch (error) {
    if (error.isNoChangeError) {
      throw error; // This will be caught in the form component
    }
    handleServiceError(error);
  }
};