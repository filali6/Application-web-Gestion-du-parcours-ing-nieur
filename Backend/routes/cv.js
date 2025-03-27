import express from "express";
import { getCV, getCvByStudentId, updateCV } from "../controllers/cv.js";
import { loggedMiddleware } from "../middlewares/authMiddlewares.js";
import { isAdminOrTeacher, isStudent } from "../middlewares/roleMiddlewares.js";

const router = express.Router();

// modifier cv
router.patch("/student/cv", loggedMiddleware, isStudent, updateCV);

// etudaint recupere sans cv
router.get("/student/cv/me", loggedMiddleware, isStudent, getCV);

// Route pour récupérer le CV d'un étudiant
router.get(
  "/students/:id/cv",
  loggedMiddleware,
  isAdminOrTeacher,
  getCvByStudentId
);

export default router;
