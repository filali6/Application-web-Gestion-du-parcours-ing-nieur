import axios from "axios";

const BASE_URL = "http://localhost:5000/students";

// Fonction pour récupérer les étudiants
export const fetchStudents = async (filters = {}, token) => {
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
      return response.data.map((student) => {
        const historyEntry = student.history?.find(
          (h) => h.year === Number(annee)
        );
        return {
          ...student,
          level: historyEntry ? historyEntry.level : null,
          status: historyEntry ? historyEntry.status : null,
          year: Number(annee), // Afficher l'année sélectionnée
        };
      });
    }
    return response.data;
  } catch (error) {
    console.error("Error in fetchStudents:", error);
    return [];
  }
};

// Fonction pour importer des étudiants via un fichier Excel
export const importStudents = async (file, token) => {
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
    console.error("Error in importStudents:", error);
    return { message: "An error occurred while importing students." };
  }
};

export const getStudentById = async (id, token) => {
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
    console.error("Error fetching student:", error);
    return null;
  }
};

// Fonction pour supprimer un étudiant
export const deleteStudent = async (id, force = false, token) => {
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
    console.error("Error deleting student:", error);
    const backendMessage = error.response?.data?.message;

    return {
      message:
        backendMessage || "An error occurred while deleting the student.",
    };
  }
};

//add student
export const addStudent = async (studentData, token) => {
  try {
    // Create a new object excluding affectedOption if it's empty
    const { affectedOption, ...restData } = studentData;
    const payload = {
      ...restData,
      ...(affectedOption && { affectedOption }), // Only include affectedOption if it has a value
    };

    const response = await axios.post(BASE_URL, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding student:", error);
    const messagebackend = error.response?.data?.message;
    return { message: messagebackend || "Error adding student." };
  }
};

//update student
export const updateStudent = async (id, formData, token) => {
  if (!id || !token) {
    console.error("ID or token is missing.");
    return { message: "Invalid data." };
  }

  try {
    const response = await axios.patch(`${BASE_URL}/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating student:", error);
    // Return the server's error message if available
    return {
      message:
        error.response?.data?.message ||
        "An error occurred while updating the student.",
    };
  }
};

// Fonction pour modifier le mot de passe
export const updateStudentPassword = async (id, passwordData, token) => {
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
    console.error("Error updating student password:", error);
    return {
      message:
        error.response?.data?.message ||
        "An error occurred while updating the password.",
    };
  }
};

//cv
export const getStudentCV = async (studentId, token) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/students/${studentId}/cv`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Vérifier que les compétences sont bien un tableau
    if (response.data?.cv?.skills && !Array.isArray(response.data.cv.skills)) {
      response.data.cv.skills = [response.data.cv.skills];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching student CV:", error);
    return null;
  }
};
// Get student's own CV

export const getCV = async (token) => {
  try {
    const response = await axios.get(`http://localhost:5000/student/cv/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // Retourne null si le CV n'existe pas
    }
    console.error("Error fetching student CV:", error);
    throw error;
  }
};

// Update student's CV
export const updateCV = async (data, token) => {
  try {
    const response = await axios.patch(
      `http://localhost:5000/student/cv`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating student CV:", error);
    throw error;
  }
};

// Récupérer le profil complet (incluant la photo via l'URL)
export const getMyProfile = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

// Mettre à jour le profil (avec photo si fournie)
export const updateMyProfile = async (formData, token) => {
  try {
    const response = await axios.patch(`${BASE_URL}/me`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
