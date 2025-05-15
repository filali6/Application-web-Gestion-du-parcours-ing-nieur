import mongoose from "mongoose";
import Subject from "../../models/Subject&Skill/Subject.js";
import Teacher from "../../models/Teacher.js";
import Student from "../../models/Student.js";
import bcrypt from "bcrypt";

import Admin from "../../models/Admin.js";
import {
  generateEmailTemplate,
  COMMON_ATTACHMENTS,
} from "../../notifyWithMail/notifTemplate.js";
import { sendNotification } from "../../notifyWithMail/mailNotif.js";

//create subject
export const createSubject = async (req, res) => {
  try {
    const {
      title,
      level,
      semester,
      curriculum,
      assignedTeacher,
      assignedStudent,
      year,
      option, // added field
    } = req.body;

    // Check if a subject with the same title already exists
    const existingSubject = await Subject.findOne({ title });
    if (existingSubject) {
      return res
        .status(400)
        .json({ message: "A subject with this title already exists." });
    }

    // Validate assignedTeacher
    if (assignedTeacher) {
      const teacherExists = await Teacher.findById(assignedTeacher);
      if (!teacherExists) {
        return res
          .status(400)
          .json({ message: "The assigned teacher does not exist." });
      }
    }

    let finalAssignedStudents = [];

    if (assignedStudent && assignedStudent.length > 0) {
      const validStudents = await Student.find({
        _id: { $in: assignedStudent },
      });
      if (validStudents.length !== assignedStudent.length) {
        return res
          .status(400)
          .json({ message: "One or more assigned students do not exist." });
      }
      finalAssignedStudents = assignedStudent;
    } else {
      const query = { level: Number(level) };

      if (Number(level) === 2 || Number(level) === 3) {
        if (!option) {
          return res
            .status(400)
            .json({ message: "Option is required for level 2 or 3." });
        }
        query.affectedOption = option;
      }

      const students = await Student.find(query).select("_id");
      finalAssignedStudents = students.map((s) => s._id);
    }

    const newSubject = new Subject({
      title,
      level,
      option: option || null,
      semester,
      curriculum,
      assignedTeacher,
      assignedStudent: finalAssignedStudents,
      year,
    });

    await newSubject.save();
    res.status(201).json({ message: "Subject added successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get subjects
export const getSubjects = async (req, res) => {
  try {
    const filter = req.yearFilter || {};
    const { role, userId } = req.auth;

    let query = { ...filter };

    if (role === "admin") {
      // Admin sees everything
    } else if (role === "teacher") {
      // Teacher sees only their own published subjects
      query.assignedTeacher = userId;
      query.isPublished = true;

      // Teacher-specific filters
      const { level, semester } = req.query;
      if (level) query.level = level;
      if (semester) query.semester = semester;
    } else if (role === "student") {
      // Student sees only their own published subjects
      query.assignedStudent = userId;
      query.isPublished = true;
    } else {
      return res.status(403).json({ error: "Access denied." });
    }

    const subjects = await Subject.find(query)
      .populate("assignedTeacher", "firstName lastName email")
      .populate("assignedStudent", "firstName lastName email")
      .populate("propositions.submittedBy", "firstName lastName email");

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching subjects." });
  }
};

//publish unpublish
export const publishUnpublishAllSubjects = async (req, res) => {
  const { response } = req.params;
  try {
    const publish = response === "publish";

    const updatedSubjects = await Subject.updateMany(
      { isArchived: false },
      { isPublished: publish }
    );

    res.status(200).json({
      message: `All subjects have been ${
        publish ? "published" : "unpublished"
      }.`,
      modifiedCount: updatedSubjects.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating subjects:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating subjects." });
  }
};

// Subject progress
export const updateSubjectProgress = async (req, res) => {
  const { id } = req.params;
  const { role, userId } = req.auth;
  const { completedSections } = req.body;

  try {
    const subject = await Subject.findById(id)
      .populate("assignedTeacher", "email firstName lastName")
      .populate("assignedStudent", "email firstName lastName");

    if (!subject) {
      return res.status(404).json({ error: "Subject not found." });
    }

    if (
      role === "teacher" &&
      (!subject.assignedTeacher ||
        subject.assignedTeacher._id.toString() !== userId)
    ) {
      return res.status(403).json({
        error: "You are not authorized to update this subject's progress.",
      });
    }

    if (!subject.assignedStudent || subject.assignedStudent.length === 0) {
      return res.status(400).json({
        error: `The subject "${subject.title}" does not have any assigned students.`,
      });
    }

    if (!Array.isArray(completedSections) || completedSections.length === 0) {
      return res.status(400).json({
        error: "You must provide an array of completed sections with dates.",
      });
    }

    subject.progress = subject.progress || [];
    for (const section of completedSections) {
      if (!section.title || !section.completedDate) {
        return res.status(400).json({
          error: "Each section must include a title and completion date.",
        });
      }
      subject.progress.push({
        title: section.title,
        completedDate: section.completedDate,
      });
    }

    // ✅ Mark teacher as having completed advancement
    subject.assignedTeacherHasAdvanced = true;

    await subject.save();

    const notifications = [];
    const admins = await Admin.find({}, "email");

    admins.forEach((admin) => {
      const emailContent = generateEmailTemplate(
        `Subject Progress Updated: ${subject.title}`,
        `<h2>Dear Admin,</h2>`,
        `<p>The progress for subject <strong>${subject.title}</strong> has been updated by <strong>${subject.assignedTeacher?.firstName} ${subject.assignedTeacher?.lastName}</strong>.</p>`
      );

      notifications.push(
        sendNotification({
          email: admin.email,
          subject: `Progress Updated: ${subject.title}`,
          htmlContent: emailContent,
        })
      );
    });

    subject.assignedStudent.forEach((student) => {
      const emailContent = generateEmailTemplate(
        `Subject Progress Updated: ${subject.title}`,
        `<h2>Dear ${student.firstName} ${student.lastName},</h2>`,
        `<p>The progress for subject <strong>${subject.title}</strong> has been updated.</p>`
      );

      notifications.push(
        sendNotification({
          email: student.email,
          subject: `Progress Updated: ${subject.title}`,
          htmlContent: emailContent,
        })
      );
    });

    await Promise.all(notifications);

    res
      .status(200)
      .json({ message: "Progress updated and notifications sent." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating progress." });
  }
};

//evaluate subject
export const addEvaluation = async (req, res) => {
  const { id } = req.params;
  const { feedback, score } = req.body;
  const { userId } = req.auth;

  try {
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ error: "Subject not found." });
    }
    const isAssignedStudent = subject.assignedStudent.some(
      (studentId) => studentId.toString() === userId
    );

    if (!isAssignedStudent) {
      return res
        .status(403)
        .json({ error: "You are not allowed to evaluate this subject." });
    }

    if (score < 0 || score > 10) {
      return res.status(400).json({ error: "Score must be between 0 and 10." });
    }
    const hashedUserId = bcrypt.hashSync(userId, 10);
    const alreadyEvaluated = subject.evaluations.some((evaluation) =>
      bcrypt.compareSync(userId, evaluation.hashedStudentId)
    );

    if (alreadyEvaluated) {
      return res
        .status(400)
        .json({ error: "You have already evaluated this subject." });
    }
    subject.evaluations.push({
      feedback,
      score,
      hashedStudentId: hashedUserId,
    });
    await subject.save();

    res.status(200).json({
      message: "Evaluation added successfully.",
    });
  } catch (error) {
    console.error("Error adding evaluation:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the evaluation." });
  }
};
//get evaluations
export const getEvaluations = async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.auth;
  try {
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ error: "Subject not found." });
    }
    if (role !== "admin" && subject.assignedTeacher.toString() !== userId) {
      return res.status(403).json({
        error:
          "You are not authorized to view the evaluations for this subject.",
      });
    }
    res.status(200).json({
      evaluations: subject.evaluations.map(({ feedback, score }) => ({
        feedback,
        score,
      })),
    });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    res.status(500).json({
      error: "An error occurred while fetching the evaluations.",
    });
  }
};

