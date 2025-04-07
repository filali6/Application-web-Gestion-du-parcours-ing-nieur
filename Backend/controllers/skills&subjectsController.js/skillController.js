// controllers/skills&subjectsController.js/skillController.js
import mongoose from "mongoose";
import Skill from "../../models/Subject&Skill/Skill.js";
import Subject from "../../models/Subject&Skill/Subject.js";
import { updateStudentCvsWithSkill } from "../../controllers/cv.js";
import CV from "../../models/cv.js";

////////////////////////////////CREATE A SKILL///////////////////////////////////////
export const createSkill = async (req, res) => {
  try {
    const { name, description, subjects, year } = req.body;

    const existingSkill = await Skill.findOne({ name });
    if (existingSkill) {
      return res.status(400).json({ message: "A skill with this name already exists." });
    }

    if (subjects && subjects.length > 0) {
      const existingSubjects = await Subject.find({ _id: { $in: subjects } });
      if (existingSubjects.length !== subjects.length) {
        return res.status(400).json({ message: "One or more provided subjects do not exist." });
      }
    }

    const newSkill = new Skill({ name, description, subjects, year });
    await newSkill.save();

    await updateStudentCvsWithSkill(newSkill._id, subjects);

    res.status(201).json({ message: "Skill added successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/////////////////////////////////GET ALL SKILLS/////////////////////////////////
export const getSkills = async (req, res) => {
  try {
    const filter = req.yearFilter || {};
    filter.isArchived = false; // ✅ Exclude archived skills

    const skills = await Skill.find(filter).populate("subjects", "title level");

    const formattedSkills = skills.map((skill) => ({
      id: skill._id,
      name: skill.name,
      description: skill.description,
      subjects: skill.subjects.map((subject) => ({
        id: subject._id,
        title: subject.title,
        level: subject.level,
      })),
    }));

    res.status(200).json(formattedSkills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//////////////////////////////GET SKILL BY ID/////////////////////////////////////////
export const getSkillByID = async (req, res) => {
  const { id } = req.params;

  try {
    const filter = req.yearFilter || {};
    const skill = await Skill.findById({ _id: id, ...filter }).populate("subjects", "title level");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid skill ID." });
    }

    if (!skill) {
      return res.status(404).json({ error: "Skill not found." });
    }

    const formattedSkill = {
      id: skill._id,
      name: skill.name,
      description: skill.description,
      subjects: skill.subjects.map((subject) => ({
        id: subject._id,
        title: subject.title,
        level: subject.level,
      })),
    };

    res.status(200).json(formattedSkill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

////////////////////////////////UPDATE A SKILL//////////////////////////////////
export const updateSkill = async (req, res) => {
  const { id } = req.params;
  const { name, description, force, subjects, isArchived } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid skill ID." });
    }

    const skill = await Skill.findById(id).populate({ path: "subjects", select: "title" });
    if (!skill) return res.status(404).json({ message: "Skill not found." });

    if (!force && skill.subjects.length > 0) {
      return res.status(400).json({ message: "This skill is associated with subjects and cannot be modified unless force = true." });
    }

    let changesMade = false;

    if (name !== undefined && name !== skill.name) {
      skill.name = name;
      changesMade = true;
    }
    if (description !== undefined && description !== skill.description) {
      skill.description = description;
      changesMade = true;
    }

    if (typeof isArchived === 'boolean') {
      skill.isArchived = isArchived;
      changesMade = true;
    }

    if (subjects !== undefined) {
      const validSubjects = await Subject.find({ _id: { $in: subjects } });
      if (validSubjects.length !== subjects.length) {
        return res.status(400).json({ message: "One or more provided subjects do not exist." });
      }

      const oldSubjects = skill.subjects.map((s) => s._id.toString());
      const newSubjects = subjects;

      skill.subjects = newSubjects;
      changesMade = true;

      const addedSubjects = newSubjects.filter(sub => !oldSubjects.includes(sub.toString()));
      const removedSubjects = oldSubjects.filter(sub => !newSubjects.includes(sub.toString()));

      for (const subjectId of addedSubjects) {
        const subject = await Subject.findById(subjectId).populate("assignedStudent");
        if (subject.assignedStudent) {
          const studentCv = await CV.findOne({ student: subject.assignedStudent });
          if (studentCv && !studentCv.skills.includes(skill._id)) {
            studentCv.skills.push(skill._id);
            await studentCv.save();
          }
        }
      }

      for (const subjectId of removedSubjects) {
        const subject = await Subject.findById(subjectId).populate("assignedStudent");
        if (subject.assignedStudent) {
          const studentCv = await CV.findOne({ student: subject.assignedStudent });
          if (studentCv) {
            const index = studentCv.skills.indexOf(skill._id);
            if (index > -1) {
              studentCv.skills.splice(index, 1);
              await studentCv.save();
            }
          }
        }
      }
    }

    if (!changesMade) {
      const unchangedSkill = await Skill.findById(id).populate("subjects", "title");
      return res.status(200).json({ message: "No changes made.", skill: unchangedSkill });
    }

    await skill.save();
    const updatedSkill = await Skill.findById(id).populate("subjects", "title");

    res.status(200).json({ message: "Skill updated successfully.", skill: updatedSkill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/////////////////////////////////////DELETE A SKILL////////////////////////////////
export const deleteSkill = async (req, res) => {
  const { id } = req.params;
  const { archive } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid skill ID." });
    }

    const skill = await Skill.findById(id);
    if (!skill) return res.status(404).json({ error: "Skill not found" });

    if (archive !== true && archive !== false) {
      return res.status(400).json({ message: "Archive must be true or false." });
    }

    const isAssigned = skill.subjects.length > 0;

    if (isAssigned) {
      if (archive === true) {
        skill.isArchived = true;
        await skill.save();
        return res.status(200).json({ message: "Skill archived successfully because it is linked to subjects." });
      } else {
        return res.status(400).json({ message: "Cannot delete the skill because it is linked to subjects." });
      }
    }

    await Skill.findByIdAndDelete(id);
    res.status(200).json({ message: "Skill deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////GET ARCHIVED SKILLS/////////////////////////////
export const getArchivedSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ isArchived: true }).populate("subjects", "title level");

    const formattedSkills = skills.map((skill) => ({
      id: skill._id,
      name: skill.name,
      description: skill.description,
      subjects: skill.subjects.map((subject) => ({
        id: subject._id,
        title: subject.title,
        level: subject.level,
      })),
    }));

    res.status(200).json({ archivedSkills: formattedSkills });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get archived skills', error: error.message });
  }
};

