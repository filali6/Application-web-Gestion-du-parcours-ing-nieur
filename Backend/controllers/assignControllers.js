import Teacher from "../models/Teacher.js";
import Plan from "../models/Planning.js";
import nodemailer from "nodemailer";
import Sujet from "../models/topic.js";
import Subject from "../models/Subject&Skill/Subject.js";
import { sendNotification } from "../notifyWithMail/mailNotif.js";
import {
  generateEmailTemplate,
  COMMON_ATTACHMENTS,
} from "../notifyWithMail/notifTemplate.js";
//get plan//
export const getTeacher = async (req, res) => {
  const teachers = await Teacher.find();
  res.status(200).json({
    model: teachers,
    message: "ce message n'esr pas obligatoire==acces",
  });
};
//get plan
// export const getPlans = async (req, res) => {
//   try {
//     const { role } = req.auth;

//     let plans;

//     if (role === "admin") {
//       plans = await Plan.find({});
//     } else if (role === "student") {
//       plans = await Plan.find({
//         isPublished: true,
//       });
//     } else if (role === "teacher") {
//       plans = await Plan.find({
//         isPublished: true,
//       });
//     } else {
//       return res.status(403).json({ error: "Access denied." });
//     }

//     res.status(200).json({
//       plans,
//       message: "Plans fetched successfully.",
//     });
//   } catch (error) {
//     console.error("Error fetching plans:", error);
//     res.status(500).json({ error: "An error occurred while fetching plans." });
//   }
// };
export const getPlans = async (req, res) => {
  try {
    // Recherche de tous les plans avec les données peuplées
    const plans = await Plan.find({})
      .populate({
        path: "sujet", // Peupler le champ 'sujet'
        select: "titre",
        populate: {
          path: "student",
          select: "firstName lastName",
        }, // Sélectionner uniquement le titre du sujet
      })
      .populate({
        path: "teachers", // Peupler le champ 'teachers'
        select: "firstName lastName", // Sélectionner les prénoms et noms du professeur
      });
    if (!plans || plans.length === 0) {
      return res.status(404).json({ error: "No plans found." });
    }

    res.status(200).json({
      plans,
      message:
        plans.length > 0
          ? "Plans fetched successfully."
          : "Aucun planning na encore été ajouté.",
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ error: "An error occurred while fetching plans." });
  }
};

//affecter et creer les plannings
// export const assignTeachersToTopicsAndCreatePlanning = async (req, res) => {
//   try {
//     const teacherIds = req.body.teacherIds;

//     if (!teacherIds || teacherIds.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Veuillez fournir les IDs des enseignants." });
//     }

//     // Récupérer les enseignants correspondants aux IDs
//     const teachers = await Teacher.find({ _id: { $in: teacherIds } });
//     if (teachers.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "Aucun enseignant correspondant aux IDs fournis." });
//     }

//     // Calculer le nombre de matières par enseignant
//     const teacherSubjectCounts = {};
//     for (const teacher of teachers) {
//       const subjectCount = await Subject.countDocuments({
//         assignedTeacher: teacher._id,
//       });
//       teacherSubjectCounts[teacher._id] = subjectCount;
//     }
//     console.log(teacherSubjectCounts)
// console.log(teachers);
//     // Trier les enseignants par nombre de matières (ordre croissant)
//     teachers.sort(
//       (a, b) => teacherSubjectCounts[a._id] - teacherSubjectCounts[b._id]
//     );
//     console.log(teachers);

//     // Récupérer tous les sujets
//     const sujets = await Sujet.find().populate("student");
//     if (sujets.length === 0) {
//       return res.status(404).json({ message: "Aucun sujet disponible." });
//     }

//     // Récupérer tous les plannings existants
//     const existingPlans = await Plan.find();
//     const assignedSujetIds = new Set(
//       existingPlans.map((plan) => plan.sujet?.toString())
//     );

//     // Filtrer les sujets non assignés
//     const availableSujets = sujets.filter(
//       (sujet) => sujet._id && !assignedSujetIds.has(sujet._id.toString())
//     );

//     if (availableSujets.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "Tous les sujets sont déjà assignés." });
//     }