/////////////////////////////////GET SUBJECTS DETAILSs INCLUDING HISTORY/////////////////////////////////
export const getSubjectDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the subject by ID
    const subject = await Subject.findById(id)
      .select("title level semester curriculum history")
      .populate("history.submittedBy", "firstName lastName")
      .lean();

    if (!subject) {
      return res.status(404).json({ error: "Subject not found." });
    }

    res.status(200).json({
      message: "Subject details and history retrieved successfully.",
      subject: {
        title: subject.title,
        level: subject.level,
        semester: subject.semester,
        curriculum: subject.curriculum,
        history: subject.history,
      },
    });
  } catch (error) {
    console.error("Error fetching subject details and history:", error);
    res.status(500).json({
      error: "An error occurred while retrieving the subject details.",
    });
  }
};

/////////////////////////////////ADD PROPOSITION/////////////////////////////////
export const addProposition = async (req, res) => {
  const { id } = req.params; // Subject ID
  const { changes, reason } = req.body; // Changes and reason for the proposition
  const { userId } = req.auth; // User ID from middleware

  try {
    // Validate the subject exists
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ error: "Subject not found." });
    }

    // Check if the logged-in user is the assignedTeacher for the subject
    if (
      !subject.assignedTeacher ||
      subject.assignedTeacher.toString() !== userId
    ) {
      return res.status(403).json({
        error: "Access denied. Only the assigned teacher can propose changes.",
      });
    }

    // Validate input
    if (
      !reason ||
      !changes ||
      typeof changes !== "object" ||
      Object.keys(changes).length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Invalid proposition data provided." });
    }

    // Merge changes with existing data
    const mergedChanges = {
      level: changes.level || subject.level,
      semester: changes.semester || subject.semester,
      curriculum: {
        chapters: changes.curriculum?.chapters || subject.curriculum.chapters,
      },
    };

    // Prepare the proposition object
    const proposition = {
      changes: mergedChanges,
      reason,
      submittedBy: userId,
      date: new Date(),
    };

    // Add the proposition to the subject
    subject.propositions.push(proposition);

    // Save the updated subject
    await subject.save();

    res.status(200).json({
      message: "Proposition added successfully.",
      proposition,
    });
  } catch (error) {
    console.error("Error adding proposition:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the proposition." });
  }
};

