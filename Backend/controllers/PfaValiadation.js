import PFA from "../models/Pfa.js";
import mongoose from "mongoose";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import { sendNotification } from "../notifyWithMail/mailNotif.js";
import { generateEmailTemplate } from "../notifyWithMail/notifTemplate.js";

export const sendPFAValidation = async (req, res) => {
  const { Link, emailType } = req.body;

  // Validate input
  if (!Link || !emailType || !["premier", "modifié"].includes(emailType)) {
    return res.status(400).json({
      error: "Invalid input: emailType must be 'premier' or 'modifié'.",
    });
  }

  try {
    // Fetch emails of students and teachers
    const students = await Student.find({}, "email firstName lastName");
    const teachers = await Teacher.find({}, "email firstName lastName");

    if (students.length === 0 && teachers.length === 0) {
      return res.status(404).json({ error: "No students or teachers found." });
    }

    // Define email subject and content based on emailType
    let subject = "Validated PFA Topics";
    let emailBodyContent;

    if (emailType === "premier") {
      emailBodyContent = `
        <p>Hello,</p>
        <p>The following PFA topic are validated. You can view them by clicking on the link below:</p>
        <a href="${Link}" style="color: #0078FF; text-decoration: none;">${Link}</a>
        <p>Best regards,</p>
        <p>The ISAMM Team.</p>
      `;
    } else if (emailType === "modifié") {
      emailBodyContent = `
        <p>Hello,</p>
        <p>The PFA topics validation have been updated. You can view the updated list by clicking on the link below:</p>
        <a href="${Link}" style="color: #0078FF; text-decoration: none;">${Link}</a>
        <p>Best regards,</p>
        <p>The ISAMM Team.</p>
      `;
    }

    // Prepare notifications for students
    const notifications = [];

    // Add students to notifications
    students.forEach((student) => {
      const studentEmailContent = generateEmailTemplate(
        subject,
        `<h2>Dear ${student.firstName} ${student.lastName},</h2>`,
        emailBodyContent
      );

      notifications.push(
        sendNotification({
          email: student.email,
          subject,
          htmlContent: studentEmailContent,
        })
      );
    });

    // Add teachers to notifications
    teachers.forEach((teacher) => {
      const teacherEmailContent = generateEmailTemplate(
        subject,
        `<h2>Dear ${teacher.firstName} ${teacher.lastName},</h2>`,
        emailBodyContent
      );

      notifications.push(
        sendNotification({
          email: teacher.email,
          subject,
          htmlContent: teacherEmailContent,
        })
      );
    });

    // Send all notifications
    await Promise.all(notifications);
    res.status(200).json({ message: "PFA topics link sent successfully." });
  } catch (error) {
    console.error("Error sending emails:", error);
    res
      .status(500)
      .json({ error: "An error occurred while sending the emails." });
  }
};

