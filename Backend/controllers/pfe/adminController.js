import PFE from "../../models/Pfe.js";
import Soutenance from "../../models/Soutenance.js";
import Teacher from "../../models/Teacher.js";

import { sendNotification } from "../../notifyWithMail/mailNotif.js";
import {
  generateEmailTemplate,
  COMMON_ATTACHMENTS,
} from "../../notifyWithMail/notifTemplate.js";

//4.1
export const listChoicesByStudents = async (req, res) => {
  try {
    const yearFilter = req.yearFilter || {};
    const pfes = await PFE.find(yearFilter)
      .populate("student", "firstName lastName email")
      .populate("teacher", "firstName lastName email grade");

    const formattedData = pfes.map((pfe) => ({
      id: pfe._id,
      title: pfe.title,
      student: pfe.student
        ? {
            name: `${pfe.student.firstName} ${pfe.student.lastName}`,
            email: pfe.student.email,
          }
        : null,
      teacher: pfe.teacher
        ? {
            name: `${pfe.teacher.firstName} ${pfe.teacher.lastName}`,
            email: pfe.teacher.email,
            grade: pfe.teacher.grade,
          }
        : "Non affecté",
      isAffected: pfe.isAffected,
      planningVersion: pfe.planningVersion || "Non spécifié",
      isPublished: pfe.isPublished || false,
    }));

    res.status(200).json({
      data: formattedData,
      message: "Liste des choix par étudiant récupérée avec succès.",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des choix:", error);
    res.status(500).json({
      error: "Une erreur s'est produite lors de la récupération des choix.",
      details: error.message,
    });
  }
};

//4.2
export const validateSupervisorChoice = async (req, res) => {
  const { subjectIds } = req.body;

  try {
    // Vérification : tous les sujets doivent avoir un enseignant
    const subjects = await PFE.find({ _id: { $in: subjectIds } });
    const invalidSubjects = subjects.filter((subject) => !subject.teacher);

    if (invalidSubjects.length > 0) {
      return res.status(400).json({
        message: "Certains sujets n'ont pas encore d'enseignant.",
        invalidSubjects: invalidSubjects.map((subj) => subj._id),
      });
    }

    // Validation des sujets
    await PFE.updateMany(
      { _id: { $in: subjectIds } },
      { $set: { isAffected: true } }
    );

    res.status(200).json({
      message: "Validation effectuée avec succès pour les sujets sélectionnés.",
      validatedSubjects: subjectIds,
    });
  } catch (error) {
    console.error("Erreur lors de la validation des sujets :", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la validation des sujets.",
      details: error.message,
    });
  }
};

//4.3
export const assignSubjectToTeacher = async (req, res) => {
  const { id } = req.params;
  const { teacherId, force } = req.body;

  try {
    const subject = await PFE.findById(id);

    if (!subject) {
      return res.status(404).json({
        message: "Le sujet demandé n'existe pas.",
      });
    }

    // Vérifier si le sujet est déjà affecté
    if (subject.isAffected) {
      if (force) {
        // Si "force" est activé, libérer l'enseignant précédent
        subject.teacher = teacherId;
        subject.isAffected = true; // Confirme que le sujet est réaffecté
        await subject.save();

        return res.status(200).json({
          message:
            "Le sujet a été réaffecté avec succès à un nouvel enseignant.",
          subject,
        });
      } else {
        return res.status(400).json({
          message:
            "Le sujet est déjà affecté à un autre enseignant. Activez 'force' pour réaffecter.",
        });
      }
    }

    // Si le sujet n'est pas encore affecté
    subject.teacher = teacherId;
    subject.isAffected = true;
    subject.isSelected = true;
    await subject.save();

    res.status(200).json({
      message: "Le sujet a été affecté avec succès à l'enseignant.",
      subject,
    });
  } catch (error) {
    console.error("Erreur lors de l'affectation du sujet :", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de l'affectation du sujet.",
      details: error.message,
    });
  }
};

//4.4

export const toggleAffectationVisibility = async (req, res) => {
  const { response } = req.params; // true ou false

  try {
    if (response !== "true" && response !== "false") {
      return res.status(400).json({
        message: "Invalid response value. It should be 'true' or 'false'.",
      });
    }

    const isPublished = response === "true";

    // tamel mise ajour lel les sujets lkol
    await PFE.updateMany({}, { $set: { isPublished } });

    res.status(200).json({
      message: `Planning successfully ${isPublished ? "published" : "hidden"}.`,
    });
  } catch (error) {
    console.error("Error toggling planning visibility:", error);
    res.status(500).json({
      error: "An error occurred while toggling planning visibility.",
      details: error.message,
    });
  }
};

