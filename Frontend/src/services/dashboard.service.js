import axios from 'axios';

const API_BASE = 'http://localhost:5000';

// Helper: Get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getDashboardCounts = async () => {
  const res = await axios.get(`${API_BASE}/dashboard/counts`, getAuthHeader());
  return res.data;
};
