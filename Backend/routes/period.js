import express from "express";
import { addPeriod, updatePeriod  ,getPeriod, getAllPeriods} from "../controllers/period.js";
import { isAdmin } from "../middlewares/roleMiddlewares.js";
import { loggedMiddleware } from "../middlewares/authMiddlewares.js";
import { validateAddPeriodMiddleware, validateUpdatePeriodMiddleware ,} from "../joiValidations/periodValidation.js";
const router = express.Router();
router.post(
  "/addPeriod",
  loggedMiddleware,
  isAdmin,
  validateAddPeriodMiddleware,
  addPeriod
);
router.patch("/updatePeriod/:id", loggedMiddleware, isAdmin, validateUpdatePeriodMiddleware, updatePeriod);
router.get("/getPeriod/:id", loggedMiddleware, isAdmin, getPeriod);
router.get("/getPeriods", loggedMiddleware, isAdmin, getAllPeriods);

export default router;
