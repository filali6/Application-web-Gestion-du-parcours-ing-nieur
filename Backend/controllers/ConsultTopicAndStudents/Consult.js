import Plan from "../../models/Planning.js";
import Student from "../../models/Student.js";
import Sujet from "../../models/topic.js";
import PV from "../../models/Pv.js";

export const getPlanningsDetails = async (req, res) => {
  try {
    const yearFilter = req.yearFilter || {};
    const sujets = await Sujet.find(yearFilter).populate("student");
    const plannings = await Plan.find()
      .populate("sujet")
      .populate({
        path: "sujet",
        populate: { path: "student", model: "Student" },
      })
      .populate("teachers")
      .exec();
    const allStudents = await Student.find(yearFilter);

    const studentsWhoSubmitted = new Set(
      sujets.map((sujet) => sujet.student && sujet.student._id.toString())
    );
    if (!plannings || plannings.length === 0) {
      return res.status(404).json({ message: "no assign available " });
    }
    const details = plannings.map((plan) => {
      const sujet = plan.sujet || {};
      const student = sujet.student || {};
      console.log("Student in plan:", student);
      const teacher = plan.teachers || {};
      const hasSubmitted = studentsWhoSubmitted.has(student._id?.toString());
      const submissionStatus = sujet.isLate
        ? "late submission"
        : "submission in time";
      return {
        studentName: `${student.firstName || "Non spécifié"} ${
          student.lastName || "Non spécifié"
        }`,
        studentEmail: student.email || "Non spécifié",
        hasSubmitted,
        teacherName: `${teacher.firstName || "Non spécifié"} ${
          teacher.lastName || "Non spécifié"
        }`,
        teacherEmail: teacher.email || "Non spécifié",
        documents: sujet.documents || [],
        isPublished: plan.isPublished,
        submissionStatus,
      };
    });
    res.status(200).json({
      message: "Liste des plannings récupérée avec succès.",
      data: details,
    });
  } catch (e) {
    res.status(500).json({
      error: e.message,
      message: "Erreur lors de la récupération des plannings.",
    });
  }
};
export const getFinalinternshipDetails = async (req, res) => {
  try {
    const yearFilter = req.yearFilter || {};

    const sujets = await Sujet.find(yearFilter).populate("student");
    const plannings = await Plan.find(yearFilter)
      .populate("sujet")
      .populate({
        path: "sujet",
        populate: { path: "student", model: "Student" },
      })
      .populate("teachers")
      .exec();
    const allStudents = await Student.find(yearFilter);

    const studentsWhoSubmitted = new Set(
      sujets.map((sujet) => sujet.student && sujet.student._id.toString())
    );

    if (!plannings || plannings.length === 0) {
      return res.status(404).json({ message: "no assign available " });
    }
    const details = await Promise.all(
      plannings.map(async (plan) => {
        const sujet = plan.sujet || {};
        const student = sujet.student || {};
        console.log("Student in plan:", student);
        const teacher = plan.teachers || {};
        const hasSubmitted = studentsWhoSubmitted.has(student._id?.toString());
        const submissionStatus = sujet.isLate
          ? "late submission"
          : "submission in time";
        const pv = await PV.findOne({ sujet: sujet._id });
        return {
          studentName: `${student.firstName || "Non spécifié"} ${
            student.lastName || "Non spécifié"
          }`,
          studentEmail: student.email || "Non spécifié",
          hasSubmitted,
          teacherName: `${teacher.firstName || "Non spécifié"} ${
            teacher.lastName || "Non spécifié"
          }`,
          teacherEmail: teacher.email || "Non spécifié",
          documents: sujet.documents || [],
          isPublished: plan.isPublished,
          submissionStatus,
          googleMeetLink: plan.googleMeetLink || "Aucun lien disponible",
          pvDetails: pv
            ? {
                isValidated: pv.isValidated ? "Validé" : "Non validé",
                reason: pv.reason || "Aucune raison spécifiée",
              }
            : "Aucun PV disponible",
        };
      })
    );
    res.status(200).json({
      message: "Liste des plannings récupérée avec succès.",
      data: details,
    });
  } catch (e) {
    res.status(500).json({
      error: e.message,
      message: "Erreur lors de la récupération des plannings.",
    });
  }
};

export const getStudentInternshipDetails = async (req, res) => {
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
    const plan = await Plan.findOne({ sujet: sujet._id }).populate("teachers");

    if (!plan) {
      return res
        .status(404)
        .json({ message: "Aucun plan trouvé pour ce sujet." });
    }
    const teacher = plan.teachers;
    const response = {
      sujetId: sujet._id,
      sujetTitre: sujet.titre,
      teacherName: teacher
        ? `${teacher.firstName} ${teacher.lastName}`
        : "Nom de l'enseignant non disponible",
      teacherEmail: teacher?.email || "Email non disponible",
      googleMeetLink: plan.googleMeetLink || "Lien Google Meet non disponible",
      jour: plan.date || "Jour non disponible",
      horaire: plan.horaire || "Horaire non disponible",
    };

    res.status(200).json({
      message: "Détails du stage de l'étudiant.",
      stageDetails: response,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails du stage :",
      error
    );
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la récupération des détails du stage.",
      error: error.message,
    });
  }
};
