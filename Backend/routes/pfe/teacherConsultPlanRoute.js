import express from "express";
import { loggedMiddleware } from "../../middlewares/authMiddlewares.js";
import { isTeacher } from "../../middlewares/roleMiddlewares.js";

import { getSoutenancesForTeacher } from "../../controllers/pfe/TeacherConsultPlan.js";

const router = express.Router();

router.get("/PFE/me", loggedMiddleware, isTeacher, getSoutenancesForTeacher);

export default router;
