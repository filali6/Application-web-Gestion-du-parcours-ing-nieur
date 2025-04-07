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

// Get all skills (optionally by year)
export const getSkills = async (year) => {
  const url = year ? `${API_BASE}/skills?year=${year}` : `${API_BASE}/skills`;

  const res = await axios.get(url, getAuthHeader());
  return res.data;
};

// Get one skill by ID
export const getSkillById = async (id, year) => {
  const url = year ? `${API_BASE}/skills/${id}?year=${year}` : `${API_BASE}/skills/${id}`;

  const res = await axios.get(url, getAuthHeader());
  return res.data;
};

// Create a new skill
export const createSkill = async (skillData) => {
  const res = await axios.post(`${API_BASE}/skills`, skillData, getAuthHeader());
  return res.data;
};

// Update a skill
export const updateSkill = async (id, skillData) => {
  const res = await axios.patch(`${API_BASE}/skills/${id}`, skillData, getAuthHeader());
  return res.data;
};

// Delete or archive a skill
export const deleteSkill = async (id, archive = false) => {
  const res = await axios.delete(`${API_BASE}/skills/${id}`, {
    ...getAuthHeader(),
    data: { archive }
  });
  return res.data;
};

// Get archived skills
export const getArchivedSkills = async () => {
  const res = await axios.get(`${API_BASE}/skills/archive`, getAuthHeader());
  return res.data;
};
