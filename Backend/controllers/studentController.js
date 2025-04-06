import Student from "../models/Student.js";
import crypto from "crypto";
import { sendNotification } from "../notifyWithMail/mailNotif.js";
import { createAccountEmailTemplate } from "../notifyWithMail/notifTemplate.js";
import bcrypt from "bcrypt";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { studentValidationSchema } from "../joiValidations/studentValidation.js";
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

// ajouter un étudiant
export const getStudentsPFA = async (req, res) => {
  try {
    const Students = await Student.find({
      level: 2,
    }).select("-password -encryptedPassword");

    res.status(200).json(Students);
  } catch (error) {
    console.error("Erreur lors de la récupération des étudiants", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des étudiants.",
    });
  }
};
export const addStudent = async (req, res) => {
  try {
    const studentData = req.body;

    const existingStudent = await Student.findOne({ cin: studentData.cin });
    if (existingStudent) {
      return res.status(400).json({ message: "Le CIN existe déjà." });
    }

    const existingStudentwithmail = await Student.findOne({
      email: studentData.email,
    });
    if (existingStudentwithmail) {
      return res.status(400).json({ message: "L'email existe déjà." });
    }

    let transcriptPath = null;
    if (req.file) {
      const uploadDir = "./uploads";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${req.file.originalname}`;
      transcriptPath = path.join(uploadDir, fileName);
      fs.writeFileSync(transcriptPath, req.file.buffer);
    }

    const plainPassword = generatePassword();
    console.log("Mot de passe généré (addStudent):", plainPassword); // Ajout du console.log ici

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const encryptedPlainPassword = encryptPassword(plainPassword);

    const newStudent = new Student({
      ...studentData,
      password: hashedPassword,
      encryptedPassword: encryptedPlainPassword,
      transcript: transcriptPath,
    });

    await newStudent.save();

    const emailTemplate = createAccountEmailTemplate("added", {
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      cin: newStudent.cin,
      password: plainPassword,
    });

    await sendNotification({
      email: newStudent.email,
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.htmlContent,
      attachments: emailTemplate.attachments,
    });

    res.status(201).json({
      message: `Étudiant ${studentData.firstName} ${studentData.lastName} ajouté avec succès.`,
      student: {
        ...newStudent.toObject(),
        password: undefined,
        encryptedPassword: undefined,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'ajout de l'étudiant." });
  }
};

// liste des etudiants
export const getStudents = async (req, res) => {
  try {
    const filter = req.yearFilter || {};
    const students = await Student.find(filter).select(
      "-password -encryptedPassword"
    );
    res.status(200).json(students);
  } catch (error) {
    console.error("Erreur lors de la récupération des étudiants", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des étudiants.",
    });
  }
};

// recuperer un etudiant
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = req.yearFilter || {};
    const student = await Student.findById({ _id: id, ...filter }).select(
      "-password -encryptedPassword"
    );
    if (!student) {
      return res.status(404).json({ message: "Étudiant non trouvé." });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'étudiant", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération de l'étudiant.",
    });
  }
};

// modifier un étudiant
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Check if the request body is empty
    if (!Object.keys(updatedData).length && !req.file) {
      return res
        .status(400)
        .json({ message: "Aucune donnée à mettre à jour." });
    }

    const studentToUpdate = await Student.findById(id);
    if (!studentToUpdate) {
      return res.status(404).json({ message: "Étudiant non trouvé." });
    }

    let cinChanged = false; // Flag pour vérifier si le CIN a changé

    // Vérification de l'unicité du CIN s'il est modifié
    if (updatedData.cin && updatedData.cin !== studentToUpdate.cin) {
      const existingStudent = await Student.findOne({ cin: updatedData.cin });
      if (existingStudent) {
        return res.status(400).json({ message: "Le CIN existe déjà." });
      }
      studentToUpdate.cin = updatedData.cin; // Mettre à jour le CIN
      cinChanged = true; // Marquer que le CIN a changé
    }

    // Gestion du fichier transcript
    if (req.file) {
      const uploadDir = "./uploads";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${req.file.originalname}`;
      const transcriptPath = path.join(uploadDir, fileName);

      // Sauvegarder le fichier sur le disque
      fs.writeFileSync(transcriptPath, req.file.buffer);

      // Supprimer l'ancien fichier si nécessaire
      if (
        studentToUpdate.transcript &&
        fs.existsSync(studentToUpdate.transcript)
      ) {
        fs.unlinkSync(studentToUpdate.transcript);
      }

      studentToUpdate.transcript = transcriptPath;
    }

    // Mettre à jour les autres champs
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] !== undefined) {
        studentToUpdate[key] = updatedData[key];
      }
    });

    await studentToUpdate.save();
    studentToUpdate.password = undefined;
    studentToUpdate.encryptedPassword = undefined;

    // Envoyer un email si le CIN a changé
    if (cinChanged) {
      const emailTemplate = createAccountEmailTemplate(
        "updatedC",
        studentToUpdate
      );
      await sendNotification({
        email: studentToUpdate.email,
        subject: emailTemplate.subject,
        htmlContent: emailTemplate.htmlContent,
        attachments: emailTemplate.attachments,
      });
    }

    res.status(200).json({
      message: `Étudiant ${studentToUpdate.firstName} ${studentToUpdate.lastName} modifié avec succès.`,
      student: studentToUpdate,
    });
  } catch (error) {
    console.error("Erreur lors de la modification de l'étudiant", error);
    res.status(500).json({
      message: "Erreur serveur lors de la modification de l'étudiant.",
    });
  }
};

