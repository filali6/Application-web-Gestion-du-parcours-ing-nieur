import PFA from "../models/Pfa.js";
import Period from "../models/Period.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import CV from "../models/cv.js";

import { sendEmail } from "../notifyWithMail/sendMailPFA.js";

/**
 * Helper function: Check active period
 */

const GetActivePeriod = async () => {
  const currentDate = new Date();
  const period = await Period.findOne({
    StartDate: { $lte: currentDate },
    EndDate: { $gte: currentDate },
    type: "pfa",
  });
  return period;
};
const getActivePeriod = async () => {
  const currentDate = new Date();
  const activePeriod = await Period.findOne({
    StartDate: { $lte: currentDate },
    EndDate: { $gte: currentDate },
    type: "pfa",
  });

  if (!activePeriod) {
    const futurePeriod = await Period.findOne({
      StartDate: { $gt: currentDate },
    });
    if (futurePeriod) {
      throw new Error("Submission period has not started yet.");
    }

    const pastPeriod = await Period.findOne({ EndDate: { $lt: currentDate } });
    if (pastPeriod) {
      throw new Error(
        "Submission period is over. You have missed the deadline."
      );
    }
  }

  return activePeriod;
};

/**
 * Helper function: Validate ownership of a PFA
 */
const validateOwnership = async (pfaId, teacherId) => {
  const pfa = await PFA.findById(pfaId);
  if (!pfa) {
    throw new Error("Subject not found.");
  }
  if (pfa.teacher.toString() !== teacherId) {
    throw new Error("You only have access to your own subjects. ");
  }
  return pfa;
};

/**
 * Add multiple PFAs 2.1
 */
