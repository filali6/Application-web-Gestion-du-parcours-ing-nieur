import express from "express";

import { studentValidationSchema } from "../../joiValidations/studentValidation.js";
import { validateStudent } from "../../middlewares/studentValidate.js";
import { loggedMiddleware } from "../../middlewares/authMiddlewares.js";
import { isStudent, iSStudent2ndYear } from "../../middlewares/roleMiddlewares.js";
import { isAdmin } from "../../middlewares/roleMiddlewares.js";
import { upload } from "../../middlewares/upload.js";
import {
  chooseOption,
  viewStudentChoices,
  calculateScoresAndAssignOptions,
  getRankingsByOption,
} from "../../controllers/option/optionController.js";
import {
  validateAssignments,
  modifyAssignment,
  optionAffectationVisibility,
  sendListChoiceEmail,
  getFinalChoiceAndList,
} from "../../controllers/option/choicesController.js";

const router = express.Router();

router.post(
  "/choice",
  loggedMiddleware,
  isStudent,
  iSStudent2ndYear,
  upload.single("transcript"),
  validateStudent(studentValidationSchema),
  chooseOption
);

router.get("/", loggedMiddleware, isAdmin, viewStudentChoices);

router.patch(
  "/compute",
  loggedMiddleware,
  isAdmin,
  calculateScoresAndAssignOptions
); //3.2

router.get("/compute", loggedMiddleware, isAdmin, getRankingsByOption);

router.patch("/validate", loggedMiddleware, isAdmin, validateAssignments); // 4.1

router.patch("/update/:studentId", loggedMiddleware, isAdmin, modifyAssignment); // 4.2

router.post(
  "/publish/:response",
  loggedMiddleware,
  isAdmin,
  optionAffectationVisibility
); //4.3

router.post("/send", loggedMiddleware, isAdmin, sendListChoiceEmail); //4.4

router.get("/listFinalChoice", loggedMiddleware, isStudent, iSStudent2ndYear, getFinalChoiceAndList); //5.1




export default router;
