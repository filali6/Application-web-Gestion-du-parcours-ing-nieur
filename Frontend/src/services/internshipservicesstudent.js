import Axios from "axios";

const API_URL = "http://localhost:5000/internship/post/topics/drop"; // URL de ton endpoint

export const addTopic = async (formData) => {
  try {
    const response = await Axios.post(API_URL, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data", // Nécessaire pour l'upload de fichiers
      },
    });
    return response.data.model; // Retourne le sujet ajouté
  } catch (error) {
    console.error(
      "Erreur lors du dépôt du sujet :",
      error.response?.data || error
    );
    throw error;
  }
};
export const getTopics = async () => {
  try {
    const response = await Axios.get(`${API_URL}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data; // Retourne la liste des sujets envoyée par le backend
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des sujets :",
      error.response?.data || error
    );
    throw error;
  }
};
 
