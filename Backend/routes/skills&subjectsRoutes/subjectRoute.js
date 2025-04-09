import express from "express";

import {
  isAdmin,
  isAdminOrTeacher,
  isStudentOrAdminOrTeacher,
  isTeacher,
  isStudent,
} from "../../middlewares/roleMiddlewares.js";
import { loggedMiddleware } from "../../middlewares/authMiddlewares.js";
import {
  addProposition,
  createSubject,
  getSubjectDetails,
  getSubjects,
  publishUnpublishAllSubjects,
  sendEvaluationEmailsToStudent,
  updateSubject,
  updateSubjectProgress,
  addEvaluation,
  getEvaluations,
  validateProposition,
  deleteSubject,
  getArchivedSubjects,
  restoreSubject,
} from "../../controllers/skills&subjectsController.js/subjectController.js";
import { validateSubject } from "../../joiValidations/SubjectValidation.js";
import { yearFilter } from "../../middlewares/year.js";

const router = express.Router();

// Routes for subjects
router.post("/", loggedMiddleware, isAdmin, validateSubject, createSubject);
router.get(
  "/",
  loggedMiddleware,
  isStudentOrAdminOrTeacher,
  yearFilter,
  getSubjects
);
router.get(
  "/archived",
  loggedMiddleware,
  isAdmin,
  yearFilter,
  getArchivedSubjects 
);
router.post(
  "/publish/:response",
  loggedMiddleware,
  isAdmin,
  publishUnpublishAllSubjects
);
router.post(
  "/:id/advancement",
  loggedMiddleware,
  isTeacher,
  updateSubjectProgress
);
router.post("/:id/evaluation", loggedMiddleware, isStudent, addEvaluation);

router.get(
  "/:id/evaluation",
  loggedMiddleware,
  isAdminOrTeacher,
  getEvaluations
);
router.get("/:id", loggedMiddleware, isAdminOrTeacher, getSubjectDetails);
router.patch("/:id/proposition", loggedMiddleware, isTeacher, addProposition);
router.post("/:id/validate", loggedMiddleware, isAdmin, validateProposition);
router.post(
  "/evaluation",
  loggedMiddleware,
  isAdmin,
  sendEvaluationEmailsToStudent
);
router.patch("/:id", loggedMiddleware, isAdmin, updateSubject);
router.delete("/:id", loggedMiddleware, isAdmin, deleteSubject);
router.patch("/:id/restore", loggedMiddleware, isAdmin, restoreSubject);




export default router;
