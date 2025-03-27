import express from "express";
import {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  updateStudentPassword,
  deleteStudent,
  importStudents,
  decryptStudentPassword,
  updateProfile,
} from "../controllers/studentController.js";
import { validateStudent } from "../middlewares/studentValidate.js";
import { studentValidationSchema } from "../joiValidations/studentValidation.js";
import {
  isAdmin,
  isAdminOrTeacher,
  isStudent,
} from "../middlewares/roleMiddlewares.js";
import { loggedMiddleware } from "../middlewares/authMiddlewares.js"; // Import du middleware loggedMiddleware
import { upload } from "../middlewares/upload.js";
import { uploadImage } from "../middlewares/uploadimage.js";
import { yearFilter } from "../middlewares/year.js";

const router = express.Router();

// ajouter un étudiant
router.post(
  "/",
  loggedMiddleware, // Vérifie le token et ajoute req.auth
  isAdmin, // Vérifie que l'utilisateur est un administrateur
  upload.single("transcript"), // Middleware pour gérer le fichier transcript
  validateStudent(studentValidationSchema), // Validation des données de l'étudiant
  addStudent // Contrôleur qui ajoute l'étudiant
);

// changer profil
router.patch(
  "/me",
  loggedMiddleware,
  isStudent,
  uploadImage.single("photo"),
  validateStudent(studentValidationSchema),
  updateProfile
);

// recuperer etudiants
router.get(
  "/",
  loggedMiddleware, // Vérifie le token et ajoute req.auth
  isAdminOrTeacher, // Vérifie que l'utilisateur est un administrateur
  yearFilter,
  getStudents // Contrôleur pour récupérer la liste des étudiants
);

// récupérer un étudiant par ID
router.get(
  "/:id",
  loggedMiddleware, // Vérifie le token et ajoute req.auth
  isAdmin, // Vérifie que l'utilisateur est un administrateur
  yearFilter,
  getStudentById // Contrôleur pour récupérer un étudiant par ID
);

// modifier un étudiant
router.patch(
  "/:id",
  loggedMiddleware, // Vérifie le token et ajoute req.auth
  isAdmin, // Vérifie que l'utilisateur est un administrateur
  upload.single("transcript"),
  validateStudent(studentValidationSchema), // Validation des données de l'étudiant
  updateStudent // Contrôleur pour modifier l'étudiant
);

// modifier le mot de passe d'un étudiant
router.patch(
  "/:id/password",
  loggedMiddleware, // Vérifie le token et ajoute req.auth
  isAdmin, // Vérifie que l'utilisateur est un administrateur
  updateStudentPassword // Contrôleur pour modifier le mot de passe de l'étudiant
);

//supprimer etudiant
router.delete(
  "/:id",
  loggedMiddleware, // Vérifie le token et ajoute req.auth
  isAdmin, // Vérifie que l'utilisateur est un administrateur
  deleteStudent // Contrôleur pour supprimer l'étudiant
);

// importer des etudiants via excel
router.post(
  "/import",
  loggedMiddleware, // Vérifie le token et ajoute req.auth
  isAdmin, // Vérifie que l'utilisateur est un administrateur

  upload.single("file"), // Gestion du fichier Excel

  importStudents // Contrôleur pour gérer l'importation
);

//déchiffrer le mdp
router.get("/decrypt/:id", loggedMiddleware, isAdmin, decryptStudentPassword);

export default router;