//4.5

export const sendPlanningEmail = async (req, res) => {
  const { sendType, targetTeachers, targetStudents } = req.body; // Inclut les listes d'ID cibles

  try {
    // Vérifiez si le type d'envoi est valide
    if (sendType !== "first" && sendType !== "modified") {
      return res.status(400).json({
        message: "Invalid sendType. It should be 'first' or 'modified'.",
      });
    }

    // Récupérer tous les sujets affectés
    const pfes = await PFE.find({ isAffected: true }).populate(
      "student teacher"
    );

    if (pfes.length === 0) {
      return res.status(400).json({
        message: "No planning data available to send.",
      });
    }

    // **1. Filtrer les enseignants ciblés**
    const teachersMap = {};
    pfes.forEach((pfe) => {
      if (pfe.teacher) {
        const teacherId = pfe.teacher._id.toString();

        // Si "targetTeachers" est défini, vérifier si cet enseignant est inclus dans la liste
        if (targetTeachers && !targetTeachers.includes(teacherId)) {
          return; // Sauter cet enseignant
        }

        if (!teachersMap[teacherId]) {
          teachersMap[teacherId] = {
            teacher: pfe.teacher,
            subjects: [],
          };
        }
        teachersMap[teacherId].subjects.push({
          title: pfe.title,
          description: pfe.description,
          student: pfe.student
            ? `${pfe.student.firstName} ${pfe.student.lastName} (${pfe.student.email})`
            : "Unassigned Student",
        });
      }
    });

    // Boucle sur les enseignants pour leur envoyer leurs sujets
    for (const teacherId in teachersMap) {
      const { teacher, subjects } = teachersMap[teacherId];

      const emailHeaderContent = `<h2 style="font-size: 22px; color: #333;">Dear ${teacher.firstName} ${teacher.lastName},</h2>`;
      const emailBodyContent = `
        <p>You have been assigned the following PFE subjects:</p>
        <ul>
          ${subjects
            .map(
              (subject) => `
            <li>
              <strong>Title:</strong> ${subject.title}<br>
              <strong>Description:</strong> ${subject.description}<br>
              <strong>Student:</strong> ${subject.student}
            </li>
          `
            )
            .join("")}
        </ul>
        <p>Please review the subjects and contact the respective students for further details.</p>
        ${
          sendType === "modified"
            ? `<p><strong>Note:</strong> This is an updated version of your initial planning, reflecting recent changes.</p>`
            : ""
        }
      `;

      const emailHtmlContent = generateEmailTemplate(
        "PFE Subject Assignment",
        emailHeaderContent,
        emailBodyContent
      );

      await sendNotification({
        email: teacher.email,
        subject: "Your Assigned PFE Subjects",
        htmlContent: emailHtmlContent,
        attachments: COMMON_ATTACHMENTS,
      });
    }

    // Filtrer les étudiants ciblés
    const studentsMap = {};
    pfes.forEach((pfe) => {
      if (pfe.student) {
        const studentId = pfe.student._id.toString();

        // Si "targetStudents" est défini, vérifier si cet étudiant est inclus dans la liste
        if (targetStudents && !targetStudents.includes(studentId)) {
          return; // Sauter cet étudiant
        }

        studentsMap[studentId] = {
          student: pfe.student,
          teacher: pfe.teacher
            ? `${pfe.teacher.firstName} ${pfe.teacher.lastName} (${pfe.teacher.email})`
            : "No Teacher Assigned",
        };
      }
    });

    // Boucle sur les étudiants pour leur envoyer leurs encadrants
    for (const studentId in studentsMap) {
      const { student, teacher } = studentsMap[studentId];

      const emailHeaderContent = `<h2 style="font-size: 22px; color: #333;">Dear ${student.firstName} ${student.lastName},</h2>`;
      const emailBodyContent = `
        <p>Your PFE project has been assigned to an advisor:</p>
        <p>
          <strong>Advisor:</strong> ${teacher}
        </p>
        <p>Please get in touch with your advisor for further coordination regarding your project.</p>
        ${
          sendType === "modified"
            ? `<p><strong>Note:</strong> This is an updated version of your initial planning, reflecting recent changes.</p>`
            : ""
        }
      `;

      const emailHtmlContent = generateEmailTemplate(
        "PFE Advisor Notification",
        emailHeaderContent,
        emailBodyContent
      );

      await sendNotification({
        email: student.email,
        subject: "Your PFE Advisor",
        htmlContent: emailHtmlContent,
        attachments: COMMON_ATTACHMENTS,
      });
    }

    // Mettre à jour la base de données
    await PFE.updateMany(
      { isAffected: true },
      {
        $set: {
          isEmailSent: true,
          emailSentDate: new Date(),
          planningVersion: sendType === "first" ? "1.0" : "2.0",
        },
      }
    );

    res.status(200).json({
      message: `Planning email has been successfully ${
        sendType === "first" ? "sent" : "modified"
      }.`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      error: "An error occurred while sending the email.",
      details: error.message,
    });
  }
};
//5.1
export const assignDefense = async (req, res) => {
  const { id } = req.params;
  const { room, date, startTime, endTime, teachers } = req.body;

  try {
    const pfe = await PFE.findById(id).populate("teacher student");
    if (!pfe) {
      return res.status(404).json({ message: "PFE non trouvé." });
    }

    const existingPlanning = await Soutenance.findOne({ pfe: pfe._id });
    if (existingPlanning) {
      return res.status(400).json({
        message: "Ce sujet PFE a déjà un planning de soutenance.",
      });
    }

    const roles = ["president", "rapporteur", "encadrant"];
    const teacherMap = {};
    const teacherIds = new Set();

    for (const teacher of teachers) {
      if (!teacher.id || !teacher.role) {
        return res.status(400).json({
          message: "Chaque enseignant doit avoir un ID et un rôle.",
        });
      }

      if (!roles.includes(teacher.role)) {
        return res.status(400).json({
          message: `Rôle invalide pour l'enseignant ${teacher.id}.`,
        });
      }

      if (teacherMap[teacher.role]) {
        return res.status(400).json({
          message: `Le rôle '${teacher.role}' a déjà été attribué.`,
        });
      }

      if (teacherIds.has(teacher.id)) {
        return res.status(400).json({
          message: `L'enseignant avec ID ${teacher.id} ne peut pas avoir plusieurs rôles.`,
        });
      }

      const teacherDetails = await Teacher.findById(teacher.id);
      if (!teacherDetails) {
        return res.status(404).json({
          message: `Enseignant avec ID ${teacher.id} introuvable.`,
        });
      }

      teacherMap[teacher.role] = teacherDetails;
      teacherIds.add(teacher.id);
    }

    for (const role of roles) {
      if (!teacherMap[role]) {
        return res.status(400).json({
          message: `Rôle '${role}' non attribué.`,
        });
      }
    }

    if (!pfe.teacher || !pfe.teacher.equals(teacherMap.encadrant._id)) {
      return res.status(400).json({
        message: "L'encadrant spécifié n'est pas l'encadrant de ce PFE.",
      });
    }

    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    if (parsedStartTime >= parsedEndTime) {
      return res.status(400).json({
        message: "L'heure de début doit précéder l'heure de fin.",
      });
    }

    const overlappingDefenseInRoom = await Soutenance.findOne({
      room,
      date,
      $or: [
        {
          startTime: { $lt: parsedEndTime },
          endTime: { $gt: parsedStartTime },
        },
      ],
    });

    if (overlappingDefenseInRoom) {
      return res.status(400).json({
        message:
          "Une autre soutenance est déjà planifiée dans cette salle à ce moment.",
      });
    }

    const conflictingTeachers = [];
    for (const teacher of teachers) {
      const overlappingDefenseForTeacher = await Soutenance.findOne({
        "teachers.teacherId": teacher.id,
        date,
        $or: [
          {
            startTime: { $lt: parsedEndTime },
            endTime: { $gt: parsedStartTime },
          },
        ],
      });

      if (overlappingDefenseForTeacher) {
        conflictingTeachers.push(teacher.id);
      }
    }

    if (conflictingTeachers.length > 0) {
      return res.status(400).json({
        message: `Les enseignants suivants ont déjà une soutenance prévue à ce moment : ${conflictingTeachers.join(
          ", "
        )}.`,
      });
    }

    const soutenance = new Soutenance({
      pfe: pfe._id,
      student: pfe.student._id,
      room,
      date: new Date(date),
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      teachers: Object.entries(teacherMap).map(([role, teacherDetails]) => ({
        teacherId: teacherDetails._id,
        role,
      })),
      isPublished: false,
      emailVersion: "1.0",
    });

    await soutenance.save();

    res.status(200).json({
      message: "Soutenance assignée avec succès.",
      soutenance: {
        id: soutenance._id,
        room: soutenance.room,
        date: soutenance.date,
        startTime: soutenance.startTime,
        endTime: soutenance.endTime,
        subjectTitle: pfe.title,
        student: {
          id: pfe.student._id,
          name: `${pfe.student.firstName} ${pfe.student.lastName}`,
          email: pfe.student.email,
        },
        president: {
          id: teacherMap.president._id,
          name: `${teacherMap.president.firstName} ${teacherMap.president.lastName}`,
          email: teacherMap.president.email,
        },
        rapporteur: {
          id: teacherMap.rapporteur._id,
          name: `${teacherMap.rapporteur.firstName} ${teacherMap.rapporteur.lastName}`,
          email: teacherMap.rapporteur.email,
        },
        encadrant: {
          id: teacherMap.encadrant._id,
          name: `${teacherMap.encadrant.firstName} ${teacherMap.encadrant.lastName}`,
          email: teacherMap.encadrant.email,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'assignation de la soutenance:", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de l'assignation de la soutenance.",
      details: error.message,
    });
  }
};

//5.2

export const publishOrHideDefenses = async (req, res) => {
  const { response } = req.params;

  try {
    if (!["publish", "hide"].includes(response)) {
      return res.status(400).json({
        message:
          "Le paramètre 'response' doit être soit 'publish' soit 'hide'.",
      });
    }

    const isPublished = response === "publish";

    const result = await Soutenance.updateMany({}, { isPublished });

    res.status(200).json({
      message: `Tous les plannings ont été ${
        isPublished ? "publiés" : "masqués"
      } avec succès.`,
      updatedCount: result.nModified,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des plannings :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la mise à jour des plannings.",
      details: error.message,
    });
  }
};

//5.3

const formatDate = (date) => {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

const formatTime = (startTime, endTime) => {
  const options = { hour: "2-digit", minute: "2-digit", timeZone: "UTC" };
  const start = new Date(startTime).toLocaleTimeString("fr-FR", options);
  const end = new Date(endTime).toLocaleTimeString("fr-FR", options);
  return `${start} - ${end}`;
};

export const sendPlanDefenceEmail = async (req, res) => {
  const { sendType } = req.body;

  try {
    if (sendType !== "first" && sendType !== "modified") {
      return res.status(400).json({
        message: "Invalid sendType. It should be 'first' or 'modified'.",
      });
    }

    const soutenances = await Soutenance.find({})
      .populate("pfe")
      .populate("teachers.teacherId")
      .populate("student");

    if (soutenances.length === 0) {
      return res.status(400).json({
        message: "No defense planning data available to send.",
      });
    }

    const teacherPlanningMap = new Map();

    for (const soutenance of soutenances) {
      const { teachers, student, room, date, startTime, endTime, pfe } =
        soutenance;

      for (const teacher of teachers) {
        const teacherId = teacher.teacherId._id.toString();
        const planningEntry = {
          pfeTitle: pfe.title,
          room,
          date: formatDate(new Date(date)),
          startTime: formatTime(startTime, endTime),
          studentName: `${student.firstName} ${student.lastName}`,
          role: teacher.role, // Ajouter le rôle ici
        };

        if (!teacherPlanningMap.has(teacherId)) {
          teacherPlanningMap.set(teacherId, {
            teacherInfo: teacher.teacherId,
            planning: [],
          });
        }

        teacherPlanningMap.get(teacherId).planning.push(planningEntry);
      }
    }

    // Envoi d'un email enseignant
    for (const [teacherId, { teacherInfo, planning }] of teacherPlanningMap) {
      const emailHtml = `
        <p>Dear ${teacherInfo.firstName} ${teacherInfo.lastName},</p>
        <p>Here is the defense planning for the PFE subjects you are involved in:</p>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th>Subject Title</th>
              <th>Room</th>
              <th>Date</th>
              <th>Time</th>
              <th>Student</th>
              <th>Role</th> <!-- Ajouter l'en-tête pour le rôle -->
            </tr>
          </thead>
          <tbody>
            ${planning
              .map(
                (entry) => `
              <tr>
                <td>${entry.pfeTitle}</td>
                <td>${entry.room}</td>
                <td>${entry.date}</td>
                <td>${entry.startTime}</td>
                <td>${entry.studentName}</td>
                <td>${entry.role}</td> <!-- Ajouter le rôle dans chaque ligne -->
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
      `;

      const emailHtmlContent = generateEmailTemplate(
        "Your Assigned Defense Planning",
        emailHtml
      );

      await sendNotification({
        email: teacherInfo.email,
        subject: "PFE Defense Planning",
        htmlContent: emailHtmlContent,
        attachments: COMMON_ATTACHMENTS,
      });
    }

    // Envoi des emails aux étudiants
    for (const soutenance of soutenances) {
      const { student, teachers, room, date, startTime, endTime, pfe } =
        soutenance;

      const studentEmailHtml = `
        <p>Dear ${student.firstName} ${student.lastName},</p>
        <p>Your defense planning for PFE "<strong>${
          pfe.title
        }</strong>" is as follows:</p>
        <ul>
          <li><strong>Room:</strong> ${room}</li>
          <li><strong>Date:</strong> ${formatDate(new Date(date))}</li>
          <li><strong>Time:</strong> ${formatTime(startTime, endTime)}</li>
          <li><strong>Jury:</strong></li>
          <ul>
            ${teachers
              .map(
                (teacher) =>
                  `<li>${teacher.role}: ${teacher.teacherId.firstName} ${teacher.teacherId.lastName}</li>`
              )
              .join("")}
          </ul>
        </ul>
        
      `;

      const emailHtmlContent = generateEmailTemplate(
        "Defence Advisor Notification",
        studentEmailHtml
      );
      await sendNotification({
        email: student.email,
        subject: "Your PFE Defense Planning",
        htmlContent: emailHtmlContent,
        attachments: COMMON_ATTACHMENTS,
      });
    }

    await Soutenance.updateMany(
      {},
      {
        $set: {
          isEmailSent: true,
          emailSentDate: new Date(),
          emailVersion: sendType === "first" ? "1.0" : "2.0",
        },
      }
    );

    res.status(200).json({
      message: `Emails have been successfully ${
        sendType === "first" ? "sent" : "updated"
      }.`,
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({
      error: "An error occurred while sending the emails.",
      details: error.message,
    });
  }
};

//5.4

export const updateDefense = async (req, res) => {
  const { id } = req.params;
  const { room, date, startTime, endTime, teachers } = req.body;

  try {
    if (
      !room ||
      !date ||
      !startTime ||
      !endTime ||
      !teachers ||
      teachers.length === 0
    ) {
      return res.status(400).json({
        message:
          "All fields (room, date, startTime, endTime, teachers) are required.",
      });
    }

    const validRoles = ["president", "rapporteur", "encadrant"];
    for (const teacher of teachers) {
      if (!teacher.id || !validRoles.includes(teacher.role)) {
        return res.status(400).json({
          message:
            "Each teacher must have a valid id and role ('president', 'rapporteur', 'encadrant').",
        });
      }
    }

    const soutenance = await Soutenance.findById(id)
      .populate("pfe")
      .populate("teachers.teacherId")
      .populate("student");

    if (!soutenance) {
      return res.status(404).json({
        message: "The specified defense planning does not exist.",
      });
    }

    const { pfe } = soutenance;

    const teacherMap = teachers.reduce((map, teacher) => {
      map[teacher.role] = teacher;
      return map;
    }, {});

    if (!teacherMap.encadrant) {
      return res.status(400).json({
        message: "An encadrant must be assigned to the defense.",
      });
    }

    const pfeEncadrant = pfe.teacher;
    if (!pfeEncadrant || !pfeEncadrant.equals(teacherMap.encadrant.id)) {
      return res.status(400).json({
        message: "L'encadrant spécifié n'est pas l'encadrant de ce PFE.",
      });
    }

    const overlappingDefenseInRoom = await Soutenance.findOne({
      room,
      date,
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
      _id: { $ne: id },
    });

    if (overlappingDefenseInRoom) {
      return res.status(400).json({
        message: "The room is already booked for another defense at this time.",
      });
    }

    const conflictTeachers = [];

    for (const teacher of teachers) {
      const overlappingDefenseForTeacher = await Soutenance.findOne({
        "teachers.teacherId": teacher.id,
        date,
        $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
        _id: { $ne: id },
      });

      if (overlappingDefenseForTeacher) {
        conflictTeachers.push(teacher.id);
      }
    }

    if (conflictTeachers.length > 0) {
      return res.status(400).json({
        message: `The following teachers have another defense at this time: ${conflictTeachers.join(
          ", "
        )}.`,
      });
    }

    const uniqueTeacherRoles = teachers.reduce((acc, teacher) => {
      acc[teacher.id] = acc[teacher.id] || [];
      acc[teacher.id].push(teacher.role);
      return acc;
    }, {});

    for (const [teacherId, roles] of Object.entries(uniqueTeacherRoles)) {
      if (roles.length > 1) {
        return res.status(400).json({
          message: `The teacher with ID ${teacherId} cannot have multiple roles in the same defense.`,
        });
      }
    }

    soutenance.room = room;
    soutenance.date = date;
    soutenance.startTime = startTime;
    soutenance.endTime = endTime;

    soutenance.teachers = teachers.map((teacher) => ({
      teacherId: teacher.id,
      role: teacher.role,
    }));

    await soutenance.save();

    const {
      student,
      room: updatedRoom,
      date: updatedDate,
      startTime: updatedStartTime,
      endTime: updatedEndTime,
      pfe: updatedPfe,
    } = soutenance;

    for (const teacher of teachers) {
      const teacherData = await Teacher.findById(teacher.id);
      if (!teacherData) continue;

      const emailHtml = `
        <p>Dear ${teacherData.firstName} ${teacherData.lastName},</p>
        <p>The defense planning for PFE "<strong>${
          updatedPfe.title
        }</strong>" has been updated. Here are the new details:</p>
        <ul>
          <li><strong>Room:</strong> ${updatedRoom}</li>
          <li><strong>Date:</strong> ${new Date(
            updatedDate
          ).toDateString()}</li>
          <li><strong>Time:</strong> ${new Date(
            updatedStartTime
          ).toLocaleTimeString()} - ${new Date(
        updatedEndTime
      ).toLocaleTimeString()}</li>
          <li><strong>Student:</strong> ${student.firstName} ${
        student.lastName
      }</li>
          <li><strong>Your Role:</strong> ${teacher.role}</li>
        </ul>
        <p><strong>Note:</strong> This is a modified version of the initial planning.</p>
        
      `;

      const emailHtmlContent = generateEmailTemplate(
        "Updated Defense Planning Notification",
        emailHtml
      );

      await sendNotification({
        email: teacherData.email,
        subject: "Updated PFE Defense Planning",
        htmlContent: emailHtmlContent,
        attachments: COMMON_ATTACHMENTS,
      });
    }

    const teacherDetails = await Promise.all(
      teachers.map(async (teacher) => {
        const teacherData = await Teacher.findById(teacher.id);
        return {
          role: teacher.role,
          name: `${teacherData.firstName} ${teacherData.lastName}`,
        };
      })
    );

    const studentEmailHtml = `
      <p>Dear ${student.firstName} ${student.lastName},</p>
      <p>Your defense planning for PFE "<strong>${
        updatedPfe.title
      }</strong>" has been updated. Here are the new details:</p>
      <ul>
        <li><strong>Room:</strong> ${updatedRoom}</li>
        <li><strong>Date:</strong> ${new Date(updatedDate).toDateString()}</li>
        <li><strong>Time:</strong> ${new Date(
          updatedStartTime
        ).toLocaleTimeString()} - ${new Date(
      updatedEndTime
    ).toLocaleTimeString()}</li>
        <li><strong>Jury:</strong></li>
        <ul>
          ${teacherDetails
            .map((teacher) => `<li>${teacher.role}: ${teacher.name}</li>`)
            .join("")}
        </ul>
      </ul>
      <p><strong>Note:</strong> This is a modified version of the initial planning.</p>
      
    `;

    const studentEmailHtmlContent = generateEmailTemplate(
      "Updated Defense Planning Notification",
      studentEmailHtml
    );

    await sendNotification({
      email: student.email,
      subject: "Updated Defense Planning Notification",
      htmlContent: studentEmailHtmlContent,
      attachments: COMMON_ATTACHMENTS,
    });

    soutenance.ModificationEmailSentDate = new Date();
    soutenance.emailVersion = "2.0";
    await soutenance.save();

    res.status(200).json({
      message:
        "The defense planning has been successfully updated and emails have been sent.",
      soutenance,
    });
  } catch (error) {
    console.error("Error updating defense planning:", error);
    res.status(500).json({
      error: "An error occurred while updating the defense planning.",
      details: error.message,
    });
  }
};