export const listChoicesByStudent = async (req, res) => {
  try {
    // Requête pour récupérer tous les PFAs avec les choix des étudiants
    const pfas = await PFA.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "choices.student",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      {
        $unwind: "$choices", // Diviser les choix pour chaque étudiant
      },
      {
        $lookup: {
          from: "students",
          localField: "choices.student",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      {
        $unwind: "$studentInfo", // Détail de chaque étudiant
      },
      {
        $group: {
          _id: "$choices.student", // Grouper par étudiant
          studentName: {
            $first: {
              $concat: ["$studentInfo.firstName", " ", "$studentInfo.lastName"],
            },
          },
          choices: {
            $push: {
              subjectId: "$_id",
              subjectTitle: "$title",
              priority: "$choices.priority",
              acceptedByTeacher: "$choices.acceptedByTeacher",
              validation: { $ifNull: ["$choices.validation", false] }, // Assigner false par défaut si validation est absent
            },
          },
        },
      },
      {
        $project: {
          _id: 0, // Ne pas inclure l'ID
          studentId: "$_id",
          studentName: 1,
          choices: 1,
        },
      },
    ]);

    if (!pfas.length) {
      return res.status(404).json({
        message: "No student choices found.",
      });
    }

    // Retourner la liste des choix par étudiant
    res.status(200).json({
      message: "List of choices by student retrieved successfully.",
      data: pfas,
    });
  } catch (error) {
    console.error("Error fetching choices by student:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const autoAssignPFAS = async (req, res) => {
  try {
    const { pfaIds } = req.body;

    if (!pfaIds || !Array.isArray(pfaIds) || pfaIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Please provide at least one PFA ID." });
    }

    // Vérifier si chaque ID est valide
    const invalidIds = pfaIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      return res.status(400).json({
        error: `Invalid PFA IDs provided: ${invalidIds.join(
          ", "
        )}. Please provide valid PFA IDs.`,
      });
    }

    // Récupérer tous les PFAs par ID
    const pfas = await PFA.find({ _id: { $in: pfaIds } });

    if (!pfas.length) {
      return res
        .status(404)
        .json({ error: "No PFAs found with the provided IDs." });
    }

    const errors = [];
    const successes = [];

    for (let pfa of pfas) {
      if (pfa.status !== "published") {
        errors.push({
          pfaId: pfa._id,
          title: pfa.title,
          message: "PFA is not published yet.",
        });
        continue;
      }

      if (!pfa.choices || pfa.choices.length === 0) {
        errors.push({
          pfaId: pfa._id,
          title: pfa.title,
          message: "No validation, no student has selected this subject.",
        });
        continue;
      }

      const choicesStatus = [];
      let hasPriority1Assigned = false;
      let hasError = false;

      for (let choice of pfa.choices) {
        console.log(
          `Processing choice for student ${choice.student} - AcceptedByTeacher: ${choice.acceptedByTeacher}`
        );

        if (choice.acceptedByTeacher === false) {
          // If the teacher has not accepted the choice
          errors.push({
            pfaId: pfa._id,
            title: pfa.title,
            student: choice.student,
            message: "PFA not accepted by the teacher, validation failed.",
          });
          hasError = true;
        } else if (choice.priority === 1) {
          // Check if the student is already assigned to another PFA with priority 1
          const conflictingPfa = await PFA.findOne({
            "choices.student": choice.student,
            "choices.priority": 1,
            _id: { $ne: pfa._id }, // Exclude the current PFA from the search
          });

          if (conflictingPfa) {
            // If the student is already assigned with priority 1 to another PFA
            errors.push({
              pfaId: pfa._id,
              title: pfa.title,
              student: choice.student,
              message:
                "Student is already assigned to another PFA with priority 1.",
            });
            hasError = true;
            continue;
          }

          // Priority 1 - accepted and validated
          if (choice.validation) {
            // Already validated (i.e., already assigned)
            errors.push({
              pfaId: pfa._id,
              title: pfa.title,
              student: choice.student,
              message: "Already assigned to this PFA with priority 1.",
            });
            hasError = true;
          } else {
            // Assign and validate this choice
            choice.validation = true;

            // Add student to the validated list if validation is true
            if (!pfa.Students.includes(choice.student)) {
              pfa.Students.push(choice.student);
              console.log(
                `Added student ${choice.student} to PFA Students array`
              );
            }

            choicesStatus.push({
              student: choice.student,
              priority: choice.priority,
              validation: choice.validation,
              message: "Validation successful for priority 1.",
            });
            hasPriority1Assigned = true;
          }
        } else if (choice.priority === 2 || choice.priority === 3) {
          // For priority 2 or 3, no automatic validation
          choicesStatus.push({
            student: choice.student,
            priority: choice.priority,
            validation: choice.validation || false,
            message: "No automatic validation for priority 2 or 3.",
          });
        } else {
          // For other priorities (in case there are any)
          choicesStatus.push({
            student: choice.student,
            priority: choice.priority,
            validation: choice.validation || false,
            message: "Will be processed in the next step.",
          });
        }
      }

      // If no errors, save the updated PFA
      if (!hasError) {
        console.log("Saving PFA with updated validation and students...");
        const updatedPfa = await pfa.save(); // Save changes to the PFA
        console.log("PFA saved:", updatedPfa);

        if (hasPriority1Assigned) {
          successes.push({
            pfaId: pfa._id,
            title: pfa.title,
            choicesStatus,
          });
        }
      }
    }

    // Return response based on errors and successes
    if (errors.length > 0 && successes.length === 0) {
      return res.status(400).json({
        message: "Automatic assignment failed for some PFAs.",
        errors,
      });
    }

    if (errors.length > 0 && successes.length > 0) {
      return res.status(206).json({
        message:
          "Partial success: Some PFAs were processed, but others failed.",
        successes,
        errors,
      });
    }

    return res.status(200).json({
      message: "All PFAs processed successfully.",
      successes,
    });
  } catch (error) {
    console.error("Error during assignment and validation:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const publishOrUnpublishAllPFAs = async (req, res) => {
  try {
    const { response } = req.params; // Prendre la valeur depuis l'URL

    // Validation de l'entrée
    if (response !== "true" && response !== "false") {
      return res.status(400).json({
        error: "Response must be 'true' (to publish) or 'false' (to hide).",
      });
    }

    // Conversion de la chaîne en booléen
    const isPublishing = response === "true";
    const updatedStatus = isPublishing ? "published" : "hidden";

    // Mise à jour en masse
    const updateResult = await PFA.updateMany(
      {}, // Tous les PFAs
      { affectationStatus: updatedStatus } // Mettre à jour le champ `affectationStatus`
    );

    // Vérification du nombre de PFAs mis à jour
    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ error: "No PFAs found to update." });
    }

    // Réponse de succès
    res.status(200).json({
      message: isPublishing
        ? "All PFAs have been published successfully."
        : "All PFAs have been hidden successfully.",
      updatedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error(
      "Error while updating affectationStatus for all PFAs:",
      error
    );
    res.status(500).json({ error: "Internal server error." });
  }
};

export const assignManuallyPfa = async (req, res) => {
    try {
      const { id: pfaId, studentId } = req.params;
      const { force } = req.body; // Force option to reassign even if the student already has an assigned PFA
  
      // Vérification des paramètres requis
      if (!pfaId || !studentId) {
        return res
          .status(400)
          .json({ error: "PFA ID and Student ID are required." });
      }
  
      // Vérification si l'étudiant existe
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found." });
      }
  
      // Vérification si le PFA existe
      const pfa = await PFA.findById(pfaId);
      if (!pfa) {
        return res.status(404).json({ error: "PFA not found." });
      }
  
      // Vérifier si l'étudiant a déjà un PFA affecté
      const studentChoice = pfa.choices.find(
        (choice) => choice.student.toString() === studentId && choice.validation === true
      );
  
      // Si force est false et que l'étudiant a déjà un PFA affecté, retourner une erreur
      if (!force && studentChoice) {
        return res
          .status(400)
          .json({ error: "Student is already assigned to this PFA." });
      }
  
      // Si force est true, on doit retirer l'étudiant de l'ancien PFA
      if (force && studentChoice) {
        const oldPfa = await PFA.findOne({
          "choices.student": studentId,
          "choices.validation": true,
        });
  
        if (oldPfa) {
          console.log("Old PFA found:", oldPfa.title || oldPfa._id);
  
          // Retirer l'étudiant de la liste des choix
          oldPfa.choices = oldPfa.choices.filter(
            (choice) => choice.student.toString() !== studentId
          );
  
          // Retirer l'étudiant de la liste des étudiants assignés (Students[])
          oldPfa.Students = oldPfa.Students.filter(
            (student) => student.toString() !== studentId
          );
  
          // Sauvegarder les modifications
          await oldPfa.save();
        } else {
          console.warn(`No old PFA found for studentId ${studentId}`);
        }
      }
  
      // Ajouter ou mettre à jour le choix dans le PFA actuel
      const existingChoice = pfa.choices.find(
        (choice) => choice.student.toString() === studentId
      );
      if (existingChoice) {
        existingChoice.validation = true;
        existingChoice.acceptedByTeacher = true;
      } else {
        pfa.choices.push({
          student: studentId,
          priority: 1, // Priorité par défaut
          acceptedByTeacher: true, // L'enseignant accepte le choix
          validation: true, // Validation de l'affectation
        });
      }
  
      // Ajouter l'étudiant à la liste des étudiants assignés dans Students[]
      pfa.Students.push(studentId);
  
      // Sauvegarder le PFA mis à jour
      await pfa.save();
  
      res.status(200).json({
        message: `Student successfully assigned to PFA with force=${force}.`,
        student: { firstName: student.firstName, lastName: student.lastName },
        pfa: pfa.title,
      });
    } catch (error) {
      console.error("Error during PFA assignment:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  };
  
  
  
