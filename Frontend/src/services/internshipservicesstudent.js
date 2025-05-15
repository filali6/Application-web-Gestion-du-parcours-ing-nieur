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
export const getStudentInternshipDetails = async () => {
  try {
    const selectedTopicId = localStorage.getItem("selectedTopicId");
    console.log("ID du sujet récupéré du localStorage:", selectedTopicId);
    
    const token = localStorage.getItem("token");

    const response = await Axios.get(
      `http://localhost:5000/internship/me/${selectedTopicId}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    return response.data.stageDetails;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails du stage:",
      error
    );
    throw error;
  }
};
export const getStudentPVDetails = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await Axios.get(`http://localhost:5000/internship/pv`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.pvDetails; // car le backend renvoie { message, pvDetails }
  } catch (error) {
    console.error("Erreur lors de la récupération des PV :", error);
    throw error;
  }
};
 
