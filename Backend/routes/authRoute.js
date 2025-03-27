import express from "express";
import {
  loginStudent,
  loginTeacher,
  loginAdmin,
  signupAdmin,
} from "../controllers/authController.js";

const router = express.Router();

//DEFINING THE ROUTES//
router.post("/loginStudent", loginStudent);
router.post("/loginTeacher", loginTeacher);
router.post("/signupAdmin", signupAdmin);
router.post("/loginAdmin", loginAdmin);

export default router;
