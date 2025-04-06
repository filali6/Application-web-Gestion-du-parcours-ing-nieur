import axios from "axios";

const BASE_URL = "http://localhost:5000/students";

//  Fonction pour récupérer les étudiants
export const fetchStudents = async (filters = {}, token) => {
  if (!token) {
    console.error("No token provided.");
    return [];
  }

  try {
    const response = await axios.get(BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error in fetchStudents:", error);
    return [];
  }
};

//  Fonction pour importer des étudiants via un fichier Excel
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
    const response = await axios.post(BASE_URL, studentData, {
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