/////////////////////////////////VALIDATE LAST SUBJECT PROPOSITION AND ADD THE PREVIOUS TO HISTORY/////////////////////////////////
export const validateProposition = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the subject and populate propositions
    const subject = await Subject.findById(id).populate(
      "propositions.submittedBy",
      "cin firstName lastName"
    );

    if (!subject) {
      return res.status(404).json({ error: "Subject not found." });
    }

    // Find the most recent unvalidated proposition
    const latestProposition = subject.propositions
      .filter((p) => !p.validated) // Only unvalidated propositions
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    if (!latestProposition) {
      return res
        .status(400)
        .json({ error: "No unvalidated propositions available to validate." });
    }

    // Add the current state to history
    subject.history.push({
      oldSubject: {
        level: subject.level,
        semester: subject.semester,
        curriculum: { ...subject.curriculum }, // Deep clone to preserve old state
      },
      reason: latestProposition.reason || "No reason provided",
      submittedBy: latestProposition.submittedBy,
      validated: true,
      updatedAt: new Date(),
    });

    // Apply the changes from the proposition
    subject.level = latestProposition.changes.level || subject.level;
    subject.semester = latestProposition.changes.semester || subject.semester;
    subject.curriculum =
      latestProposition.changes.curriculum || subject.curriculum;

    // Remove all propositions after validating
    subject.propositions = [];

    // Save the updated subject
    await subject.save();

    res.status(200).json({
      message:
        "Proposition validated successfully, and old state added to history.",
      updatedSubject: subject,
    });
  } catch (error) {
    console.error("Error validating proposition:", error);
    res
      .status(500)
      .json({ error: "An error occurred while validating the proposition." });
  }
};

