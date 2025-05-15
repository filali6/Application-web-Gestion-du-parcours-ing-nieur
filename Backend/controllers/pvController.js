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

    // Trouver tous les sujets de l'étudiant
    const sujets = await Sujet.find({ student: studentId });

    if (sujets.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun sujet trouvé pour cet étudiant." });
    }

    const sujetIds = sujets.map((s) => s._id);

    // Trouver tous les PV associés à ces sujets
    const pvs = await PV.find({ sujet: { $in: sujetIds } });

    if (pvs.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun PV trouvé pour les sujets de cet étudiant." });
    }

    // Construire une réponse avec tous les PV trouvés
    const pvDetails = pvs.map((pv) => {
      const sujet = sujets.find(
        (s) => s._id.toString() === pv.sujet.toString()
      );
      return {
        sujetId: sujet?._id,
        sujetTitre: sujet?.titre || "Titre inconnu",
        isValidated: pv.isValidated,
        reason: pv.reason || "Non applicable",
      };
    });

    res.status(200).json({
      message: "Liste des PV de l'étudiant.",
      pvDetails,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des PV :", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des PV.",
      error: error.message,
    });
  }
};
export const getTeacherPVDetails = async (req, res) => {
  try {
    const teacherId = req.auth.userId;

    if (!teacherId) {
      return res.status(400).json({ message: "ID de l'enseignant requis." });
    }

    // 1. Trouver les plans où l'enseignant est affecté
    const plans = await Plan.find({ teachers: teacherId }).populate({
      path: "sujet",
      populate: {
        path: "student",
        select: "firstName lastName",
      },
    });

    if (!plans || plans.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun sujet affecté à cet enseignant." });
    }

    const sujetIds = plans
      .filter((plan) => plan.sujet) // filtrer ceux avec sujet non null
      .map((plan) => plan.sujet._id);

    // 2. Chercher les PV associés à ces sujets
    const pvs = await PV.find({ sujet: { $in: sujetIds } });

    // 3. Construire la réponse
    const result = plans.map((plan) => {
      const sujet = plan.sujet;
      const pv = pvs.find((p) => p.sujet.toString() === sujet?._id.toString());

      return {
        sujetId: sujet?._id,
        sujetTitre: sujet?.titre || "Titre inconnu",
        student:
          sujet?.student?.firstName && sujet?.student?.lastName
            ? `${sujet.student.firstName} ${sujet.student.lastName}`
            : "Étudiant inconnu",
        isValidated: pv?.isValidated ?? null,
        reason: pv?.reason || "Non applicable",
      };
    });

    res.status(200).json({
      message: "Liste des PV associés aux sujets affectés à l'enseignant.",
      data: result,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des PV :", error);
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la récupération des PV de l'enseignant.",
      error: error.message,
    });
  }
};

