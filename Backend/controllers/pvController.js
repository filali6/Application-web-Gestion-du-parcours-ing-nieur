import PV from "../models/Pv.js";
import Sujet from "../models/topic.js";
import Plan from "../models/Planning.js"

export const fillPV = async (req, res) => {
  try {
    const teacherId = req.auth.userId;  
    const sujetId = req.params.id;  
    const { isValidated, reason } = req.body;  

    if (isValidated === undefined) {
      return res.status(400).json({ message: "Le champ 'validé ou non' est requis." });
    }
    const sujet = await Sujet.findById(sujetId).populate("student");
    if (!sujet) {return res.status(404).json({ message: "Le sujet spécifié n'existe pas." });
    }
    const plan = await Plan.findOne({ sujet: sujetId, teachers: teacherId });
    if (!plan) {
      return res.status(403).json({ message: "Ce sujet n'est pas attribué à l'enseignant connecté.",
        });
    }
    if (!isValidated && (!reason || reason.trim() === "")) {
      return res.status(400).json({message: "La raison est requise si le sujet n'est pas validé.",});
    }
    const pv = await PV.findOneAndUpdate(
      { sujet: sujetId },  
      {
        sujet: sujetId,
        isValidated,
        reason: isValidated ? null : reason, // Supprime la raison si validé
      },
      { new: true, upsert: true }  
    );
const updatedPV = await PV.findById(pv._id).populate({
  path: "sujet",
  populate: { path: "student", model: "Student" }, });
    res.status(200).json({
      message: "PV rempli avec succès.",
      sujetTitre: updatedPV?.sujet?.titre || "Non disponible",
      etudiant: {
      nom: `${updatedPV?.sujet?.student?.firstName || ""} ${updatedPV?.sujet?.student?.lastName || ""}`.trim() || "Non disponible"},
      pv,
    });
  } catch (error) {
    console.error("Erreur lors du remplissage du PV :", error);
    res.status(500).json({
      message: "Une erreur est survenue lors du remplissage du PV.",
      error: error.message,
    });
  }
};
export const getStudentPVDetails = async (req, res) => {
  try {
    const studentId = req.auth.userId; 

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required." });
    }
    const sujet = await Sujet.findOne({ student: studentId });
    if (!sujet) {
      return res
        .status(404)
        .json({ message: "Aucun sujet trouvé pour cet étudiant." });
    }

    const pv = await PV.findOne({ sujet: sujet._id });

    if (!pv) {return res.status(404).json({ message: "Aucun PV trouvé pour ce sujet." });
    }
    const response = {
      sujetId: sujet._id,
      sujetTitre: sujet.titre,
      isValidated: pv.isValidated,
      reason: pv.reason || "Non applicable",  
    };
    res.status(200).json({message: "Détails du PV de l'étudiant.",pvDetails: response,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du PV :", error);
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la récupération des détails du PV.",
      error: error.message,
    });
  }
};

