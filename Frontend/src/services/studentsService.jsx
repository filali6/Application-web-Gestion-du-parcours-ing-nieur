import axios from 'axios';

const API_URL = 'http://localhost:5000/students';

export const getStudents = async (yearFilter = '', token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        year: yearFilter || undefined,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