//     const affectations = [];
//      let teacherIndex=0;
//      while (0!== availableSujets.length) {

//       if(teacherIndex===teachers.length)teacherIndex=0;
//        const teacher= teachers[teacherIndex];
//        const teacherSubjectsCapacity = teacherSubjectCounts[teacher._id];
//        let sujetsTeacher=[];
//       for (let i = 0;i < teacherSubjectsCapacity && availableSujets.length>0;i++) {
//         const sujetToAdd=availableSujets.pop();
//         sujetsTeacher.push(sujetToAdd.titre);
//         console.log(sujetToAdd.titre);
//         const newPlan = new Plan({
//           sujet: sujetToAdd._id,
//           teachers: teacher._id,
//           student: sujetToAdd.student._id,
//         });

//         await newPlan.save();
//       }

//         affectations.push({
//           enseignant: `${teacher.firstName} ${teacher.lastName}`,
//           sujet: sujetsTeacher,
//         });
//       teacherIndex++;
//     }
//     const groupedAffectations = affectations.reduce((result, current) => {

//       const existing = result.find(
//         (item) => item.enseignant === current.enseignant
//       );

//       if (existing) {

//         existing.sujet = [...existing.sujet, ...current.sujet];
//       } else {

//         result.push({
//           enseignant: current.enseignant,
//           sujet: [...current.sujet],
//         });
//       }

//       return result;
//     }, []);
//     res.status(201).json({
//       message: "affectation avec succes .",
//       affectations: groupedAffectations,
//     });
//   } catch (error) {
//     console.error(
//       "Erreur lors de l'assignation",
//       error
//     );
//     res
//       .status(500)
//       .json({ message: "Une erreur s'est produite.", error: error.message });
//   }
// };
export const assignTeachersToTopicsAndCreatePlanning = async (req, res) => {
  try {
    const teacherIds = req.body.teacherIds;

    if (!teacherIds || teacherIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Veuillez fournir les IDs des enseignants." });
    }

    // Récupérer les enseignants correspondants aux IDs
    const teachers = await Teacher.find({ _id: { $in: teacherIds } });
    if (teachers.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun enseignant correspondant aux IDs fournis." });
    }

    // Calculer le nombre de matières par enseignant
    const teacherSubjectCounts = {};
    for (const teacher of teachers) {
      const subjectCount = await Subject.countDocuments({
        assignedTeacher: teacher._id,
      });
      teacherSubjectCounts[teacher._id] = subjectCount;
    }
    console.log(teacherSubjectCounts);
    console.log(teachers);

    // Trier les enseignants par nombre de matières (ordre croissant)
    teachers.sort(
      (a, b) => teacherSubjectCounts[a._id] - teacherSubjectCounts[b._id]
    );
    console.log(teachers);

    // Récupérer tous les sujets
    const sujets = await Sujet.find().populate("student");
    if (sujets.length === 0) {
      return res.status(404).json({ message: "Aucun sujet disponible." });
    }

    // Récupérer tous les plannings existants
    const existingPlans = await Plan.find();
    const assignedSujetIds = new Set(
      existingPlans.map((plan) => plan.sujet?.toString())
    );

    // Filtrer les sujets non assignés
    const availableSujets = sujets.filter(
      (sujet) => sujet._id && !assignedSujetIds.has(sujet._id.toString())
    );

    if (availableSujets.length === 0) {
      return res
        .status(404)
        .json({ message: "Tous les sujets sont déjà assignés." });
    }

    const affectations = [];
    let teacherIndex = 0;
    while (availableSujets.length !== 0) {
      if (teacherIndex === teachers.length) teacherIndex = 0;
      const teacher = teachers[teacherIndex];
      const teacherSubjectsCapacity = teacherSubjectCounts[teacher._id];
      let sujetsTeacher = [];

      for (
        let i = 0;
        i < teacherSubjectsCapacity && availableSujets.length > 0;
        i++
      ) {
        const sujetToAdd = availableSujets.pop();

        // ✅ Vérifier que sujetToAdd.student est défini
        if (!sujetToAdd.student || !sujetToAdd.student._id) {
          console.warn(`Sujet ignoré car sans étudiant : ${sujetToAdd.titre}`);
          i--; // Ne pas compter ce tour dans la capacité
          continue;
        }

        sujetsTeacher.push(sujetToAdd.titre);
        console.log(sujetToAdd.titre);

        const newPlan = new Plan({
          sujet: sujetToAdd._id,
          teachers: teacher._id,
          student: sujetToAdd.student._id,
        });

        await newPlan.save();
      }

      affectations.push({
        enseignant: `${teacher.firstName} ${teacher.lastName}`,
        sujet: sujetsTeacher,
      });

      teacherIndex++;
    }

    const groupedAffectations = affectations.reduce((result, current) => {
      const existing = result.find(
        (item) => item.enseignant === current.enseignant
      );

      if (existing) {
        existing.sujet = [...existing.sujet, ...current.sujet];
      } else {
        result.push({
          enseignant: current.enseignant,
          sujet: [...current.sujet],
        });
      }

      return result;
    }, []);

    res.status(201).json({
      message: "affectation avec succes .",
      affectations: groupedAffectations,
    });
  } catch (error) {
    console.error("Erreur lors de l'assignation", error);
    res
      .status(500)
      .json({ message: "Une erreur s'est produite.", error: error.message });
  }
};

