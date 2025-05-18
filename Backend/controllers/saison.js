import Student from "../models/Student.js";
import Subject from "../models/Subject&Skill/Subject.js";
import Teacher from "../models/Teacher.js";
import mongoose from "mongoose";

export const updateStudentStatus = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { status } = req.body;

    const validStatuses = ["redouble", "passe", "diplomé"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (status === "diplomé" && student.level !== 3) {
      return res
        .status(400)
        .json({ message: "Student must be in level 3 to be graduated." });
    }

    student.status = status;
    await student.save();

    res.status(200).json({
      message: "Status updated successfully.",
      student: {
        id: student._id,
        status: student.status,
      },
    });
  } catch (error) {
    console.error("Error updating status:", error.message, error.stack);
    res.status(500).json({
      message: "Server error while updating status.",
      error: error.message,
    });
  }
};

export const createNewYear = async (req, res) => {
  try {
    const { year } = req.body;

    if (!year || typeof year !== "number") {
      return res
        .status(400)
        .json({ message: "Veuillez fournir une année valide." });
    }

    const currentYear = new Date().getFullYear();
    if (year !== currentYear + 3) {
      return res.status(400).json({
        message: "L'année doit être exactement l'année actuelle + 1.",
      });
    }

    const existingYearData = await Subject.findOne({ year });
    if (existingYearData) {
      return res.status(400).json({ message: "Cette année existe déjà." });
    }

    const studentsWithoutStatus = await Student.find({
      level: { $in: [1, 2] },
      status: { $in: [null, undefined] },
    });

    if (studentsWithoutStatus.length > 0) {
      return res.status(400).json({
        message:
          "Tous les étudiants de niveau 1 et 2 doivent avoir un statut défini avant de créer une nouvelle année.",
        studentsWithoutStatus,
      });
    }

    const students = await Student.find();
    await Promise.all(
      students.map(async (student) => {
        const previousLevel = student.level || 1;
        const previousStatus = student.status || "pending";
        const previousYear = student.year || currentYear;

        student.history = student.history || [];
        student.history.push({
          year: previousYear,
          level: previousLevel,
          status: previousStatus,
          successSession: student.successSession || null,
        });

        student.year = year;
        if (student.status !== "diplomé") {
          if (student.status === "redouble") {
            // Level remains the same
          } else if (
            student.status === "passe" &&
            (previousLevel === 1 || previousLevel === 2)
          ) {
            student.level = previousLevel + 1;
          } else if (student.status === "passe" && previousLevel === 3) {
            student.status = "diplomé";
          }
          if (student.status !== "diplomé") {
            student.status = null;
          }
        }

        await student.save();
      })
    );

    const teachers = await Teacher.find();
    await Promise.all(
      teachers.map(async (teacher) => {
        const previousYear = teacher.year || currentYear;
        const previousGrade = teacher.grade || null;

        teacher.history = teacher.history || [];
        teacher.history.push({
          year: previousYear,
          grade: previousGrade,
        });

        teacher.year = year;
        await teacher.save();
      })
    );

    const subjects = await Subject.find();
    await Promise.all(
      subjects.map(async (subject) => {
        subject.archive = subject.archive || [];
        subject.archive.push({
          year: subject.year || currentYear,
          assignedTeacher: subject.assignedTeacher,
          assignedStudent: subject.assignedStudent || [],
        });

        subject.year = year;
        subject.assignedTeacher = null;
        subject.assignedStudent = [];
        await subject.save();
      })
    );

    res.status(201).json({
      message:
        "Nouvelle année créée avec succès pour les étudiants, les enseignants et les matières.",
      year,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création de la nouvelle année :",
      error.message,
      error.stack
    );
    res.status(500).json({
      message: "Erreur serveur lors de la création de la nouvelle année.",
      error: error.message,
    });
  }
};

export const getAvailableYears = async (req, res) => {
  try {
    // Fetch distinct years from Student
    const studentYears = await Student.distinct("year");
    const studentHistoryYears = await Student.distinct("history.year");

    // Fetch distinct years from Teacher
    const teacherYears = await Teacher.distinct("year");
    const teacherHistoryYears = await Teacher.distinct("history.year");

    // Fetch distinct years from Subject
    const subjectYears = await Subject.distinct("year");
    const subjectHistoryYears = await Subject.distinct("archive.year");

    // Combine all years and remove duplicates
    const allYears = [
      ...new Set([
        ...studentYears,
        ...studentHistoryYears,
        ...teacherYears,
        ...teacherHistoryYears,
        ...subjectYears,
        ...subjectHistoryYears,
      ]),
    ].filter((year) => year !== null && year !== undefined);

    // Sort years in ascending order
    allYears.sort((a, b) => a - b);

    res.status(200).json({
      message: "Available years retrieved successfully.",
      years: allYears,
    });
  } catch (error) {
    console.error(
      "Error retrieving available years:",
      error.message,
      error.stack
    );
    res.status(500).json({
      message: "Server error while retrieving available years.",
      error: error.message,
    });
  }
};