/////////////////////////////////SENT EVALUTION NOTIF FOR STUDENT/////////////////////////////////
export const sendEvaluationEmailsToStudent = async (req, res) => {
  try {
    const subjects = await Subject.find({
      isArchived: false,
      isPublished: true,
    }).populate("assignedStudent", "email firstName lastName");

    if (!subjects || subjects.length === 0) {
      return res.status(404).json({ error: "No subjects found." });
    }

    // Group subjects by student
    const studentMap = new Map();

    subjects.forEach((subject) => {
      subject.assignedStudent.forEach((student) => {
        const studentId = student._id.toString();

        // Check if student already evaluated this subject
        const alreadyEvaluated = subject.evaluations.some((evaluation) =>
          bcrypt.compareSync(studentId, evaluation.hashedStudentId)
        );

        if (!alreadyEvaluated) {
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              student,
              subjects: [],
            });
          }
          studentMap.get(studentId).subjects.push(subject);
        }
      });
    });

    const notifications = [];

    for (const { student, subjects } of studentMap.values()) {
      if (subjects.length === 0) continue; // Skip if no pending evaluations

      const subjectCards = subjects
        .map(
          (subject) => `
          <div style="
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          ">
            <h3 style="color: #0078FF; margin-bottom: 10px;">📘 ${subject.title}</h3>
            <p style="margin: 0;">This subject requires your evaluation.</p>
          </div>`
        )
        .join("");

      const studentToken = student._id;
      const evaluateLink = `https://evaluation-link.com/evaluate/${studentToken}`;

      const emailContent = generateEmailTemplate(
        "Evaluation Form",
        `<h2 style="color: #333;">Dear ${student.firstName} ${student.lastName},</h2>
         <p>Please take a moment to evaluate the following subjects:</p>`,
        `${subjectCards}
         <div style="text-align: center; margin-top: 30px;">
            <a href="${evaluateLink}" target="_blank" style="
              display: inline-block;
              padding: 15px 40px;
              font-size: 16px;
              color: white;
              text-decoration: none;
              background: linear-gradient(90deg, #0078FF, #4CAF50);
              border-radius: 5px;
              box-shadow: 0 4px 8px rgba(0, 120, 255, 0.3);
              font-weight: bold;">
              📝 Evaluate Now
            </a>
         </div>`
      );

      notifications.push(
        sendNotification({
          email: student.email,
          subject: "Subject Evaluation Request",
          htmlContent: emailContent,
          attachments: COMMON_ATTACHMENTS,
        })
      );
    }

    await Promise.all(notifications);

    res.status(200).json({ message: "Evaluation emails sent successfully." });
  } catch (error) {
    console.error("Error sending evaluation emails:", error);
    res
      .status(500)
      .json({ error: "An error occurred while sending evaluation emails." });
  }
};

//update subject

export const updateSubject = async (req, res) => {
  const { id } = req.params;
  const changes = req.body;
  const { userId } = req.auth;

  try {
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ error: "Subject not found." });
    }

    if (!changes || Object.keys(changes).length === 0) {
      return res
        .status(400)
        .json({ error: "No changes provided in the request body." });
    }

    const restrictedFields = ["progress", "history"];
    const attemptedRestrictedUpdate = Object.keys(changes).some((key) =>
      restrictedFields.includes(key)
    );

    if (attemptedRestrictedUpdate) {
      return res.status(400).json({
        error: "You cannot modify 'progress' or 'history' fields directly.",
      });
    }

    const previousState = {};
    for (const key of Object.keys(changes)) {
      if (subject[key] !== undefined) {
        previousState[key] = subject[key];
      }
    }

    subject.history.push({
      oldSubject: previousState,
      reason: changes.reason || "Subject modified by Admin",
      submittedBy: userId,
      validated: true,
      date: new Date(),
    });

    for (const key of Object.keys(changes)) {
      if (
        key === "assignedStudent" &&
        (!changes[key] || changes[key].length === 0)
      ) {
        const query = { level: Number(subject.level) };

        if (Number(subject.level) === 2 || Number(subject.level) === 3) {
          if (!subject.option) {
            return res
              .status(400)
              .json({ error: "Option is required to auto-fill students." });
          }
          query.affectedOption = subject.option;
        }

        const students = await Student.find(query).select("_id");
        subject.assignedStudent = students.map((s) => s._id);
      } else if (key !== "reason") {
        subject[key] = changes[key];
      }
    }

    await subject.save();

    res.status(200).json({
      message: "Subject updated successfully.",
      updatedSubject: subject,
    });
  } catch (error) {
    console.error("Error updating subject:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the subject." });
  }
};

