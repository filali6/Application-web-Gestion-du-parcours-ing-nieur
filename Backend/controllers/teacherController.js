import Teacher from "../models/Teacher.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendNotification } from "../notifyWithMail/mailNotif.js";
import { createAccountEmailTemplate } from "../notifyWithMail/notifTemplate.js";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { teacherValidationSchema } from "../joiValidations/teacherValidation.js";
import { encryptPassword, decryptPassword } from "../encryption.js";
import mongoose from "mongoose";

// Fonction pour générer un mot de passe aléatoire
export const generatePassword = (length = 12) => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|<>?";

  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Ajouter un enseignant
export const addTeacher = async (req, res) => {
  try {
    const teacherData = req.body;

    // Check if the CIN already exists
    const existingTeacher = await Teacher.findOne({ cin: teacherData.cin });
    if (existingTeacher) {
      return res.status(400).json({ message: "Le CIN existe déjà." });
    }

    const existingTeacherwithmail = await Teacher.findOne({
      email: teacherData.email,
    });
    if (existingTeacherwithmail) {
      return res.status(400).json({ message: "L'email existe déjà." });
    }

    // Generate a strong random password
    const plainPassword = generatePassword();
    console.log("Mot de passe généré (addTeacher):", plainPassword);
    // Encrypt the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const encryptedPlainPassword = encryptPassword(plainPassword);

    // Create a new teacher with validated data
    const newTeacher = new Teacher({
      ...teacherData,
      password: hashedPassword,
      encryptedPassword: encryptedPlainPassword,
    });

    await newTeacher.save();

    // Prepare email notification
    const emailTemplate = createAccountEmailTemplate("added", {
      firstName: newTeacher.firstName,
      lastName: newTeacher.lastName,
      cin: newTeacher.cin,
      password: plainPassword, // Send plain password to the teacher via email
    });

    // Send email notification
    await sendNotification({
      email: newTeacher.email,
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.htmlContent,
      attachments: emailTemplate.attachments,
    });

    // Respond with success
    res.status(201).json({
      message: `Enseignant ${teacherData.firstName} ${teacherData.lastName} ajouté avec succès.`,
      teacher: {
        ...newTeacher.toObject(),
        password: undefined, // Do not expose the password in the response
        encryptedPassword: undefined,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout de l'enseignant." });
  }
};

// Liste des enseignants
export const getTeachers = async (req, res) => {
  try {
    const filter = req.yearFilter || {};
    const teachers = await Teacher.find(filter).select(
      "-password -encryptedPassword"
    );
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Erreur lors de la récupération des enseignants", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des enseignants.",
    });
  }
};

// Récupérer un enseignant par son ID
export const getTeacherById = async (req, res) => {
  try {
    const filter = req.yearFilter || {};
    const { id } = req.params;
    const teacher = await Teacher.findById({ _id: id, ...filter }).select(
      "-password -encryptedPassword"
    );
    if (!teacher) {
      return res.status(404).json({ message: "Enseignant non trouvé." });
    }
    res.status(200).json(teacher);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'enseignant", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération de l'enseignant.",
    });
  }
};