//////////////////////////////////////////send mail//////////////////////////////////////
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: "587",
  auth: {
    user: "azizhasnaoui000@gmail.com",
    pass: "sexgkvgjqzzacnbl",
  },
  tls: {
    rejectUnauthorized: false,
  },
});
export const sendPlanningEmails = async (req, res) => {
  try {
    const { type = "first" } = req.params;

    // Fetch plans and deeply populate necessary fields
    let plans = await Plan.find()
      .populate("teachers") // Populate teacher details
      .populate({
        path: "sujet", // Populate sujet
        populate: {
          path: "student", // Populate student inside sujet
          model: "Student", // Explicitly specify the model
        },
      });
    // Filtrer les plans en fonction du type
    if (type === "modified") {
      plans = plans.filter((plan) => plan.envoiType === "Envoi modifié");
    }

    if (!plans || plans.length === 0) {
      return res
        .status(404)
        .json({ message: "No planning data found for sending emails." });
    }

    // Prepare email notifications for each plan
    const notifications = plans.map(async (plan) => {
      try {
        const { teachers, sujet, salle, schedule } = plan;
        const student = sujet?.student;

        // Ensure all necessary data exists
        if (!teachers || !sujet || !student) {
          console.warn(`Incomplete data for plan ${plan._id}`);
          return;
        }

        // Email content for teacher
        const teacherEmailContent = generateEmailTemplate(
          `Planning Assigned for Subject: ${sujet.titre}`,
          `<p>Dear Professor <b>${teachers.firstName} ${teachers.lastName}</b>,</p>`,
          `<p>You have been assigned to supervise the subject <b>"${
            sujet.titre
          }"</b>.</p>
           <p>Details:</p>
           <ul>
             <li><b>Student:</b> ${student.firstName} ${student.lastName}</li>
             <li><b>Room:</b> ${salle}</li>
             <li><b>Date:</b> ${new Date(schedule).toLocaleString()}</li>
           </ul>
           <p>Please ensure your availability and prepare accordingly.</p>`
        );

        // Email content for student
        const studentEmailContent = generateEmailTemplate(
          `Your Subject "${sujet.titre}" is Scheduled`,
          `<p>Dear <b>${student.firstName} ${student.lastName}</b>,</p>`,
          `<p>Your subject <b>"${sujet.titre}"</b> has been scheduled.</p>
           <p>Details:</p>
           <ul>
             <li><b>Teacher:</b> ${teachers.firstName} ${teachers.lastName}</li>
             <li><b>Room:</b> ${salle}</li>
             <li><b>Date:</b> ${new Date(schedule).toLocaleString()}</li>
           </ul>
           <p>Good luck with your preparation!</p>`
        );

        // Send email to teacher
        await sendNotification({
          email: teachers.email,
          subject:
            type === "modified"
              ? `Modified Plan: ${sujet.titre}`
              : `Planning Assigned: ${sujet.titre}`,
          htmlContent: teacherEmailContent,
          attachments: COMMON_ATTACHMENTS,
        });

        // Send email to student
        await sendNotification({
          email: student.email,
          subject:
            type === "modified"
              ? `Updated Subject: ${sujet.titre}`
              : `Subject Scheduled: ${sujet.titre}`,
          htmlContent: studentEmailContent,
          attachments: COMMON_ATTACHMENTS,
        });

        console.log(
          `Emails sent to teacher (${teachers.email}) and student (${student.email}) for plan ${plan._id}`
        );
      } catch (error) {
        console.error(`Error processing plan ${plan._id}:`, error);
      }
    });

    // Wait for all email notifications to complete
    await Promise.all(notifications);

    res.status(200).json({ message: "Emails sent successfully to all plans." });
  } catch (error) {
    console.error("Error sending planning emails:", error);
    res
      .status(500)
      .json({ message: "Internal error while sending planning emails." });
  }
};
//mail lezem ikoun fyh lien taa planning
//////////////////////////////////////////send mail//////////////////////////////////////

