import axios from "axios";

const API_URL = "http://localhost:5000/internship";
// Fonction pour récupérer les sujets de l'enseignant connecté
export const fetchTeacherTopics = async () => {
  try {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const response = await axios.get(`${API_URL}/planning/teacher/topics`, config);

    // Retourne les sujets ou un tableau vide
    return response.data.sujets || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des sujets:", error);
    return [];
  }
};
// Fonction pour mettre à jour la soutenance
export const updateSoutenance = async (sujetId,date,horaire,googleMeetLink) => {
  try {
    console.log("Paramètres envoyés au backend:", {
      sujetId,
      date,
      horaire,
      googleMeetLink,
    });
    const token = localStorage.getItem("token");
    
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
    
    const response = await axios.patch(
      `${API_URL}/${sujetId}`, 
      {
        date,
        horaire,
        googleMeetLink
      }, 
      config
    );
    console.log("Réponse backend :", response);

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la soutenance:", error);
    throw error;
  }
};
export const getPlansDetails = async () => {
  try {
    const response = await axios.get(`${API_URL}/planning`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data.plans; // car le backend renvoie { plans: [...] }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des plans :",
      error.response?.data || error
    );
    throw error;
  }
};
