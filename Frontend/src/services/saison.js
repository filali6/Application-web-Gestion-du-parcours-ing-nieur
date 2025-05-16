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
