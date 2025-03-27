import express from "express";
import {
  assignTeachersToTopicsAndCreatePlanning,
  getPlans,
  getTeacher,
  sendPlanningEmails,
  togglePlanVisibility,
  updatePlan,
  getTeacherTopics,
} from "../controllers/assignControllers.js";
import { loggedMiddleware } from "../middlewares/authMiddlewares.js";
import {
  isAdmin,
  isStudentOrAdminOrTeacher,
  isTeacher,
} from "../middlewares/roleMiddlewares.js";

const router = express.Router();

router.post(
  "/assign",
  loggedMiddleware,
  isAdmin,
  assignTeachersToTopicsAndCreatePlanning
);
router.get("/", loggedMiddleware, isStudentOrAdminOrTeacher, getPlans);
router.post("/send/:type", loggedMiddleware, isAdmin, sendPlanningEmails);
router.get("/teacher", loggedMiddleware, isAdmin, getTeacher);
router.post(
  "/publish/:response",
  loggedMiddleware,
  isAdmin,
  togglePlanVisibility
);
router.patch("/update/:id", loggedMiddleware, isAdmin, updatePlan);
///5.1
router.get("/teacher/topics", loggedMiddleware, isTeacher, getTeacherTopics);

export default router;
