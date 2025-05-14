/* eslint-disable prettier/prettier */
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

export const getSubjects = async () => {
  const res = await axios.get(`${API_BASE}/subjects`, getAuthHeader());
  return res.data;
};


export const publishUnpublishSubjects = async (response) => {
  const res = await axios.post(`${API_BASE}/subjects/publish/${response}`, {}, getAuthHeader());
  return res.data;
};


export const createSubject = async (data) => {
  const res = await axios.post(`${API_BASE}/subjects`, data, getAuthHeader());
  return res.data;
};

export const updateSubject = async (id, data) => {
  const res = await axios.patch(`${API_BASE}/subjects/${id}`, data, getAuthHeader());
  return res.data;
};

export const deleteSubject = async (id, archive = false) => {
  const res = await axios.delete(`${API_BASE}/subjects/${id}`, {
    ...getAuthHeader(),
    data: { archive }
  });
  return res.data;
};




export const getSubjectDetails = async (id) => {
  const res = await axios.get(`${API_BASE}/subjects/${id}`, getAuthHeader());
  return res.data;
};



export const updateSubjectProgress = async (id, completedSections) => {
  const res = await axios.post(`${API_BASE}/subjects/${id}/advancement`, { completedSections }, getAuthHeader());
  return res.data;
};

export const getArchivedSubjects = async () => {
  const res = await axios.get(`${API_BASE}/subjects/archived`, getAuthHeader());
  return res.data;
};


export const addSubjectEvaluation = async (id, data) => {
  const res = await axios.post(`${API_BASE}/subjects/${id}/evaluation`, data, getAuthHeader());
  return res.data;
};


export const getSubjectEvaluations = async (id) => {
  const res = await axios.get(`${API_BASE}/subjects/${id}/evaluation`, getAuthHeader());
  return res.data;
};


export const sendEvaluationEmailsToStudents = async () => {
  const res = await axios.post(`${API_BASE}/subjects/evaluation`, {}, getAuthHeader());
  return res.data;
};

export const addProposition = async (id, data) => {
  const res = await axios.patch(`${API_BASE}/subjects/${id}/proposition`, data, getAuthHeader());
  return res.data;
};

export const validateProposition = async (id) => {
  const res = await axios.post(`${API_BASE}/subjects/${id}/validate`, {}, getAuthHeader());
  return res.data;
};

export const getStudents = async () => {
  const res = await axios.get(`${API_BASE}/students`, getAuthHeader());
  return res.data;
};

export const getTeachers = async () => {
  const res = await axios.get(`${API_BASE}/teachers`, getAuthHeader());
  return res.data;
};

export const restoreSubject = async (id, publish) => {
  const res = await axios.patch(
    `${API_BASE}/subjects/${id}/restore`,
    { publish },
    getAuthHeader()
  );
  return res.data;
};


export const fetchStudentsByLevelAndOption = async (level, option = null) => {
  const res = await axios.get(`${API_BASE}/subjects/byLevelOption`, {
    params: { level, option },
    ...getAuthHeader(),
  });
  return res.data;
};


