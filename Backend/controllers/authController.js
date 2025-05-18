import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Admin from "../models/Admin.js";
import { JWT_SECRET } from "../config.js";

////////////////////////////// Login Controller for Student ///////////////////////////////////
export const loginStudent = async (req, res) => {
  const { password, cin } = req.body;

  try {
    const existingStudent = await Student.findOne({ cin });
    if (!existingStudent) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, existingStudent.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: existingStudent._id, role: "student" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        firstName: existingStudent.firstName,
        lastName: existingStudent.lastName,
        level: existingStudent.level,
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


////////////////////////////// Login Controller for Teacher ///////////////////////////////////

export const loginTeacher = async (req, res) => {
  const { password, cin } = req.body;

  try {
    const existingTeacher = await Teacher.findOne({ cin });
    if (!existingTeacher) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, existingTeacher.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid pass" });
    }

    const token = jwt.sign(
      { userId: existingTeacher._id, role: "teacher" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        firstName: existingTeacher.firstName,
        lastName: existingTeacher.lastName
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


///////////////////////////// Login Controller for Admin /////////////////////////////////////////////
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    let existingUser = await Admin.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: existingUser._id, role: existingUser.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

////////////////////////////// Signup Controller for Admin //////////////////////////////////////
export const signupAdmin = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      role, // 'admin' role
    });

    await newAdmin.save();

    return res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
