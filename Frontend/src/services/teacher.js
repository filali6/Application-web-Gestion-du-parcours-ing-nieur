import axios from "axios";

const BASE_URL = "http://localhost:5000/teachers";

// Fonction pour récupérer les enseignants
export const fetchTeachers = async (filters = {}, token) => {
  if (!token) {
    console.error("No token provided.");
    return [];
  }

  try {
    const response = await axios.get(BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: { ...filters, _t: Date.now() }, // Cache-busting
    });

    // Normaliser les données en fonction de inHistory
    const { annee, inHistory } = filters;
    if (annee && inHistory === "true") {
      return response.data.map((teacher) => {
        const historyEntry = teacher.history?.find(
          (h) => h.year === Number(annee)
        );
        return {
          ...teacher,
          grade: historyEntry ? historyEntry.grade : null,
          year: Number(annee), // Afficher l'année sélectionnée
        };
      });
    }
    return response.data;
  } catch (error) {
    console.error("Error in fetchTeachers:", error);
    return [];
  }
};

// Fonction pour importer des enseignants via un fichier Excel
export const importTeachers = async (file, token) => {
  if (!file || !token) {
    console.error("File or token is missing.");
    return { message: "Invalid data." };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${BASE_URL}/import`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error in importTeachers:", error);
    return { message: "An error occurred while importing teachers." };
  }
};

export const getTeacherById = async (id, token) => {
  if (!id || !token) {
    console.error("ID or token is missing.");
    return null;
  }

  try {
    const response = await axios.get(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return null;
  }
};

// Fonction pour supprimer un enseignant
export const deleteTeacher = async (id, force = false, token) => {
  if (!id || !token) {
    console.error("ID or token is missing.");
    return { message: "Invalid data." };
  }

  try {
    const response = await axios.delete(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { force },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting teacher:", error);

    const backendMessage = error.response?.data?.message;

    return {
      message:
        backendMessage || "An error occurred while deleting the teacher.",
    };
  }
};

//add teacher
export const addTeacher = async (teacherData, token) => {
  try {
    const response = await axios.post(BASE_URL, teacherData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding teacher:", error);
    const messagebackend = error.response?.data?.message;
    return { message: messagebackend || "Error adding teacher." };
  }
};

// update teacher
export const updateTeacher = async (id, updateData, token) => {
  try {
    const response = await axios.patch(`${BASE_URL}/${id}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating teacher:", {
      request: error.config,
      response: error.response?.data,
    });
    throw error;
  }
};

export const updateTeacherPassword = async (id, passwordData, token) => {
  if (!id || !token) {
    console.error("ID or token is missing.");
    return { message: "Invalid data." };
  }

  try {
    const response = await axios.patch(
      `${BASE_URL}/${id}/password`,
      passwordData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating teacher password:", error);
    return {
      message:
        error.response?.data?.message ||
        "An error occurred while updating the password.",
    };
  }
};