// DELETE subject (with archive fallback if assigned to a teacher)
export const deleteSubject = async (req, res) => {
  const { id } = req.params;
  const { archive } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid subject ID." });
    }

    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    const isAssignedToTeacher = !!subject.assignedTeacher;

    if (isAssignedToTeacher) {
      if (archive === true) {
        // Save a snapshot in the archive array
        subject.archive.push({
          year: subject.year,
          assignedTeacher: subject.assignedTeacher,
          assignedStudent: subject.assignedStudent,
          curriculum: subject.curriculum,
        });

        // Flag the subject as archived && unpublished
        subject.isArchived = true;
        subject.isPublished = false;

        // DO NOT wipe the original fields — preserve them
        await subject.save();
        return res
          .status(200)
          .json({ message: "Subject archived instead of deleted." });
      } else {
        return res.status(400).json({
          message:
            "Cannot delete the subject because it is linked to a teacher.",
        });
      }
    }

    // If not assigned, delete normally
    await Subject.findByIdAndDelete(id);
    res.status(200).json({ message: "Subject deleted successfully." });
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getArchivedSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ isArchived: true })
      .populate("assignedTeacher", "firstName lastName")
      .populate("assignedStudent", "firstName lastName")
      .lean();

    res.status(200).json({ archivedSubjects: subjects });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch archived subjects." });
  }
};

// Restore Subject (updated to accept publish param from frontend)
export const restoreSubject = async (req, res) => {
  const { id } = req.params;
  const { publish } = req.body; // boolean to set isPublished

  try {
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    if (!subject.isArchived) {
      return res.status(400).json({ message: "Subject is not archived." });
    }

    subject.isArchived = false;
    subject.isPublished = publish ?? false; // default to false if publish is undefined

    await subject.save();

    res.status(200).json({ message: "Subject restored successfully." });
  } catch (error) {
    console.error("Restore error:", error);
    res.status(500).json({ message: "Failed to restore subject." });
  }
};

export const getStudentsByLevelAndOption = async (req, res) => {
  try {
    const { level, option } = req.query;

    if (!level) {
      return res.status(400).json({ message: "Level is required." });
    }

    const query = { level: Number(level) };

    if (Number(level) === 2 || Number(level) === 3) {
      if (!option) {
        return res
          .status(400)
          .json({ message: "Option is required for level 2 or 3." });
      }
      query.affectedOption = option;
    }

    const students = await Student.find(query).select(
      "_id firstName lastName email"
    );

    res.status(200).json(students);
  } catch (err) {
    console.error("Error fetching students by level/option:", err);
    res.status(500).json({ message: "Server error." });
  }
};

////////////////// get subject by id /////////////////////////
export const getSubjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const subject = await Subject.findById(id)
      .populate("assignedTeacher", "firstName lastName email")
      .populate("assignedStudent", "firstName lastName email")
      .populate("propositions.submittedBy", "firstName lastName email");

    if (!subject) {
      return res.status(404).json({ error: "Subject not found." });
    }

    res.status(200).json({ subject });
  } catch (error) {
    console.error("Error fetching full subject:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the subject." });
  }
};
