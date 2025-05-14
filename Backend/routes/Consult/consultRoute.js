import express from "express";
import {
  getFinalinternshipDetails,
  getPlanningsDetails,
  getStudentInternshipDetails,
} from "../../controllers/ConsultTopicAndStudents/Consult.js";

import { loggedMiddleware } from "../../middlewares/authMiddlewares.js";
import {
  isAdmin,
  isStudent,
  isTeacher,
} from "../../middlewares/roleMiddlewares.js";
import { updateSoutenance } from "../../controllers/planSoutInternship.js";
import { fillPV, getStudentPVDetails } from "../../controllers/pvController.js";
import { yearFilter } from "../../middlewares/year.js";

const router = express.Router();
//routes
router.get("/type", loggedMiddleware, isAdmin,isTeacher, yearFilter, getPlanningsDetails);
router.get(
  "/type/final",
  loggedMiddleware,
  isAdmin,isTeacher,
  yearFilter,
  getFinalinternshipDetails
);

router.get("/me/:id", loggedMiddleware, isStudent, getStudentInternshipDetails);
router.get("/pv", loggedMiddleware, isStudent, getStudentPVDetails);

router.patch("/:id", loggedMiddleware, isTeacher, updateSoutenance);
router.patch("/type/:id", loggedMiddleware, isTeacher, fillPV);

export default router;
