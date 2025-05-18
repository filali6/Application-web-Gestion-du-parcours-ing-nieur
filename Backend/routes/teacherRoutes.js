import express from "express";
import {
  addTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  updateTeacherPassword,
  importTeachers,
  decryptTeacherPassword,
  deleteTeacher,
  getAllTeachers
} from "../controllers/teacherController.js";
import { validateTeacher } from "../middlewares/teacherValidate.js";
import { teacherValidationSchema } from "../joiValidations/teacherValidation.js";
import { isAdmin } from "../middlewares/roleMiddlewares.js"; // Vérification du rôle admin
import { loggedMiddleware } from "../middlewares/authMiddlewares.js"; // Import du middleware loggedMiddleware
import { upload } from "../middlewares/upload.js";
import { yearFilter } from "../middlewares/year.js";

const router = express.Router();

router.get(
  "/AllTeachers",
  loggedMiddleware, // Vérifie le token et ajoute req.auth
  isAdmin, // Vérifie que l'utilisateur est un administrateur
  getAllTeachers// Contrôleur pour récupérer la liste des enseignants
);

// ajouter un enseignant
router.post(
  "/",
  loggedMiddleware, // Vérifie le token et ajoute req.auth
  isAdmin, // Vérifie que l'utilisateur est un administrateur
  validateTeacher(teacherValidationSchema), // Validation des données de l'enseignant
  addTeacher // Contrôleur qui ajoute l'enseignant
);

// récupérer la liste des enseignants
router.get(
  "/",
  loggedMiddleware, // Vérifie le token et ajoute req.auth
  isAdmin, // Vérifie que l'utilisateur est un administrateur
  yearFilter,
  getTeachers // Contrôleur pour récupérer la liste des enseignants
);

// récupérer un enseignant par ID
router.get(
  "/:id",
  loggedMiddleware, // Vérifie le token et ajoute req.auth
  isAdmin, // Vérifie que l'utilisateur est un administrateur
  yearFilter,
  getTeacherById // Contrôleur pour récupérer un enseignant par ID
);

// modifier un enseignant
router.patch(
  "/:id",
  loggedMiddleware, // Vérifie le token et ajoute req.auth
  isAdmin, // Vérifie que l'utilisateur est un administrateur
  validateTeacher(teacherValidationSchema), // Validation des données de l'enseignant
  updateTeacher // Contrôleur pour modifier l'enseignant
);

// modifier le mot de passe d'un enseignant
router.patch(
  "/:id/password",
  loggedMiddleware, // Vérifie le token et ajoute req.auth
  isAdmin, // Vérifie que l'utilisateur est un administrateur
  updateTeacherPassword // Contrôleur pour modifier le mot de passe de l'enseignant
);

//importer des enseignants
router.post(
  "/import",
  loggedMiddleware, // Vérifie le token et ajoute req.auth
  isAdmin, // Vérifie que l'utilisateur est un administrateur

  upload.single("file"), // Gestion du fichier Excel

  importTeachers // Contrôleur pour gérer l'importation
);

//supprimer ensignant
router.delete("/:id", loggedMiddleware, isAdmin, deleteTeacher);

//déchiffrer le mdp
router.get("/decrypt/:id", loggedMiddleware, isAdmin, decryptTeacherPassword);




 

export default router;
