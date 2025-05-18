import express from "express";

import { addTopic,getTopics } from "../controllers/topic.js";
import { loggedMiddleware } from "../middlewares/authMiddlewares.js";
import { isAdmin, isAdminOrStudent, isAdminOrTeacher, isStudent } from "../middlewares/roleMiddlewares.js";
import { topicUpload } from "../middlewares/topicUpload.js"; // Import du middleware global

const router = express.Router();

// Route pour déposer un sujet
router.post(
  "/topics/drop",
  loggedMiddleware,
  isStudent,
  topicUpload.array("documents", 5), // Jusqu'à 5 fichiers avec contrôle des types
  addTopic
);
router.get(
  "/topics/drop",
  loggedMiddleware,
   isAdminOrStudent,

  getTopics
);

export default router;
