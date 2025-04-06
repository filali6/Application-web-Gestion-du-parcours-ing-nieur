import axios from "axios";

const API_URL = "http://localhost:5000/internship/planning";
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

    const response = await axios.get(`${API_URL}/teacher/topics`, config);

    // Retourne les sujets ou un tableau vide
    return response.data.sujets || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des sujets:", error);
    return [];
  }
};
