import Axios from "axios";

const API_URL = "http://localhost:5000/internship/type"; // URL de ton endpoint

// export const getPlanningsDetails = async () => {
//   try {
//     const response = await Axios.get(API_URL, {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//     });

//     return response.data.data; // Retourne la liste des détails des plannings
//   } catch (error) {
//     console.error(
//       "Erreur lors de la récupération des détails des plannings :",
//       error.response?.data || error
//     );
//     throw error;
//   }
// };
export const getPlanningsDetails = async () => {
  try {
    const response = await Axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data.data; // Retourne la liste des détails des plannings
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails des plannings :",
      error.response?.data || error
    );
    throw error;
  }
};
