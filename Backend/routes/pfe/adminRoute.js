import express from "express";
import {
  listChoicesByStudents,
  validateSupervisorChoice,
  assignSubjectToTeacher,
  toggleAffectationVisibility,
  sendPlanningEmail,
  assignDefense,
  publishOrHideDefenses,
  sendPlanDefenceEmail,
  updateDefense,
} from "../../controllers/pfe/adminController.js";
import { loggedMiddleware } from "../../middlewares/authMiddlewares.js";
import { isAdmin } from "../../middlewares/roleMiddlewares.js";
import { yearFilter } from "../../middlewares/year.js";

const router = express.Router();

router.get(
  "/choices",
  loggedMiddleware,
  isAdmin,
  yearFilter,
  listChoicesByStudents
); // 4.1

router.patch(
  "/planning/assign",
  loggedMiddleware,
  isAdmin,
  validateSupervisorChoice
); // 4.2

router.patch(
  "/planning/assign/:id",
  loggedMiddleware,
  isAdmin,
  assignSubjectToTeacher
); // 4.3

router.post(
  "/planning/publish/:response",
  loggedMiddleware,
  isAdmin,
  toggleAffectationVisibility
); // 4.4

router.post("/planning/send", loggedMiddleware, isAdmin, sendPlanningEmail); //4.5

router.post("/PFE/:id/soutenances", loggedMiddleware, isAdmin, assignDefense); //5.1

router.post(
  "/PFE/soutenances/publish/:response",
  loggedMiddleware,
  isAdmin,
  publishOrHideDefenses
); //5.2

router.post(
  "/PFE/soutenances/send",
  loggedMiddleware,
  isAdmin,
  sendPlanDefenceEmail
);//5.3

router.patch("/PFE/:id/soutenances/", loggedMiddleware, isAdmin, updateDefense);//5.4

export default router;