// modifier le mot de passe d'un étudiant
export const updateStudentPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Les mots de passe ne correspondent pas." });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Étudiant non trouvé." });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, student.password);
    if (!passwordMatch) {
      return res.status(400).json({
        message: "L'ancien mot de passe est incorrect.",
      });
    }

    const plainPassword = newPassword;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    student.password = hashedPassword;
    const encryptedNewPassword = encryptPassword(newPassword);
    student.encryptedPassword = encryptedNewPassword;

    await student.save();

    // Send email notification
    const emailTemplate = createAccountEmailTemplate("updatedP", {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      cin: student.cin,
      password: plainPassword,
    });
    await sendNotification({
      email: student.email,
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

// supprimer un etudiant
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.body;

    // Vérification et conversion de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide." });
    }
    const objectId = new mongoose.Types.ObjectId(id); // Utilisation correcte de `new`

    // Rechercher l'étudiant à supprimer
    const studentToDelete = await Student.findById(objectId);
    if (!studentToDelete) {
      return res.status(404).json({ message: "Étudiant non trouvé." });
    }

    // Récupérer tous les modèles Mongoose
    const models = mongoose.modelNames();

    let hasRelations = false;

    for (const modelName of models) {
      // Ignorer le modèle "Student" lui-même
      if (modelName === "Student") continue;

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
          "L'étudiant a des relations avec d'autres entités (PFA, PFE, etc.). Ajoutez { force: true } dans le corps de la requête pour forcer la suppression.",
      });
    }

    // Suppression de l'étudiant
    await Student.findByIdAndDelete(objectId);

    res.status(200).json({
      message: `Étudiant ${studentToDelete.firstName} ${studentToDelete.lastName} supprimé avec succès.`,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'étudiant :",
      error.message
    );
    res.status(500).json({
      message: `Erreur serveur lors de la suppression de l'étudiant : ${error.message}`,
    });
  }
};

