import { Router } from "express";
import { createNewYear, updateStudentStatus } from "../controllers/saison.js";
import { isAdmin } from "../middlewares/roleMiddlewares.js";
import { loggedMiddleware } from "../middlewares/authMiddlewares.js";

const router = Router();

router.post("/", loggedMiddleware, isAdmin, createNewYear);
router.patch("/student/:id", loggedMiddleware, isAdmin, updateStudentStatus);

export default router;
