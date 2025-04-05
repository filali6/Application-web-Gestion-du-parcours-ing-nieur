import axios from "axios";

const API_URL = "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getPfaByTeacher = async () => {
  try {
    const res = await axios.get(`${API_URL}/pfa/getPFAbyTeacher`, {
      headers: getAuthHeaders(),
    });
    return res.data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des PFAs", error);
    throw error;
  }
};

export const selectPfa = async (
  pfaId,
  { priority, acceptedByTeacher, binomeId }
) => {
  try {
    const res = await axios.patch(
      `${API_URL}/PFA/choice/${pfaId}`,
      {
        priority,
        acceptedByTeacher,
        ...(binomeId && { binomeId }),
      },
      {
        headers: getAuthHeaders(),
      }
    );
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la sélection du PFA", error);
    throw error;
  }
};