// Importer des étudiants à partir d'un fichier Excel
export const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni." });
    }

    const allowedMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Le fichier fourni n'est pas un fichier Excel valide.",
      });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    if (!workbook || workbook.SheetNames.length === 0) {
      return res.status(400).json({ message: "Le fichier Excel est vide." });
    }

    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const importedStudents = [];
    const errors = [];

    for (const row of sheetData) {
      try {
        const existingStudent = await Student.findOne({
          cin: String(row["cin"]),
        });
        if (existingStudent) {
          errors.push({
            cin: row["cin"],
            message: "Un étudiant avec ce CIN existe déjà.",
          });
          continue;
        }

        const mappedRow = {
          cin: String(row["cin"] || ""),
          email: row["email"],
          firstName: row["prenom"],
          lastName: row["Nom"],
          gender: row["sexe"] === "Masculin" ? "Male" : "Female",
          dateOfBirth: row["Date nais"],
          governorate: row["Gouvernorat"],
          address: row["Adresse"],
          city: row["Ville"],
          postalCode: row["cp"] ? String(row["cp"]) : undefined,
          nationality: row["nation"],
          phoneNumber: row["tel"] ? String(row["tel"]) : undefined,
          bacDiploma: row["bac"],
          bacGraduationYear: row["anneBac"]
            ? String(row["anneBac"])
            : undefined,
          bacMoy: row["moyenneBac"],
          honors: row["Mention"],
          university: row["université"],
          institution: row["etablissement"],
          licenceType: row["typeL"],
          specialization: row["Spécialité"],
          licenceGraduationYear: row["Année Licence"],
          level: row["cfil"] === "GIAM223" ? 2 : 1,
        };

        const { error } = studentValidationSchema.validate(mappedRow, {
          abortEarly: false,
        });
        if (error) {
          errors.push({
            row: mappedRow,
            message: error.details.map((detail) => detail.message),
          });
          continue;
        }

        const plainPassword = generatePassword();
        console.log(
          `Mot de passe généré pour ${mappedRow.email} (importStudents):`,
          plainPassword
        ); // Ajout du console.log ici

        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const encryptedPlainPassword = encryptPassword(plainPassword);

        mappedRow.password = hashedPassword;
        mappedRow.encryptedPassword = encryptedPlainPassword;

        const newStudent = new Student(mappedRow);
        await newStudent.save();

        const emailTemplate = createAccountEmailTemplate("added", {
          firstName: newStudent.firstName,
          lastName: newStudent.lastName,
          cin: newStudent.cin,
          password: plainPassword,
        });

        await sendNotification({
          email: newStudent.email,
          subject: emailTemplate.subject,
          htmlContent: emailTemplate.htmlContent,
          attachments: emailTemplate.attachments,
        });

        importedStudents.push(newStudent);
      } catch (error) {
        console.error("Erreur lors de l'importation d'une ligne :", error);
        errors.push({
          cin: row["cin"],
          message: "Erreur lors de l'importation.",
        });
      }
    }

    res.status(200).json({
      message: "Importation terminée.",
      imported: importedStudents.length,
      errors,
    });
  } catch (error) {
    console.error("Erreur lors de l'importation des étudiants :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

//déchiffrer le mdp
export const decryptStudentPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Etudiant non trouvé." });
    }

    const decryptedPassword = decryptPassword(student.encryptedPassword);

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

//changer profil

export const updateProfile = async (req, res) => {
  try {
    const { phoneNumber, address, email } = req.body;

    // Vérifier si aucune donnée n'est fournie
    if (!phoneNumber && !address && !email && !req.file) {
      return res
        .status(400)
        .json({ message: "Aucune donnée à mettre à jour." });
    }

    // Récupérer l'étudiant à partir de l'ID dans req.auth
    const student = await Student.findById(req.auth.userId);

    if (!student) {
      return res.status(404).json({ message: "Étudiant non trouvé." });
    }

    let updatedFields = {}; // Objet pour stocker les champs modifiés

    // Vérification de l'adresse vide
    if (address !== undefined && address.trim() === "") {
      return res
        .status(400)
        .json({ message: "L'adresse ne peut pas être vide." });
    }

    // Vérifier l'unicité de l'email si changé
    if (email && email !== student.email) {
      const existingStudentWithEmail = await Student.findOne({ email });
      if (existingStudentWithEmail) {
        return res.status(400).json({ message: "Cet email est déjà utilisé." });
      }
      student.email = email;
      updatedFields.email = email; // Ajouter email aux champs modifiés
    }

    // Mettre à jour l'adresse si elle est différente
    if (address && address !== student.address) {
      student.address = address;
      updatedFields.address = address; // Ajouter address aux champs modifiés
    }

    // Mettre à jour le numéro de téléphone si il est différent
    if (phoneNumber && phoneNumber !== student.phoneNumber) {
      student.phoneNumber = phoneNumber;
      updatedFields.phoneNumber = phoneNumber; // Ajouter phoneNumber aux champs modifiés
    }

    // Gestion de la photo
    if (req.file) {
      const uploadDir = "./uploads/images";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Nom unique pour l'image
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const photoPath = path.join(uploadDir, fileName);

      // Sauvegarder l'image sur le disque
      fs.writeFileSync(photoPath, req.file.buffer);

      // Mettre à jour le champ photo dans l'étudiant
      student.photo = photoPath;
      updatedFields.photo = photoPath; // Ajouter photo aux champs modifiés
    }

    // Si aucun champ n'a été modifié
    if (Object.keys(updatedFields).length === 0) {
      return res
        .status(200)
        .json({ message: "Aucune modification n'a été effectuée." });
    }

    // Sauvegarder les modifications
    await student.save();

    // Répondre avec seulement les champs modifiés
    res.status(200).json({
      message: "Profil mis à jour avec succès.",
      updatedFields,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la mise à jour du profil." });
  }
};
