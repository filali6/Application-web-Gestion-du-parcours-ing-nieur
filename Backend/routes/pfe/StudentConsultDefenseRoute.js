import express from "express";
import { loggedMiddleware } from "../../middlewares/authMiddlewares.js";
import {
  isStudent,
  iSStudent3rdYear,
} from "../../middlewares/roleMiddlewares.js";

import { getSoutenanceDetailsForStudent } from "../../controllers/pfe/StudentConsultPlan.js";

const router = express.Router();

router.get(
  "/PFE/student/me",
  loggedMiddleware,
  isStudent,
  iSStudent3rdYear,
  getSoutenanceDetailsForStudent
);

export default router;
