import express from "express";
import {
  createSkill,
  deleteSkill,
  getArchivedSkills,
  getSkillByID,
  getSkills,
  restoreSkill,
  updateSkill,
} from "../../controllers/skills&subjectsController.js/skillController.js";

import {
  isAdmin,
  isAdminOrTeacher,
} from "../../middlewares/roleMiddlewares.js";
import { loggedMiddleware } from "../../middlewares/authMiddlewares.js";
import validateSkill from "../../middlewares/skillValidateMiddlewares.js";
import { yearFilter } from "../../middlewares/year.js";

const router = express.Router();

// Routes for skills
router.get("/archive", loggedMiddleware, isAdmin, getArchivedSkills);
router.post("/", loggedMiddleware, isAdmin, validateSkill, createSkill);
router.get("/", loggedMiddleware, isAdminOrTeacher, yearFilter, getSkills);
router.get("/:id", loggedMiddleware, isAdmin, yearFilter, getSkillByID);
router.patch("/:id", loggedMiddleware, isAdmin, validateSkill, updateSkill);
router.delete("/:id", loggedMiddleware, isAdmin, deleteSkill);
router.post("/restore/:id", loggedMiddleware,isAdmin, restoreSkill);

export default router;
