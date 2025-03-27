import express from "express";
import { addPFE, updatePFE } from "../../controllers/pfe/PfeDepo.js";
import { validatePFE } from "../../joiValidations/PfeValidation.js";
import { loggedMiddleware } from "../../middlewares/authMiddlewares.js";
import {
  isStudent,
  isTeacher,
  isAdmin,
} from "../../middlewares/roleMiddlewares.js";
import {
  listAllTopics,
  chooseTopics,
} from "../../controllers/pfe/TopicController.js";
// import {
//   listChoicesByStudents,
//   validateSupervisorChoice,
//   assignSubjectToTeacher,
//   toggleAffectationVisibility,
//   sendPlanningEmail,
// } from "../../controllers/pfe/adminController.js";

const router = express.Router();
router.post("/addPFE", loggedMiddleware, isStudent, validatePFE, addPFE);
router.patch("/:id", loggedMiddleware, isStudent, validatePFE, updatePFE);

router.get("/topics", loggedMiddleware, isTeacher, listAllTopics);
router.patch("/topics/choose", loggedMiddleware, isTeacher, chooseTopics);

// router.get("/choices", loggedMiddleware, isAdmin, listChoicesByStudents); // 4.1

// router.patch(
//   "/planning/assign",
//   loggedMiddleware,
//   isAdmin,
//   validateSupervisorChoice
// ); // 4.2

// router.patch(
//   "/planning/assign/:id",
//   loggedMiddleware,
//   isAdmin,
//   assignSubjectToTeacher
// ); // 4.3

// router.post(
//   "/planning/publish/:response",
//   loggedMiddleware,
//   isAdmin,
//   toggleAffectationVisibility
// ); // 4.4

// router.post("/planning/send", loggedMiddleware, isAdmin, sendPlanningEmail); //4.5

export default router;
