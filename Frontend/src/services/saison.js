import axios from "axios";

const BASE_URL = "http://localhost:5000/years";

// Update student status
export const updateStudentStatus = async (studentId, status, token) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/student/${studentId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating student status:", error);
    const messagebackend = error.response?.data?.message;
    return { message: messagebackend || "Error updating student status." };
  }
};

// Create new academic year
export const createNewYear = async (year, token) => {
  try {
    const response = await axios.post(
      BASE_URL,
      { year },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating new academic year:", error);
    const messagebackend = error.response?.data?.message;
    const studentsWithoutStatus = error.response?.data?.studentsWithoutStatus;
    return {
      message: messagebackend || "Error creating new academic year.",
      studentsWithoutStatus,
    };
  }
};

// Fetch available years
export const fetchAvailableYears = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/available`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.years;
  } catch (error) {
    console.error("Error fetching available years:", error);
    return [];
  }
};
