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
    const currentYear = new Date().getFullYear();

    // 1) Validate year payload
    if (!year || typeof year !== "number") {
      return res.status(400).json({ message: "Veuillez fournir une année valide." });
    }
    if (year !== currentYear + 1) {
      return res.status(400).json({
        message: "L'année doit être exactement l'année actuelle + 1.",
      });
    }

    // 2) Prevent duplicate academic year
    const exists = await Subject.findOne({ year });
    if (exists) {
      return res.status(400).json({ message: "Cette année existe déjà." });
    }

    // 3) Ensure *all* students have a status defined
    //    (we no longer filter by level—you can reinstate that if needed)
    const studentsWithoutStatus = await Student.find({
      status: { $in: [null, undefined] }
    });
    if (studentsWithoutStatus.length) {
      return res.status(400).json({
        message: "Tous les étudiants doivent avoir un statut défini avant de créer une nouvelle année.",
        studentsWithoutStatus,
      });
    }

    // 4) Push current state into each student’s history and reset for next year
    const students = await Student.find();
    await Promise.all(
      students.map(async (student) => {
        const prevYear   = student.year  || currentYear;
        const prevLevel  = student.level || 1;
        const prevStatus = student.status;

        student.history = student.history || [];
        student.history.push({
          year:           prevYear,
          level:          prevLevel,
          status:         prevStatus,
          successSession: student.successSession || null,
        });

        student.year = year;
        // adjust level/status for progression...
        if (student.status !== "diplomé") {
          if (student.status === "passe") {
            student.level = prevLevel < 3 ? prevLevel + 1 : prevLevel;
            if (prevLevel === 3) student.status = "diplomé";
          }
          if (!["diplomé","redouble"].includes(student.status)) {
            student.status = null;
          }
        }

        await student.save();
      })
    );

    // 5) Update teachers via updateOne (avoids missing password errors)
    const teachers = await Teacher.find();
    await Promise.all(
      teachers.map(async (teacher) => {
        const prevYear  = teacher.year  || currentYear;
        const prevGrade = teacher.grade || null;

        await Teacher.updateOne(
          { _id: teacher._id },
          {
            $set: { year },
            $push: { history: { year: prevYear, grade: prevGrade } },
          }
        );
      })
    );

    // 6) Archive subjects (including isArchived) then reset them
    const subjects = await Subject.find();
    await Promise.all(
      subjects.map(async (subject) => {
        const archiveEntry = {
          year:            subject.year || currentYear,
          title:           subject.title,
          level:           subject.level,
          semester:        subject.semester,
          option:          subject.option || null,
          curriculum:      subject.curriculum || { chapters: [] },
          assignedTeacher: subject.assignedTeacher,
          assignedStudent: subject.assignedStudent || [],
          evaluations:     subject.evaluations || [],
          isArchived:      subject.isArchived || false,
          archivedAt:      new Date(),
        };

        await Subject.updateOne(
          { _id: subject._id },
          {
            $set: {
              year,
              assignedTeacher: null,
              assignedStudent: [],
              isArchived:      false,
            },
            $unset: { level: "", semester: "", option: "" },
            $push: { archive: archiveEntry },
          }
        );
      })
    );

    // 7) Success
    return res.status(201).json({
      message: "Nouvelle année créée avec succès pour étudiants, enseignants et matières.",
      year,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la nouvelle année :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la création de la nouvelle année.",
      error:   error.message,
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