// Modifier un enseignant
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Recherche de l'enseignant à mettre à jour
    const teacherToUpdate = await Teacher.findById(id);
    if (!teacherToUpdate) {
      return res.status(404).json({ message: "Enseignant non trouvé." });
    }

    let cinChanged = false; // Flag pour vérifier si le CIN a changé

    // Vérification de l'unicité du CIN s'il est modifié
    if (updatedData.cin && updatedData.cin !== teacherToUpdate.cin) {
      const existingTeacher = await Teacher.findOne({ cin: updatedData.cin });
      if (existingTeacher) {
        return res.status(400).json({ message: "Le CIN existe déjà." });
      }
      teacherToUpdate.cin = updatedData.cin; // Mettre à jour le CIN
      cinChanged = true; // Marquer que le CIN a changé
    }

    // Mise à jour des champs envoyés dans updatedData
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] !== undefined) {
        teacherToUpdate[key] = updatedData[key]; // Met à jour uniquement les champs modifiés
      }
    });

    // Sauvegarder les modifications
    await teacherToUpdate.save();
    teacherToUpdate.password = undefined;
    teacherToUpdate.encryptedPassword = undefined;

    // Envoyer un email si le CIN a changé
    if (cinChanged) {
      const emailTemplate = createAccountEmailTemplate(
        "updatedC",
        teacherToUpdate
      );
      await sendNotification({
        email: teacherToUpdate.email,
        subject: emailTemplate.subject,
        htmlContent: emailTemplate.htmlContent,
        attachments: emailTemplate.attachments,
      });
    }

    // Retourner la réponse avec les informations mises à jour
    res.status(200).json({
      message: `Enseignant ${teacherToUpdate.firstName} ${teacherToUpdate.lastName} modifié avec succès.`,
      teacher: teacherToUpdate,
    });
  } catch (error) {
    console.error("Erreur lors de la modification de l'enseignant", error);
    res.status(500).json({
      message: "Erreur serveur lors de la modification de l'enseignant.",
    });
  }
};

// Modifier le mot de passe d'un enseignant
export const updateTeacherPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Les mots de passe ne correspondent pas." });
    }

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: "Enseignant non trouvé." });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, teacher.password);
    if (!passwordMatch) {
      return res.status(400).json({
        message: "L'ancien mot de passe est incorrect.",
      });
    }

    const plainPassword = newPassword;
    // Encrypt the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    teacher.password = hashedPassword;
    const encryptedNewPassword = encryptPassword(newPassword);
    teacher.encryptedPassword = encryptedNewPassword;

    await teacher.save();

    // Envoi de l'email après la modification du mot de passe
    const emailTemplate = createAccountEmailTemplate("updatedP", {
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      cin: teacher.cin,
      password: plainPassword,
    });
    await sendNotification({
      email: teacher.email,
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.htmlContent,
      attachments: emailTemplate.attachments,
    });

    res.status(200).json({
      message: "Mot de passe modifié avec succès.",
    });
  } catch (error) {
    console.error("Erreur lors de la modification du mot de passe", error);
    res.status(500).json({
      message: "Erreur serveur lors de la modification du mot de passe.",
    });
  }
};

