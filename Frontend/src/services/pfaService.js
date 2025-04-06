import axios from "axios";

const API_URL = "http://localhost:5000";

//  récupérer le token du localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getMyPfas = async () => {
  return axios.get(`${API_URL}/PFA/GetMyPFAs`, {
    headers: getAuthHeaders(),
  });
};

export const addPfas = async (pfas) => {
  return axios.post(
    `${API_URL}/pfa/addPfaS`,
    { pfas },
    { headers: getAuthHeaders() }
  );
};

export const updatePfa = async (id, pfaData) => {
  return axios.patch(`${API_URL}/PFA/${id}/updateMyPfa`, pfaData, {
    headers: getAuthHeaders(),
  });
};

export const deletePfa = async (id) => {
  return axios.delete(`${API_URL}/PFA/deletepfa/${id}`, {
    headers: getAuthHeaders(),
  });
};
