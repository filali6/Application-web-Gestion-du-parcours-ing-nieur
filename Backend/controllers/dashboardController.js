import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Skill from '../models/Subject&Skill/Skill.js';
import Subject from '../models/Subject&Skill/Subject.js';

export const getCounts = async (req, res) => {
  try {
    const [students, teachers, skills, subjects] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Skill.countDocuments(),
      Subject.countDocuments(),
    ]);

    res.status(200).json({ students, teachers, skills, subjects });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard counts.' });
  }
};