// Importer des enseignants à partir d'un fichier Excel
export const importTeachers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni." });
    }

    // Vérification du type de fichier
    const allowedMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Le fichier fourni n'est pas un fichier Excel valide.",
      });
    }

    // Lecture du fichier Excel
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    if (!workbook || workbook.SheetNames.length === 0) {
      return res.status(400).json({ message: "Le fichier Excel est vide." });
    }

    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const importedTeachers = [];
    const errors = [];

    for (const row of sheetData) {
      try {
        // Vérifier si le CIN existe déjà
        const existingTeacher = await Teacher.findOne({
          cin: String(row["cin"]),
        });
        if (existingTeacher) {
          errors.push({
            cin: row["cin"],
            message: "Un enseignant avec ce CIN existe déjà.",
          });
          continue;
        }

        // Mapper les données d'une ligne
        const mappedRow = {
          cin: String(row["cin"] || ""),
          email: row["email"],
          firstName: row["prenom"],
          lastName: row["Nom"],
          phoneNumber: row["tel"] ? String(row["tel"]) : undefined,
          grade: row["grade"],
        };

        // Valider les données avec Joi (sans mot de passe)
        const { error } = teacherValidationSchema.validate(mappedRow, {
          abortEarly: false,
        });
        if (error) {
          errors.push({
            row: mappedRow,
            message: error.details.map((detail) => detail.message),
          });
          continue;
        }

        // Générer un mot de passe et le hacher
        const plainPassword = generatePassword();
        console.log(
          `Mot de passe généré pour ${mappedRow.email} (importTeachers):`,
          plainPassword
        );
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const encryptedPlainPassword = encryptPassword(plainPassword);

        // Ajouter le mot de passe au mappedRow après validation
        mappedRow.password = hashedPassword;
        mappedRow.encryptedPassword = encryptedPlainPassword;

        // Créer un nouvel enseignant
        const newTeacher = new Teacher(mappedRow);
        await newTeacher.save();

        // Envoyer un e-mail avec les détails du compte
        const emailTemplate = createAccountEmailTemplate("added", {
          firstName: newTeacher.firstName,
          lastName: newTeacher.lastName,
          cin: newTeacher.cin,
          password: plainPassword,
        });

        await sendNotification({
          email: newTeacher.email,
          subject: emailTemplate.subject,
          htmlContent: emailTemplate.htmlContent,
          attachments: emailTemplate.attachments,
        });

        // Ajouter à la liste des enseignants importés
        importedTeachers.push(newTeacher);
      } catch (error) {
        console.error("Erreur lors de l'importation d'une ligne :", error);
        errors.push({
          cin: row["cin"],
          message: "Erreur lors de l'importation.",
        });
      }
    }

    // Résultat final
    res.status(200).json({
      message: "Importation terminée.",
      imported: importedTeachers.length,
      errors,
    });
  } catch (error) {
    console.error("Erreur lors de l'importation des étudiants :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// supprimer un enseignat
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.body;

    // Vérification et conversion de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide." });
    }
    const objectId = new mongoose.Types.ObjectId(id); // Utilisation correcte de `new`

    // Rechercher l'étudiant à supprimer
    const teacherToDelete = await Teacher.findById(objectId);
    if (!teacherToDelete) {
      return res.status(404).json({ message: "Enseignant non trouvé." });
    }

    // Récupérer tous les modèles Mongoose
    const models = mongoose.modelNames();

    let hasRelations = false;

    for (const modelName of models) {
      // Ignorer le modèle "Teacher" lui-même
      if (modelName === "Teacher") continue;

      const Model = mongoose.models[modelName];

      // Requête pour vérifier les relations
      const isRelated = await Model.exists({
        $or: Object.keys(Model.schema.paths)
          .filter((field) => {
            const fieldType = Model.schema.paths[field].instance;
            const isArray = Model.schema.paths[field].$isMongooseArray; // Détecte les tableaux
            return (
              fieldType === "ObjectId" || fieldType === "String" || isArray
            );
          })
          .map((field) => ({
            [field]:
              Model.schema.paths[field].instance === "ObjectId" ||
              Model.schema.paths[field].$isMongooseArray
                ? { $in: [objectId] } // Si tableau d'ObjectId
                : id, // Sinon, chaîne brute
          })),
      });

      if (isRelated) {
        hasRelations = true;
        break; // Arrêter si une relation est trouvée
      }
    }

    if (hasRelations && (typeof force !== "boolean" || force !== true)) {
      return res.status(400).json({
        message:
          "L'enseignant a des relations avec d'autres entités (PFA, PFE, etc.). Ajoutez { force: true } dans le corps de la requête pour forcer la suppression.",
      });
    }

    // Suppression de l'étudiant
    await Teacher.findByIdAndDelete(objectId);

    res.status(200).json({
      message: `Enseignant ${teacherToDelete.firstName} ${teacherToDelete.lastName} supprimé avec succès.`,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'enseignant :",
      error.message
    );
    res.status(500).json({
      message: `Erreur serveur lors de la suppression de l'enseignant : ${error.message}`,
    });
  }
};
//déchiffrer le mdp
export const decryptTeacherPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: "Enseignant non trouvé." });
    }

    const decryptedPassword = decryptPassword(teacher.encryptedPassword);

    res.status(200).json({
      message: "Mot de passe déchiffré avec succès.",
      password: decryptedPassword,
    });
  } catch (error) {
    console.error("Erreur lors du déchiffrement du mot de passe", error);
    res.status(500).json({
      message: "Erreur serveur lors du déchiffrement du mot de passe.",
    });
  }
};