//najem nabdel fazet el parametre !
//modifier planning au cas où !
export const updatePlan = async (req, res) => {
  try {
    const { teacherId, internshipId } = req.body;

    // Vérifier les champs obligatoires
    if (!teacherId || !internshipId) {
      return res.status(400).json({
        message: "teacherId and internshipId are required.",
      });
    }

    // Trouver le planning actuel
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    // Modifier le champ "typeEnvoi" si nécessaire
    if (plan.envoiType === "Premier envoi") {
      plan.envoiType = "Envoi modifié";
    }

    // Mettre à jour les autres champs du planning
    plan.teachers = teacherId;
    plan.sujet = internshipId;

    // Sauvegarder le planning modifié
    const updatedPlan = await plan.save();

    res.status(200).json({
      message: "Planning updated successfully.",
      updatedPlan,
    });
  } catch (e) {
    res.status(500).json({
      error: e.message,
      message: "Error updating the planning.",
    });
  }
};

// masquer ou afficher planning
export const togglePlanVisibility = async (req, res) => {
  try {
    const isPublished = req.params.response === "true";
    // Mettre à jour tous les plannings dans la base de données
    const result = await Plan.updateMany({}, { isPublished: isPublished });
    // Vérifier si des plannings ont été mis à jour
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Aucun planning n'a été modifié." });
    }

    res.status(200).json({
      message: `All schedules have been successfully  ${
        isPublished ? "published" : "hidden"
      } `,
      modifiedCount: result.modifiedCount, // Nombre de plannings modifiés
    });
  } catch (e) {
    res
      .status(404)
      .json({ error: e.message, message: "can't change visibilty status " });
  }
};

//Activité 5.1

export const getTeacherTopics = async (req, res) => {
  try {
    const teacherId = req.auth.userId;

    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required." });
    }

    const plans = await Plan.find({ teachers: teacherId })
      .populate({
        path: "sujet",
        populate: { path: "student", model: "Student" },
      })
      .populate("teachers");

    if (!plans || plans.length === 0) {
      return res
        .status(404)
        .json({ message: "No topics found for this teacher." });
    }

    const response = plans.map((plan) => {
      const sujet = plan.sujet;

      return {
        sujetId: sujet?._id || "ID non disponible",
        sujetTitre: sujet?.titre || "Titre non disponible",
        studentName: `${sujet?.student?.firstName || ""} ${
          sujet?.student?.lastName || ""
        }`.trim(),
        studentEmail: sujet?.student?.email || "Email non disponible",
        documents:
          sujet?.documents.map((doc) => ({
            title: doc.title, // Titre du document
            filename: doc.filename, // Assurez-vous que filename est inclus
          })) || [], // Affiche les titres des documents
        pv: sujet?.pv || null, // Retourner PV s'il existe
      };
    });

    res.status(200).json({
      message: "Liste des sujets pour l'enseignant.",
      sujets: response,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des sujets :", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des sujets.",
      error: error.message,
    });
  }
};