export const addMultiplePfas = async (req, res) => {
  try {
    const { pfas } = req.body; // Extract the PFAs from the request body
    const teacherId = req.auth.userId; // Get the teacher's ID from the authenticated request

    // Validate that PFAs are provided and in the correct format
    if (!pfas || !Array.isArray(pfas) || pfas.length === 0) {
      return res.status(400).json({ error: "No subjects provided." });
    }

    let period;
    try {
      // Get the currently active period
      period = await getActivePeriod();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const newPfas = []; // Array to store validated and constructed PFAs

    for (const pfa of pfas) {
      const {
        title,
        description,
        technologies,
        mode,
        Students = [],
        year,
      } = pfa;

      // Check required fields
      if (!title || !description || !mode || !year) {
        return res.status(400).json({
          error: `Subject "${
            title || "unknown"
          }" must have a title, description, mode, and year.`,
        });
      }

      // Validate the mode (must be monome or binome)
      if (!["monome", "binome"].includes(mode)) {
        return res.status(400).json({
          error: `Invalid mode for subject "${title}". Must be 'monome' or 'binome'.`,
        });
      }

      // Validate and process student IDs if provided
      if (Students.length > 0) {
        const invalidStudents = [];
        const uniqueStudentIds = new Set(Students); // Use a Set to avoid duplicates

        for (const studentId of uniqueStudentIds) {
          const student = await Student.findById(studentId); // Check if the student exists in the database
          if (!student) {
            invalidStudents.push(studentId);
          }
        }

        if (invalidStudents.length > 0) {
          return res.status(400).json({
            error: `The following student IDs are invalid: ${invalidStudents.join(
              ", "
            )}`,
          });
        }

        // Check for duplicate assignments
        const assignedStudents = await PFA.find({
          Students: { $in: Students },
        });
        console.log("assignedStudents", assignedStudents);
        if (assignedStudents.length > 0) {
          // Collect all assigned student IDs
          const assignedStudentIds = assignedStudents.flatMap(
            (pfa) => pfa.Students
          );

          return res.status(400).json({
            error: `Some students are already assigned to other subjects: ${assignedStudentIds.join(
              ", "
            )}`,
          });
        }
      }

      // Validate student count based on mode
      if (mode === "binome") {
        if (Students.length > 2) {
          return res.status(400).json({
            error: `Subject "${title}" requires exactly 2 students for binome mode.`,
          });
        }

        if (Students.length === 2 && Students[0] === Students[1]) {
          return res.status(400).json({
            error: `Subject "${title}" cannot have the same student twice in binome mode.`,
          });
        }
      }

      if (mode === "monome" && Students.length > 1) {
        return res.status(400).json({
          error: `Subject "${title}" requires exactly 1 student for monome mode.`,
        });
      }

      // Validate the year
      const currentYear = new Date().getFullYear();
      if (typeof year !== "number" || year < 2000 || year > currentYear + 1) {
        return res.status(400).json({
          error: `Invalid year for subject "${title}". Year must be between 2000 and ${
            currentYear + 1
          }.`,
        });
      }

      // Construct the PFA object for insertion
      newPfas.push({
        title,
        description,
        technologies: technologies || [],
        mode,
        year,
        teacher: teacherId,
        Students,
      });
    }

    // Insert the PFAs into the database
    const insertedPfas = await PFA.insertMany(newPfas);

    // Mise à jour des CVs des étudiants
    for (const pfa of insertedPfas) {
      for (const studentId of pfa.Students) {
        // Mettre à jour l'association du PFA dans le CV de l'étudiant
        await CV.updateOne(
          { student: studentId },
          { $set: { pfa: pfa._id } }, // Mettre à jour l'association avec le PFA
          { upsert: true } // Créer un CV si l'étudiant n'en a pas
        );
      }
    }

    res.status(201).json({
      message: "Subjects added successfully.",
      pfas: insertedPfas,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//2.2
export const updateMyPfa = async (req, res) => {
  try {
    const teacherId = req.auth.userId; // Get the teacher's ID from the authenticated request
    const { id } = req.params; // Extract the PFA ID from the request parameters
    const {
      title,
      description,
      technologies,
      mode,
      Students = [],
      year,
    } = req.body; // Extract the updated data from the request body

    // Validate ownership of the PFA
    const pfa = await validateOwnership(id, teacherId);

    let period;
    try {
      // Check if the period is active
      period = await getActivePeriod();
    } catch (error) {
      // If period check fails, restrict updates to the Students field
      if (title || description || technologies || mode || year) {
        return res.status(400).json({
          error: `Submission period is closed. Only updates to the Students field are allowed.`,
        });
      }
    }
    const currentMode = mode || pfa.mode;
    const currenttitle = title || pfa.title;

    // Validate the mode (must be monome or binome)
    if (!["monome", "binome"].includes(currentMode)) {
      return res.status(400).json({
        error: `Invalid mode for subject "${title}". Must be 'monome' or 'binome'.`,
      });
    }
    // Validate student IDs if Students are provided
    if (Students.length > 0) {
      const invalidStudents = [];
      const uniqueStudentIds = new Set(Students); // Use a Set to avoid duplicates

      for (const studentId of uniqueStudentIds) {
        const student = await Student.findById(studentId); // Check if the student exists in the database
        if (!student) {
          invalidStudents.push(studentId);
        }
      }

      if (invalidStudents.length > 0) {
        return res.status(400).json({
          error: `The following student IDs are invalid: ${invalidStudents.join(
            ", "
          )}`,
        });
      }

      // Check for duplicate assignments
      const assignedStudents = await PFA.find({ Students: { $in: Students } });
      console.log("assignedStudents", assignedStudents);
      if (assignedStudents.length > 0) {
        // Collect all assigned student IDs
        const assignedStudentIds = assignedStudents.flatMap(
          (pfa) => pfa.Students
        );

        return res.status(400).json({
          error: `Some students are already assigned to other subjects: ${assignedStudentIds.join(
            ", "
          )}`,
        });
      }
    }

    // Validate student count based on mode
    if (currentMode === "binome") {
      if (Students.length !== 2 && Students.length !== 0) {
        return res.status(400).json({
          error: `Subject "${currenttitle}" requires exactly 2 students for binome mode.`,
        });
      }

      // Check if the two student IDs are the same
      if (Students[0] === Students[1]) {
        return res.status(400).json({
          error: `Subject "${currenttitle}" cannot have the same student twice in binome mode.`,
        });
      }
    }
    if (
      currentMode === "monome" &&
      Students.length !== 1 &&
      Students.length !== 0
    ) {
      return res.status(400).json({
        error: `Monome mode allows only 1 student.`,
      });
    }

    // Validate the year if provided
    const currentYear = new Date().getFullYear();
    if (
      year &&
      (typeof year !== "number" || year < 2000 || year > currentYear + 1)
    ) {
      return res.status(400).json({
        error: `Invalid year. Year must be between 2000 and ${
          currentYear + 1
        }.`,
      });
    }

    // Update fields if the period is active
    if (period) {
      if (title) pfa.title = title;
      if (description) pfa.description = description;
      if (technologies) pfa.technologies = technologies;
      if (mode) pfa.mode = mode;
      if (year) pfa.year = year;
    }

    // Always update the Students field
    if (Students.length > 0 || Students.length === 0) {
      pfa.Students = Students;
    }

    // Save the changes to the database
    const updatedPfa = await pfa.save();

    // Mise à jour des CVs des étudiants
    for (const studentId of Students) {
      // Mettre à jour l'association du PFA dans le CV de l'étudiant
      await CV.updateOne(
        { student: studentId },
        { $set: { pfa: updatedPfa._id } }, // Mettre à jour l'association avec le PFA
        { upsert: true } // Créer un CV si l'étudiant n'en a pas
      );
    }
    // Si les étudiants sont supprimés (Students est vide), désassocier le PFA des étudiants dans leurs CV
    if (Students.length === 0) {
      await CV.updateMany(
        { pfa: updatedPfa._id },
        { $unset: { pfa: 1 } } // Désassocier le PFA des CV des étudiants
      );
    }

    res.status(200).json({
      message: "PFA updated successfully.",
      pfa: updatedPfa,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all PFAs for the logged-in teacher
 */
export const getMyPfas = async (req, res) => {
  try {
    const teacherId = req.auth.userId;
    const myPfas = await PFA.find({ teacher: teacherId })
      .populate({
        path: "Students",
        select: "firstName lastName",
      })
      .populate({
        path: "choices.student",
        select: "firstName lastName",
      })
      .lean();

    if (!myPfas.length) {
      return res
        .status(404)
        .json({ error: "No subjects found for this teacher." });
    }

    res.status(200).json({ pfas: myPfas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get a specific PFA by ID
 */
export const getMyPfaById = async (req, res) => {
  try {
    const teacherId = req.auth.userId;
    const { id } = req.params;

    const pfa = await validateOwnership(id, teacherId);
    res.status(200).json({ pfa });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

/**
 * Delete a PFA
 */
export const deleteMyPfa = async (req, res) => {
  try {
    const teacherId = req.auth.userId;
    const { id } = req.params;

    const pfa = await validateOwnership(id, teacherId);

    let period;
    try {
      period = await getActivePeriod();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
    if (!period) {
      return res
        .status(400)
        .json({ error: "Submission deadline exceeded. Deletion not allowed." });
    }

    await pfa.deleteOne();
    res.status(200).json({ message: "Subject deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectPfa = async (req, res) => {
  try {
    const { id } = req.params;
    const pfa = await PFA.findById(id);
    const activePeriod = await GetActivePeriod();
    if (activePeriod) {
      return res.status(400).json({
        error: "The deposit period has not ended yet.",
      });
    }

    if (!pfa) {
      return res.status(404).json({ error: "PFA not found." });
    }

    pfa.status = "rejected";

    await pfa.save();
    res.status(200).json({ message: "PFA rejected successfully.", pfa });
  } catch (error) {
    res.status(500).json({ error: "Internal error while rejecting the PFA." });
  }
};

const sendPfaEmail = async (isSecondSend, pfaLink) => {
  const subject = isSecondSend
    ? "Updated PFA Topics Available"
    : "New PFA Topics Available";

  const headerContent = `<h2>Dear All,</h2>
                           <p>We are pleased to inform you that the PFA topics are now ${
                             isSecondSend ? "updated" : "available"
                           }. Please review the topics at the following link:</p>`;

  const bodyContent = `<p style="font-size: 16px;">Click the link below to view the updated topics:</p>
                         <p><a href="${pfaLink}" target="_blank" style="color: #0078FF;">View Topics</a></p>`;

  const emailResults = await sendEmailToStudentsAndTeachers(
    subject,
    headerContent,
    bodyContent
  );

  if (!isSecondSend) {
    await updatePfaEmailSentStatus();
  }

  return emailResults;
};

// Function to send emails to students and teachers
const sendEmailToStudentsAndTeachers = async (
  subject,
  headerContent,
  bodyContent
) => {
  const students = await Student.find({ level: 2 });
  const teachers = await Teacher.find();
  const emailResults = [];

  for (let student of students) {
    const result = await sendEmail(
      student.email,
      subject,
      headerContent,
      bodyContent
    );
    emailResults.push({
      email: student.email,
      success: result.success,
      error: result.error,
    });
  }

  for (let teacher of teachers) {
    const result = await sendEmail(
      teacher.email,
      subject,
      headerContent,
      bodyContent
    );
    emailResults.push({
      email: teacher.email,
      success: result.success,
      error: result.error,
    });
  }

  return emailResults;
};

const updatePfaEmailSentStatus = async () => {
  await PFA.updateMany(
    { status: { $in: ["published", "hidden", "pending"] }, emailSent: false },
    { $set: { emailSent: true } }
  );
};

const updatePfaStatus = async (pfas, status, additionalFields = {}) => {
  const pfaIds = pfas.map((pfa) => pfa._id);
  await PFA.updateMany(
    { _id: { $in: pfaIds } },
    { $set: { status, ...additionalFields } }
  );
  return await PFA.find({ _id: { $in: pfaIds } });
};

const createPeriod = async ({ StartDate, EndDate, type }) => {
  if (new Date(StartDate) >= new Date(EndDate)) {
    return {
      success: false,
      message: "Start date must be earlier than end date.",
    };
  }

  const existing = await checkExistingPeriod(type, StartDate, EndDate);
  if (existing) {
    return {
      success: false,
      message: `A period of type ${type} already exists during this time frame.`,
    };
  }

  const newPeriod = new Period({ StartDate, EndDate, type });
  await newPeriod.save();
  return { success: true, period: newPeriod };
};

const updatePeriod = async ({ StartDate, EndDate }, id) => {
  const period = await Period.findById(id);
  if (!period) {
    return { success: false, message: "Period not found." };
  }

  if (StartDate && new Date(StartDate) >= new Date(period.EndDate)) {
    return {
      success: false,
      message: "Start date must be earlier than end date.",
    };
  }

  if (EndDate && new Date(EndDate) <= new Date(period.StartDate)) {
    return {
      success: false,
      message: "End date must be later than start date.",
    };
  }

  Object.assign(period, { StartDate, EndDate });
  await period.save();
  return { success: true, period };
};

const checkExistingPeriod = async (type, StartDate, EndDate) => {
  return await Period.findOne({
    type,
    $or: [
      {
        StartDate: { $lte: new Date(EndDate) },
        EndDate: { $gte: new Date(StartDate) },
      },
      {
        StartDate: { $gte: new Date(StartDate) },
        EndDate: { $lte: new Date(EndDate) },
      },
    ],
  });
};

const fetchPfasToUpdate = async (response) => {
  const statuses =
    response === "true" ? ["pending", "hidden"] : ["published", "pending"];
  return await PFA.find({ status: { $in: statuses } });
};

export const publishPFA = async (req, res) => {
  try {
    const { response } = req.params;
    const { StartDate, EndDate } = req.body;

    if (!["true", "false"].includes(response)) {
      return res
        .status(400)
        .json({ error: "Response must be 'true' or 'false'." });
    }
    const period = await GetActivePeriod();
    if (period) {
      return res
        .status(400)
        .json({ error: "The deposit period has not ended yet." });
    }

    const pfasToUpdate = await fetchPfasToUpdate(response);
    if (!pfasToUpdate.length && !(StartDate && EndDate)) {
      return res.status(404).json({ error: "No PFA found to update." });
    }

    let periodResponse;
    if (StartDate && EndDate) {
      const existingPeriod = await checkExistingPeriod(
        "choicePFA",
        StartDate,
        EndDate
      );
      periodResponse = existingPeriod
        ? await updatePeriod({ StartDate, EndDate }, existingPeriod.id)
        : await createPeriod({ StartDate, EndDate, type: "choicePFA" });

      if (!periodResponse.success) {
        return res.status(400).json({ error: periodResponse.message });
      } else if (periodResponse.success && pfasToUpdate.length == 0) {
        return res.status(200).json({
          message: periodResponse.message,
          period: periodResponse.period,
        });
      }
    }

    if (response === "true") {
      const updatedPfas = await updatePfaStatus(pfasToUpdate, "published", {
        periodChoice: periodResponse?.period?.id,
      });
      const isSecondSend = await PFA.findOne({
        emailSent: true,
        stutus: { $ne: "rejected" },
      });
      const emailResults = await sendPfaEmail(
        isSecondSend,
        "http://ISAMM.com/pfa-list"
      );
      const pfaAlferPublished = await getAllPFEPublished();
      return res.status(200).json({
        message: "PFAs published successfully.",
        choicePeriod: periodResponse
          ? periodResponse.period
          : "vous n'avez pas modfier/fournie une periode de choix",
        pfas: pfaAlferPublished,
        emailResults,
      });
    }

    const hiddenPfas = await updatePfaStatus(pfasToUpdate, "hidden");
    const isSecondSend = await PFA.findOne({
      emailSent: true,
      stutus: { $ne: "rejected" },
    });
    const emailResults = await sendPfaEmail(
      isSecondSend,
      "http://ISAMM.com/pfa-list"
    );
    const pfaAlferPublished = await getAllPFEPublished();
    return res.status(200).json({
      message: "PFAs hidden successfully.",
      choicePeriod: periodResponse
        ? periodResponse.period
        : "You have not modified/provided a choice period.",
      pfas: pfaAlferPublished,
      emailResults,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal error while publishing or hiding PFA." });
  }
};
//4.1
export const listPFAByTeacher = async (req, res) => {
  try {
    const result = await PFA.aggregate([
      { $match: { status: "published" } },
      {
        $lookup: {
          from: "teachers",
          localField: "teacher",
          foreignField: "_id",
          as: "teacherDetails",
        },
      },
      {
        $lookup: {
          from: "periods",
          localField: "period",
          foreignField: "_id",
          as: "periodDetails",
        },
      },
      {
        $lookup: {
          from: "periods",
          localField: "periodChoice",
          foreignField: "_id",
          as: "periodChoiceDetails",
        },
      },
      // Récupère les infos COMPLÈTES des étudiants assignés (Students)
      {
        $lookup: {
          from: "students",
          localField: "Students",
          foreignField: "_id",
          as: "studentsFullDetails",
        },
      },
      // Récupère les infos COMPLÈTES des étudiants ayant fait des choix (choices.student)
      {
        $lookup: {
          from: "students",
          localField: "choices.student",
          foreignField: "_id",
          as: "choicesStudentsFullDetails",
        },
      },
      {
        $group: {
          _id: "$teacher",
          firstName: { $first: "$teacherDetails.firstName" },
          lastName: { $last: "$teacherDetails.lastName" },
          nbSujets: { $sum: 1 },
          sujets: {
            $push: {
              _id: "$_id",
              title: "$title",
              description: "$description",
              mode: "$mode",
              status: "$status",
              // Étudiants assignés (avec nom/prénom)
              students: {
                $map: {
                  input: "$studentsFullDetails",
                  as: "student",
                  in: {
                    _id: "$$student._id",
                    firstName: "$$student.firstName",
                    lastName: "$$student.lastName",
                  },
                },
              },
              emailSent: "$emailSent",
              dateDeposit: {
                StartDateDeposit: {
                  $arrayElemAt: ["$periodDetails.StartDate", 0],
                },
                EndDateDeposit: { $arrayElemAt: ["$periodDetails.EndDate", 0] },
              },
              dateChoice: {
                StartPeriodChoice: {
                  $arrayElemAt: ["$periodChoiceDetails.StartDate", 0],
                },
                EndPeriodChoice: {
                  $arrayElemAt: ["$periodChoiceDetails.EndDate", 0],
                },
              },
              // Choix avec infos complètes des étudiants
              choices: {
                $map: {
                  input: "$choices",
                  as: "choice",
                  in: {
                    // Garde les infos originales du choix
                    priority: "$$choice.priority",
                    acceptedByTeacher: "$$choice.acceptedByTeacher",
                    // Ajoute les infos de l'étudiant
                    student: {
                      $mergeObjects: [
                        { _id: "$$choice.student" },
                        {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$choicesStudentsFullDetails",
                                as: "stu",
                                cond: {
                                  $eq: ["$$stu._id", "$$choice.student"],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      { $sort: { nbSujets: -1 } },
    ]);

    if (!result.length) {
      return res
        .status(404)
        .json({ message: "No teachers or subjects found." });
    }

    res.status(200).json({
      message: "Subjects listed successfully by teacher.",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching subjects by teacher:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getActiveChoicePeriod = async () => {
  const currentDate = new Date();
  const activePeriod = await Period.findOne({
    StartDate: { $lte: currentDate },
    EndDate: { $gte: currentDate },
    type: "choicePFA",
  });

  if (!activePeriod) {
    const futurePeriod = await Period.findOne({
      StartDate: { $gt: currentDate },
    });
    if (futurePeriod) {
      throw new Error("Choice period has not started yet.");
    }

    const pastPeriod = await Period.findOne({ EndDate: { $lt: currentDate } });
    if (pastPeriod) {
      throw new Error("Choice period is over. You have missed the deadline.");
    }
  }

  return activePeriod;
};
const getAllPFEPublished = async () => {
  return await PFA.find({ status: "published" });
};

//5.1

export const selectPfaChoice = async (req, res) => {
  try {
    const { id } = req.params; // ID du PFA
    const { priority, acceptedByTeacher, binomeId } = req.body;

    // Vérifier si la période de choix est active
    await getActiveChoicePeriod();

    // Récupérer l'ID de l'étudiant authentifié
    const studentId = req.auth.userId;
    if (!studentId) {
      return res
        .status(401)
        .json({ error: "Unauthorized. Student not authenticated." });
    }

    // Validation des données
    if (priority === undefined || acceptedByTeacher === undefined) {
      return res.status(400).json({
        error: "priority and acceptedByTeacher are required.",
      });
    }

    if (![1, 2, 3].includes(priority)) {
      return res.status(400).json({
        error: "Priority must be 1, 2, or 3.",
      });
    }

    // Récupérer le PFA
    const pfa = await PFA.findById(id);
    if (!pfa) {
      return res.status(404).json({ error: "PFA not found." });
    }

    // Vérifier si le PFA a le statut "published"
    if (pfa.status !== "published") {
      return res.status(400).json({
        error:
          "Subject is not available for selection. Only published subjects can be selected.",
      });
    }

    // Vérifier si l'étudiant a déjà choisi ce sujet
    const existingChoice = pfa.choices.find(
      (choice) => choice.student.toString() === studentId
    );
    if (existingChoice) {
      return res.status(400).json({
        error: "You have already selected this subject.",
      });
    }

    // Vérifier si Students[] est vide
    if (pfa.Students.length > 0) {
      return res.status(400).json({
        error: "Subject is temporarily assigned for now.",
      });
    }

    // Vérifier si l'étudiant a déjà attribué cette priorité à un autre sujet
    const duplicatePriority = await PFA.findOne({
      "choices.student": studentId,
      "choices.priority": priority,
    });
    if (duplicatePriority) {
      return res.status(400).json({
        error: `You have already assigned priority ${priority} to another subject.`,
      });
    }

    // Vérifier le mode du PFA
    if (binomeId) {
      if (pfa.mode !== "binome") {
        return res.status(400).json({
          error: `Binome cannot be added as the mode is "${pfa.mode}".`,
        });
      }

      if (binomeId === studentId) {
        return res.status(400).json({
          error:
            "The binome ID must be different from the authenticated student's ID.",
        });
      }

      // Vérifier si le binôme existe
      const binome = await Student.findById(binomeId);
      if (!binome) {
        return res.status(400).json({ error: "Invalid binome ID." });
      }

      // Vérifier si le binôme a déjà attribué cette priorité à un autre sujet
      const binomeDuplicatePriority = await PFA.findOne({
        "choices.student": binomeId,
        "choices.priority": priority,
      });
      if (binomeDuplicatePriority) {
        return res.status(400).json({
          error: `Your binome has already assigned priority ${priority} to another subject.`,
        });
      }
    }

    // Ajouter l'étudiant au tableau Students[] s'il n'y est pas déjà
    if (!pfa.Students.includes(studentId)) {
      pfa.Students.push(studentId);
    }

    // Ajouter le choix pour l'étudiant
    pfa.choices.push({
      student: studentId,
      priority,
      acceptedByTeacher,
    });

    // Ajouter le binôme à la liste des étudiants et aux choix
    if (binomeId) {
      if (!pfa.Students.includes(binomeId)) {
        pfa.Students.push(binomeId);
      }

      pfa.choices.push({
        student: binomeId,
        priority,
        acceptedByTeacher,
      });
    }

    // Sauvegarder les modifications
    await pfa.save();

    res.status(200).json({
      message: "Choice updated successfully.",
      pfa,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generatePlanning = async (req, res) => {
  try {
    const { rooms, dates } = req.body;

    const period = await Period.findOne({
      type: "choicePFA",
      EndDate: { $lt: new Date() },
    });
    if (!period) {
      return res.status(400).json({
        message:
          "The period of choice is not closed. Please close it before generating the planning.",
      });
    }
    if (!rooms || rooms.length === 0 || !dates || dates.length === 0) {
      return res.status(400).json({ message: "Rooms and dates are required." });
    }

    const projects = await PFA.find({ status: "published" }).populate(
      "teacher"
    );
    const totalProjects = projects.length;

    const maxSoutenancesPerDay = 6;
    const availableDays = dates.length;
    const maxPossibleSoutenances = availableDays * maxSoutenancesPerDay;

    if (totalProjects > maxPossibleSoutenances) {
      return res.status(400).json({
        message: `Unable to schedule all defenses. The number of defenses (${totalProjects}) exceeds the maximum capacity of the given days (${maxPossibleSoutenances}).`,
      });
    }

    let schedule = [];
    let projectIndex = 0;
    let currentRoomIndex = 0;
    let timeSlot = 1;
    const soutenancesPerDay = Math.ceil(totalProjects / availableDays);

    for (let k = 1; k <= soutenancesPerDay; k++) {
      if (currentRoomIndex >= rooms.length) {
        currentRoomIndex = 0;
        timeSlot++;
      }

      for (let i = 0; i < dates.length; i++) {
        if (projectIndex >= totalProjects) break;

        const project = projects[projectIndex];
        const reporter =
          projects[(projectIndex + 1) % totalProjects].teacher.id;

        const planningEntry = new PlanningPfa({
          project: project._id,
          encadrant: project.teacher.id,
          rapporteur: reporter,
          date: dates[i],
          room: rooms[currentRoomIndex],
          timeSlot: timeSlot,
          duration: 30,
        });

        await planningEntry.save();
        schedule.push(planningEntry);
        projectIndex++;
      }
      currentRoomIndex++;
    }

    return res.status(200).json({
      message: `${schedule.length} plannings successfully generated.`,
      schedule,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error generating the planning.", error });
  }
};

export const getPlanningByTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const encadrantPlannings = await PlanningPfa.find({
      encadrant: id,
      isPublished: true,
    })
      .populate("project")
      .populate("rapporteur");

    const rapporteurPlannings = await PlanningPfa.find({
      rapporteur: id,
      isPublished: true,
    })
      .populate("project")
      .populate("encadrant");

    const nbrEncadrements = encadrantPlannings.length;
    const nbrRapporteurSoutenances = rapporteurPlannings.length;

    if (!nbrEncadrements && !nbrRapporteurSoutenances) {
      return res
        .status(404)
        .json({ message: "No planning found for this teacher." });
    }

    return res.status(200).json({
      message: "Planning retrieved successfully.",
      nbrEncadrements,
      nbrRapporteurSoutenances,
      encadrantPlannings,
      rapporteurPlannings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while retrieving the planning.",
      error,
    });
  }
};

export const getPlanningByStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const projects = await PFA.find({
      status: "published",
      Students: { $in: [id] },
    });

    if (!projects || projects.length === 0) {
      return res
        .status(404)
        .json({ message: "No project found for this student." });
    }

    const projectIds = projects.map((project) => project._id);

    const planning = await PlanningPfa.find({
      project: { $in: projectIds },
      isPublished: true,
    })
      .populate("project")
      .populate("encadrant")
      .populate("rapporteur")
      .populate("room");

    if (!planning || planning.length === 0) {
      return res
        .status(404)
        .json({ message: "No planning found for this student" });
    }

    return res.status(200).json({ planning });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while retrieving the planning.",
      error,
    });
  }
};

export const publishOrUnpublishPlannings = async (req, res) => {
  try {
    const { response } = req.params;
    const isPublished = response === "true";
    if (response !== "true" && response !== "false") {
      return res.status(400).json({
        message: "The value of 'response' must be 'true' or 'false'.",
      });
    }

    const totalPlannings = await PlanningPfa.countDocuments();
    if (totalPlannings === 0) {
      return res.status(404).json({
        message: "No plannings found to update.",
      });
    }

    const previouslySentEmails = await PlanningPfa.findOne({ emailSent: true });
    const isFirstSend = !previouslySentEmails;

    const updatedPlannings = await PlanningPfa.updateMany(
      {},
      { isPublished: isPublished, ...(isPublished && { emailSent: true }) }
    );

    const message = isPublished
      ? "The plannings have been successfully published."
      : "The plannings have been successfully unpublished.";

    let emailResults = null;

    if (isPublished) {
      const subject = isFirstSend
        ? "New PFA Planning Published"
        : "Updated PFA Planning Published";

      const headerContent = `<h2>Dear All,</h2>
          <p>The PFA planning is now published. Please check the link below to review it:</p>`;

      const bodyContent = `<p style="font-size: 16px;">Click the link below to view the planning:</p>
          <p><a href="http://ISAMM.com/pfa-planning" target="_blank" style="color: #0078FF;">View Planning</a></p>`;

      emailResults = await sendEmailsToInvolved(
        subject,
        headerContent,
        bodyContent,
        !isFirstSend
      );
    }

    const responseObj = {
      message,
      modifiedCount: `${updatedPlannings.modifiedCount} / ${totalPlannings}`,
    };

    if (isPublished) {
      responseObj.emailResults = emailResults;
      responseObj.isFirstSend = isFirstSend;
    }

    return res.status(200).json(responseObj);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message:
        "An error occurred while updating the plannings and sending emails.",
      error,
    });
  }
};

const sendEmailsToInvolved = async (
  subject,
  headerContent,
  bodyContent,
  isUpdate
) => {
  const involvedPlannings = await PlanningPfa.find()
    .populate({
      path: "project",
      populate: {
        path: "Students",
        select: "email",
      },
    })
    .populate("encadrant");

  const studentEmails = new Set();
  const teacherEmails = new Set();

  for (let planning of involvedPlannings) {
    if (planning.project && planning.project.Students) {
      planning.project.Students.forEach((student) => {
        if (student.email) {
          studentEmails.add(student.email);
        }
      });
    }

    if (planning.encadrant && planning.encadrant.email) {
      teacherEmails.add(planning.encadrant.email);
    }
  }

  let sentStudents = 0;
  let failedStudents = 0;
  let sentTeachers = 0;
  let failedTeachers = 0;

  for (let email of studentEmails) {
    const result = await sendEmail(email, subject, headerContent, bodyContent);
    if (result.success) {
      sentStudents++;
    } else {
      failedStudents++;
    }
  }

  for (let email of teacherEmails) {
    const result = await sendEmail(email, subject, headerContent, bodyContent);
    if (result.success) {
      sentTeachers++;
    } else {
      failedTeachers++;
    }
  }

  return {
    nbrEmailSentStudents: `${sentStudents}/${sentStudents + failedStudents}`,
    nbrEmailSentTeachers: `${sentTeachers}/${sentTeachers + failedTeachers}`,
  };
};
export const modifyPlanning = async (req, res) => {
  try {
    const { encadrant, rapporteur, room, date, timeSlot } = req.body;
    const { id } = req.params;

    const existingPlanning = await PlanningPfa.findById(id);
    if (!existingPlanning) {
      return res.status(404).json({ message: "Planning entry not found." });
    }

    let planningUpdated = {};

    planningUpdated.encadrant = encadrant || existingPlanning.encadrant;
    planningUpdated.rapporteur = rapporteur || existingPlanning.rapporteur;
    planningUpdated.room = room || existingPlanning.room;
    planningUpdated.date = date || existingPlanning.date;
    planningUpdated.timeSlot = timeSlot || existingPlanning.timeSlot;

    let conflictingPlanning = null;

    if (!date && !rapporteur) {
      conflictingPlanning = await PlanningPfa.findOne({
        room: planningUpdated.room,
        date: planningUpdated.date,
        timeSlot: planningUpdated.timeSlot,
      });
      if (conflictingPlanning) {
        return res.status(400).json({
          message:
            "Conflict detected: The selected room, date, or time slot is already occupied.",
        });
      }
    }

    if (date) {
      const existingSoutenancesForDay = await PlanningPfa.countDocuments({
        date: date,
      });

      if (existingSoutenancesForDay >= 6) {
        return res.status(400).json({
          message:
            "This day is already fully booked with 6 soutenances. No more soutenances can be scheduled on this day.",
        });
      }

      conflictingPlanning = await PlanningPfa.findOne({
        room: planningUpdated.room,
        date: planningUpdated.date,
        timeSlot: planningUpdated.timeSlot,
      });
      if (conflictingPlanning) {
        return res.status(400).json({
          message:
            "Conflict detected: The selected room, date, or time slot is already occupied.",
        });
      }
    }

    if (rapporteur) {
      conflictingPlanning = await PlanningPfa.findOne({
        rapporteur: rapporteur,
        date: existingPlanning.date,
        timeSlot: existingPlanning.timeSlot,
        _id: { $ne: existingPlanning._id },
      });
      if (conflictingPlanning) {
        return res.status(400).json({
          message:
            "Conflict detected: The selected rapporteur is already occupied at the same time and date.",
        });
      }
    }

    if (rapporteur) {
      conflictingPlanning = await PlanningPfa.findOne({
        encadrant: rapporteur,
        date: existingPlanning.date,
        timeSlot: existingPlanning.timeSlot,
        _id: { $ne: existingPlanning._id },
      });
      if (conflictingPlanning) {
        return res.status(400).json({
          message:
            "Conflict detected: The selected encadrant is already occupied at the same time and date.",
        });
      }
    }

    existingPlanning.encadrant = planningUpdated.encadrant;
    existingPlanning.rapporteur = planningUpdated.rapporteur;
    existingPlanning.room = planningUpdated.room;
    existingPlanning.date = planningUpdated.date;
    existingPlanning.timeSlot = planningUpdated.timeSlot;

    await existingPlanning.save();

    return res.status(200).json({
      message: "Planning updated successfully.",
      planning: existingPlanning,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error modifying the planning.", error });
  }
};

export const getTeacherPlannings = async (req, res) => {
  try {
    const teacherId = req.auth.userId;

    const plannings = await PlanningPfa.find({
      $or: [{ encadrant: teacherId }, { rapporteur: teacherId }],
    });

    if (!plannings || plannings.length === 0) {
      return res
        .status(404)
        .json({ message: "No plannings found for this teacher." });
    }

    return res
      .status(200)
      .json({ message: "Plannings retrieved successfully.", plannings });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error retrieving plannings.", error });
  }
};
