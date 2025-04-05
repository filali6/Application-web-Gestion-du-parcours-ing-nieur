import axios from "axios";

const API_URL = "http://localhost:5000/students";

//  récupérer le token du localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllStudentsForPFA = async () => {
  return axios.get(`${API_URL}/studentsPFA`, {
    headers: getAuthHeaders(),
  });
};
