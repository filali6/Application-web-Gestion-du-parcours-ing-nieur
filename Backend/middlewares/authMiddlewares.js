import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Admin from "../models/Admin.js";
import { JWT_SECRET } from "../config.js";

/////////////////////////////// Authentification Middlewares //////////////////////////////////////
export const loggedMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(403).json({ error: "Access denied, token missing" });

    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.userId;

    let UserModel;
    if (decodedToken.role === "student") {
      UserModel = Student;
    } else if (decodedToken.role === "teacher") {
      UserModel = Teacher;
    } else if (decodedToken.role === "admin") {
      UserModel = Admin;
    } else {
      return res.status(400).json({ error: "Invalid role in token" });
    }

    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ error: "User doesn't exist" });
    }

    req.auth = {
      userId: userId,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
