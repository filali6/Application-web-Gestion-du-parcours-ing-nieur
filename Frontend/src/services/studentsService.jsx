import axios from "axios";

const API_URL = "http://localhost:5000/students";

export const getStudents = async (yearFilter = "") => {
  const token = localStorage.getItem("token"); // <- ici directement
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        year: yearFilter || undefined,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

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
