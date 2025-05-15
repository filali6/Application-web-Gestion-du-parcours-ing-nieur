import mongoose from "mongoose";
import CV from "../models/cv.js";
import Student from "../models/Student.js";
import Subject from "../models/Subject&Skill/Subject.js";

// teacher ou admin get cv d'un etudiant
export const getCvByStudentId = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérification de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID étudiant invalide." });
    }

    // Récupération du CV associé
    const cv = await CV.findOne({ student: id }).populate([
      { path: "student", select: "firstName lastName level" },
      {
        path: "skills",
        select: "name -_id",
      },
      {
        path: "topics",
        select: "titre description company technologies year -_id",
      },
      { path: "pfa", select: "title description technologies year -_id" },
      {
        path: "pfe",
        select: "title description technologies nameCompany year -_id",
      },
    ]);

    if (!cv) {
      return res.status(404).json({ message: "CV introuvable." });
    }

    // Construction de la réponse finale
    const response = {
      student: {
        firstName: cv.student.firstName,
        lastName: cv.student.lastName,
        level: cv.student.level,
      },
      cv: {
        skills: cv.skills,
        topics: cv.topics,
        pfa: cv.pfa,
        pfe: cv.pfe,
        diplomas: cv.diplomas,
        languages: cv.languages,
        experiences: cv.experiences,
        certifications: cv.certifications,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération du CV :", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ajouter competence au cv (utiliser dans creation de competence)
export const updateStudentCvsWithSkill = async (skillId, subjects) => {
  try {
    // Trouver les étudiants associés aux matières
    const students = await Subject.find({ _id: { $in: subjects } }).distinct(
      "assignedStudent"
    );

    for (const studentId of students) {
      // Vérifier si l'ID de l'étudiant existe
      const studentExists = await Student.exists({ _id: studentId });
      if (!studentExists) continue;

      // Trouver ou créer le CV de l'étudiant
      let studentCv = await CV.findOne({ student: studentId });

      if (!studentCv) {
        studentCv = new CV({ student: studentId, skills: [] });
      }

      // Vérifier si la compétence existe déjà
      const skillExists = studentCv.skills.some(
        (skill) => skill.toString() === skillId.toString()
      );

      if (!skillExists) {
        studentCv.skills.push(skillId);
        await studentCv.save();
      }
    }
  } catch (error) {
    console.error("Error updating student CVs:", error);
  }
};

// Contrôleur pour ajouter des langues, diplômes, certifications et expériences

export const updateCV = async (req, res) => {
  try {
    const { diplomas, languages, experiences, certifications } = req.body;

    if (!diplomas && !languages && !experiences && !certifications) {
      return res
        .status(400)
        .json({ message: "Le corps de la requête est vide" });
    }

    // Récupérer l'ID de l'étudiant depuis la requête
    const studentId = req.auth.userId;

    // Trouver le CV de l'étudiant
    const cv = await CV.findOne({ student: studentId });

    if (!cv) {
      return res
        .status(404)
        .json({ message: "CV non trouvé pour cet étudiant" });
    }

    // Mise à jour des diplômes
    if (diplomas) {
      const uniqueDiplomas = diplomas.filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (t) => t.title === value.title && t.year === value.year
          )
      );
      cv.diplomas = uniqueDiplomas;
    }

    // Mise à jour des langues
    if (languages) {
      const uniqueLanguages = languages.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.name === value.name)
      );
      cv.languages = uniqueLanguages;
    }

    // Mise à jour des expériences
    if (experiences) {
      const uniqueExperiences = experiences.filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.title === value.title &&
              t.description === value.description &&
              t.periode === value.periode
          )
      );
      cv.experiences = uniqueExperiences;
    }

    // Mise à jour des certifications
    if (certifications) {
      const uniqueCertifications = certifications.filter(
        (value, index, self) =>
          index ===
          self.findIndex((t) => t.name === value.name && t.year === value.year)
      );
      cv.certifications = uniqueCertifications;
    }

    // Supprimer les éléments qui existent dans la BD mais pas dans le body
    if (languages) {
      const languageNames = languages.map((lang) => lang.name);
      cv.languages = cv.languages.filter((lang) =>
        languageNames.includes(lang.name)
      );
    }

    if (certifications) {
      const certificationNames = certifications.map((cert) => cert.name);
      cv.certifications = cv.certifications.filter((cert) =>
        certificationNames.includes(cert.name)
      );
    }

    // Enregistrer les modifications
    await cv.save();

    // Retourner le CV mis à jour
    return res.status(200).json({
      diplomas: cv.diplomas,
      languages: cv.languages,
      experiences: cv.experiences,
      certifications: cv.certifications,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du CV" });
  }
};

export const getCV = async (req, res) => {
  try {
    const studentId = req.auth.userId; // Récupérer l'ID de l'étudiant

    // Trouver le CV de l'étudiant et peupler les champs nécessaires
    const cv = await CV.findOne({ student: studentId }).populate([
      { path: "student", select: "firstName lastName -_id" },
      { path: "skills", select: "name -_id" },
      {
        path: "topics",
        select: "titre description company technologies year -_id",
      },
      { path: "pfa", select: "title description technologies year -_id" },
      {
        path: "pfe",
        select: "title description technologies nameCompany year -_id",
      },
      { path: "diplomas", select: "title year -_id" },
      { path: "certifications", select: "name year -_id" },
      { path: "experiences", select: "title description periode -_id" },
      { path: "languages", select: "name -_id" },
    ]);

    if (!cv) {
      return res
        .status(404)
        .json({ message: "CV non trouvé pour cet étudiant" });
    }

    // Fonction pour retirer les _id des sections peuplées
    const removeIds = (data) => {
      return data.map((item) => {
        const { _id, ...rest } = item.toObject();
        return rest;
      });
    };

    // Retirer les _id des sections et préparer la réponse
    const cvData = {
      student: cv.student,
      skills: removeIds(cv.skills),
      topics: removeIds(cv.topics),
      pfa: cv.pfa ? { ...cv.pfa.toObject(), _id: undefined } : null,
      pfe: cv.pfe ? { ...cv.pfe.toObject(), _id: undefined } : null,
      diplomas: removeIds(cv.diplomas),
      certifications: removeIds(cv.certifications),
      experiences: removeIds(cv.experiences),
      languages: removeIds(cv.languages),
    };

    // Retourner les données du CV sans les _id
    return res.status(200).json(cvData);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Erreur lors de la récupération du CV" });
  }
};
