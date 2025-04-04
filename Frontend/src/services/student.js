import axios from "axios";

const BASE_URL = "http://localhost:5000/students";

//  Fonction pour récupérer les étudiants
export const fetchStudents = async (filters = {}, token) => {
  if (!token) {
    console.error(" Aucun token fourni.");
    return [];
  }

  try {
    const response = await axios.get(BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error(" Erreur dans fetchStudents:", error);
    return [];
  }
};

//  Fonction pour importer des étudiants via un fichier Excel
export const importStudents = async (file, token) => {
  if (!file || !token) {
    console.error(" Fichier ou token manquant.");
    return { message: "Données invalides." };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${BASE_URL}/import`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error(" Erreur dans importStudents:", error);
    return { message: "Une erreur est survenue lors de l'importation." };
  }
};

export const getStudentById = async (id, token) => {
  if (!id || !token) {
    console.error("ID ou token manquant.");
    return null;
  }

  try {
    const response = await axios.get(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'étudiant :", error);
    return null;
  }
};

// Fonction pour supprimer un étudiant
export const deleteStudent = async (id, force = false, token) => {
  if (!id || !token) {
    console.error("ID ou token manquant.");
    return { message: "Données invalides." };
  }

  try {
    const response = await axios.delete(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { force },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur dans la suppression de l'étudiant:", error);

    // Nouvelle partie : récupérer le message d'erreur du backend
    const backendMessage = error.response?.data?.message;

    return {
      message:
        backendMessage ||
        "Une erreur est survenue lors de la suppression de l'étudiant.",
    };
  }
};
