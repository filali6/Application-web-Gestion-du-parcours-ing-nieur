import express from "express";

import {
  isAdmin,
  isTeacher,
  isStudent,
} from "../middlewares/roleMiddlewares.js";
import { loggedMiddleware } from "../middlewares/authMiddlewares.js";
import {
  addMultiplePfas,
  getMyPfaById,
  getMyPfas,
  updateMyPfa,
  deleteMyPfa,
  publishPFA,
  rejectPfa,
  selectPfaChoice,
  listPFAByTeacher,
  generatePlanning,
  getPlanningByTeacher,
  getPlanningByStudent,
  publishOrUnpublishPlannings,
  modifyPlanning,
  getTeacherPlannings
} from "../controllers/Pfa.js";
import {
  assignManuallyPfa,
  autoAssignPFAS,
  listChoicesByStudent,
  publishOrUnpublishAllPFAs,
  sendPFAValidation,
} from "../controllers/PfaValiadation.js";

const router = express.Router();

// Ensure the user is logged in and their role is verified before checking admin/teacher/student rights
router.post("/addPfaS", loggedMiddleware, isTeacher, addMultiplePfas);
router.get("/GetMyPFAs", loggedMiddleware, isTeacher, getMyPfas);
router.get("/GetspecificPFA/:id", loggedMiddleware, isTeacher, getMyPfaById);
router.patch("/:id/updateMyPfa", loggedMiddleware, isTeacher, updateMyPfa);
router.delete("/deletepfa/:id", loggedMiddleware, isTeacher, deleteMyPfa);
router.patch("/reject/:id", loggedMiddleware, isAdmin, rejectPfa);
router.patch("/publish/:response", loggedMiddleware, isAdmin, publishPFA);
router.patch("/choice/:id", loggedMiddleware, isStudent, selectPfaChoice);
router.get("/getPFAbyTeacher", loggedMiddleware, isStudent, listPFAByTeacher);
router.get("/assign/getchoicesbyStudent",loggedMiddleware,isAdmin,listChoicesByStudent);
router.patch("/assign/autoassign", autoAssignPFAS);
router.patch("/:id/assign/student/:studentId", assignManuallyPfa);
router.post("/publishAll/:response", publishOrUnpublishAllPFAs);
router.post("/list/send", sendPFAValidation);

router.post("/generateSoutenances" , loggedMiddleware, isAdmin, generatePlanning)
router.get("/getPlanningByTeacher/:id" ,loggedMiddleware, isAdmin, getPlanningByTeacher)
router.get("/getPlanningByStudent/:id" ,loggedMiddleware, isAdmin, getPlanningByStudent)
router.patch("/publishPlannings/:response", loggedMiddleware, isAdmin, publishOrUnpublishPlannings);
router.patch("/patchPlanning/:id",  loggedMiddleware, isAdmin, modifyPlanning);
router.get("/getMyPlannings/",  loggedMiddleware, isTeacher, getTeacherPlannings);

export default router;
