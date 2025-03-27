import Student from "../models/Student.js";
import Subject from "../models/Subject&Skill/Subject.js";
import Skill from "../models/Subject&Skill/Skill.js";
import Teacher from "../models/Teacher.js";

export const updateStudentStatus = async (req, res) => {
  try {
    // Récupérer l'ID de l'étudiant depuis l'URL
    const studentId = req.params.id;

    // Récupérer le nouveau statut depuis le corps de la requête
    const { status } = req.body;

    // Vérifier que le statut est valide
    const validStatuses = ["redouble", "passe", "diplomé"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide." });
    }

    // Rechercher l'étudiant par ID
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Étudiant non trouvé." });
    }

    // Mettre à jour le statut de l'étudiant
    student.status = status;

    // Sauvegarder les modifications
    await student.save();

    res.status(200).json({
      message: "Statut mis à jour avec succès.",
      student: {
        id: student._id,
        status: student.status,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la mise à jour du statut.",
    });
  }
};

export const createNewYear = async (req, res) => {
  try {
    const { year } = req.body;

    // Validation de l'année
    if (!year || typeof year !== "number") {
      return res
        .status(400)
        .json({ message: "Veuillez fournir une année valide." });
    }

    const currentYear = new Date().getFullYear();
    if (year > currentYear + 1) {
      return res.status(400).json({
        message: "L'année ne peut pas être supérieure à l'année actuelle + 1.",
      });
    }

    const existingYearData = await Subject.findOne({ year });
    if (existingYearData) {
      return res.status(400).json({ message: "Cette année existe déjà." });
    }

    const studentsWithoutStatus = await Student.find({
      level: { $in: [1, 2] },
      $or: [{ status: { $exists: false } }, { status: null }],
    });

    if (studentsWithoutStatus.length > 0) {
      return res.status(400).json({
        message:
          "Tous les étudiants de niveau 1 et 2 doivent avoir un statut défini avant de créer une nouvelle année.",
        studentsWithoutStatus,
      });
    }

    // Mise à jour des étudiants
    const students = await Student.find();

    await Promise.all(
      students.map(async (student) => {
        // Ignorer les étudiants "diplômés"
        if (student.status === "diplomé") {
          return; // Passer à l'étudiant suivant
        }

        // Ajouter les données actuelles dans l'historique uniquement pour les étudiants non diplômés
        if (student.status !== "diplomé") {
          student.history.push({
            year: student.year,
            level: student.level,
            status: student.status,
          });
        }

        // Mise à jour pour les étudiants non diplômés
        if (student.status === "redouble") {
          student.year = year;
        } else if (
          student.status === "passe" &&
          (student.level === 1 || student.level === 2)
        ) {
          student.year = year;
          student.level += 1;
        }

        student.status = null; // Réinitialiser le statut pour les étudiants non diplômés
        await student.save();
      })
    );

    // Mise à jour des enseignants
    const teachers = await Teacher.find();
    await Promise.all(
      teachers.map(async (teacher) => {
        teacher.history.push({
          year: teacher.year,
          grade: teacher.grade,
        });

        teacher.year = year;
        await teacher.save();
      })
    );

    // Mise à jour des compétences
    const skills = await Skill.find();
    await Promise.all(
      skills.map(async (skill) => {
        skill.history.push({
          year: skill.year,
          subjects: skill.subjects, // Matières associées
        });

        skill.year = year;
        await skill.save();
      })
    );

    // Mise à jour des matières
    const subjects = await Subject.find();
    await Promise.all(
      subjects.map(async (subject) => {
        subject.archive.push({
          year: subject.year,
          assignedTeacher: subject.assignedTeacher,
          assignedStudent: subject.assignedStudent,
        });

        subject.year = year;
        subject.assignedTeacher = null;
        subject.assignedStudent = [];
        await subject.save();
      })
    );

    res
      .status(201)
      .json({ message: "Nouvelle année créée avec succès.", year });
  } catch (error) {
    console.error("Erreur lors de la création de la nouvelle année :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la création de la nouvelle année.",
    });
  }
};
