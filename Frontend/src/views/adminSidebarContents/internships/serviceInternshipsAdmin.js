import axios from "axios";

const API_URL = "http://localhost:5000/internship/planning";

// Fonction pour récupérer la liste des enseignants
export const fetchTeachers = async () => {
  try {
    // Récupérer le token d'authentification depuis le localStorage
    const token = localStorage.getItem("token");

    // Configurer les en-têtes de la requête
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }), // Ajouter le token dans l'en-tête si disponible
      },
    };

    // Effectuer la requête avec axios
    const response = await axios.get(`${API_URL}/teacher`, config);

    // Retourner les données ou un tableau vide si `model` est undefined
    return response.data.model || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des enseignants:", error);
    return []; // Retourne un tableau vide en cas d'erreur
  }
};

// Fonction pour assigner les enseignants à des sujets
export const assignTeachersToTopics = async (teacherIds) => {
  try {
    const token = localStorage.getItem("token");

    // Utilisation de axios.post pour envoyer la requête POST
    const response = await axios.post(
      `${API_URL}/assign`,
      { teacherIds },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    return response.data; // Retourner les données en cas de succès
  } catch (error) {
    console.error("Erreur lors de l'affectation des enseignants:", error);
    throw error;
  }
};

// Fonction pour récupérer les plannings
// export const getPlans = async () => {
//   try {
//     const token = localStorage.getItem("token");

//     // Utilisation de axios.get pour récupérer les plannings
//     const response = await axios.get(`${API_URL}`, {
//       headers: {
//         "Content-Type": "application/json",
//         ...(token && { Authorization: `Bearer ${token}` }),
//       },
//     });

//     return response.data; // Retourner les données des plannings
//   } catch (error) {
//     console.error("Erreur lors de la récupération des plannings:", error);
//     throw error;
//   }
// };
export const getPlans = async () => {
  try {
    const token = localStorage.getItem("token");

    // Utilisation de axios.get pour récupérer les plannings
    const response = await axios.get(`${API_URL}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const plans = response.data.plans;

    // Vérifier si aucun planning n'a été trouvé
    if (plans.length === 0) {
      // Retourner un message indiquant qu'aucun planning n'est disponible
      return { plans: [], message: "Aucun planning trouvé pour le moment." };
    }

    return response.data; // Retourner les données des plannings
  } catch (error) {
    console.error("Erreur lors de la récupération des plannings:", error);
    // Si une erreur se produit, renvoyer un message d'erreur
    return {
      plans: [],
      message: "Une erreur est survenue lors du chargement des plannings.",
    };
  }
};

// Fonction pour changer la visibilité du planning
export const togglePlanVisibility = async (isPublished) => {
  try {
    const token = localStorage.getItem("token");

    // Utilisation de axios.post pour la modification de la visibilité
    const response = await axios.post(
      `${API_URL}/publish/${isPublished ? "true" : "false"}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    const result = response.data;
    console.log("Réponse du serveur : ", result);

    return result;
  } catch (error) {
    console.error("Erreur lors de la modification de la visibilité:", error);
    throw error;
  }
};

// Fonction pour mettre à jour un plan spécifique avec un nouvel enseignant
export const updateTeacherForPlan = async (planId, teacherId, internshipId) => {
  try {
    console.log("Données envoyées au backend :", {
      planId,
      teacherId,
      internshipId,
    });

    const token = localStorage.getItem("token");

    // Utilisation de axios.patch pour envoyer une mise à jour de plan
    const response = await axios.patch(
      `${API_URL}/update/${planId}`,
      {
        teacherId,
        internshipId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    console.log("Réponse backend :", response.data);

    // Vérification si la réponse contient un plan mis à jour
    if (response.data.updatedPlan) {
      return response.data.updatedPlan;
    } else {
      console.error(
        "Réponse incorrecte du backend, 'updatedPlan' manquant",
        response.data
      );
      throw new Error("Le plan mis à jour est manquant dans la réponse.");
    }
  } catch (error) {
    console.error("Erreur dans updateTeacherForPlan:", error.message);
    throw error;
  }
};

export const sendPlanningEmails = async (sendType) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_URL}/send/${sendType}`,
      {}, // aucun body
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    return { success: true, message: response.data.message };
  } catch (error) {
    console.error("Error sending planning emails:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Erreur lors de l'envoi des emails au serveur.",
    };
  }
};
