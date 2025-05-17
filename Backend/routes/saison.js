import { Router } from "express";
import {
  createNewYear,
  updateStudentStatus,
  getAvailableYears,
} from "../controllers/saison.js";
import { isAdmin } from "../middlewares/roleMiddlewares.js";
import { loggedMiddleware } from "../middlewares/authMiddlewares.js";

const router = Router();

router.post("/", loggedMiddleware, isAdmin, createNewYear);
router.patch("/student/:id", loggedMiddleware, isAdmin, updateStudentStatus);
router.get("/available", loggedMiddleware, isAdmin, getAvailableYears);

export default router;
