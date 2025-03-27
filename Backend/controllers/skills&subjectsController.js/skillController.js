import mongoose from "mongoose";
import Skill from "../../models/Subject&Skill/Skill.js";
import Subject from "../../models/Subject&Skill/Subject.js";
import { updateStudentCvsWithSkill } from "../../controllers/cv.js";
import CV from "../../models/cv.js";

////////////////////////////////CREATE A SKILL///////////////////////////////////////
export const createSkill = async (req, res) => {
  // #swagger.tags = ['Skills']
  try {
    const { name, description, subjects, year } = req.body;

    // Check if a skill with the same name already exists
    const existingSkill = await Skill.findOne({ name });
    if (existingSkill) {
      return res.status(400).json({
        message: "A skill with this name already exists.",
      });
    }

    // Validate if all provided subject IDs exist
    if (subjects && subjects.length > 0) {
      const existingSubjects = await Subject.find({ _id: { $in: subjects } });
      if (existingSubjects.length !== subjects.length) {
        return res.status(400).json({
          message: "One or more provided subjects do not exist.",
        });
      }
    }

    // Create the skill
    const newSkill = new Skill({
      name,
      description,
      subjects,
      year,
    });

    await newSkill.save();

    // Mettre à jour les CV après la création de la compétence
    await updateStudentCvsWithSkill(newSkill._id, subjects);

    res.status(201).json({ message: "Skill added successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/////////////////////////////////GET ALL SKILLS/////////////////////////////////
export const getSkills = async (req, res) => {
  // #swagger.tags = ['Skills']
  try {
    const filter = req.yearFilter || {};
    const skills = await Skill.find(filter).populate("subjects", "title level");

    if (skills.length === 0) {
      return res.status(404).json({ message: "No skills found." });
    }

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
  // #swagger.tags = ['Skills']
  const { id } = req.params;

  try {
    const filter = req.yearFilter || {};
    const skill = await Skill.findById({ _id: id, ...filter }).populate(
      "subjects",
      "title level"
    );

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

// //////////////////////////////////UPDATE A SKILL//////////////////////////////////

export const updateSkill = async (req, res) => {
  const { id } = req.params;
  const { name, description, force, subjects } = req.body;

  try {
    // Validate skill ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid skill ID." });
    }

    // Find the skill and populate only the 'title' field of associated subjects
    const skill = await Skill.findById(id).populate({
      path: "subjects",
      select: "title", // Include only the 'title' field
    });

    if (!skill) {
      return res.status(404).json({ message: "Skill not found." });
    }

    // Check if the skill is associated with subjects
    if (!force && skill.subjects && skill.subjects.length > 0) {
      return res.status(400).json({
        message:
          "This skill is associated with subjects and cannot be modified unless force = true.",
      });
    }

    let changesMade = false;

    // Update the skill fields if new values are provided and different
    if (name !== undefined && name !== skill.name) {
      skill.name = name;
      changesMade = true;
    }
    if (description !== undefined && description !== skill.description) {
      skill.description = description;
      changesMade = true;
    }

    if (subjects !== undefined) {
      // Validate provided subjects
      const validSubjects = await Subject.find({ _id: { $in: subjects } });
      if (validSubjects.length !== subjects.length) {
        return res.status(400).json({
          message: "One or more provided subjects do not exist.",
        });
      }

      // Track old and new subjects
      const oldSubjects = skill.subjects.map((s) => s._id.toString());
      const newSubjects = subjects;

      skill.subjects = newSubjects; // Update subjects
      changesMade = true;

      // Identify added and removed subjects
      const addedSubjects = newSubjects.filter(
        (subject) => !oldSubjects.includes(subject.toString())
      );
      const removedSubjects = oldSubjects.filter(
        (subject) => !newSubjects.includes(subject.toString())
      );

      // Update CVs for added subjects
      for (const subjectId of addedSubjects) {
        const subject = await Subject.findById(subjectId).populate(
          "assignedStudent"
        );
        if (subject.assignedStudent) {
          const studentCv = await CV.findOne({
            student: subject.assignedStudent,
          });
          if (studentCv && !studentCv.skills.includes(skill._id)) {
            studentCv.skills.push(skill._id);
            await studentCv.save();
          }
        }
      }

      // Update CVs for removed subjects
      for (const subjectId of removedSubjects) {
        const subject = await Subject.findById(subjectId).populate(
          "assignedStudent"
        );
        if (subject.assignedStudent) {
          const studentCv = await CV.findOne({
            student: subject.assignedStudent,
          });
          if (studentCv) {
            const skillIndex = studentCv.skills.indexOf(skill._id);
            if (skillIndex > -1) {
              studentCv.skills.splice(skillIndex, 1); // Remove skill
              await studentCv.save();
            }
          }
        }
      }
    }

    if (!changesMade) {
      const unchangedSkill = await Skill.findById(id).populate({
        path: "subjects",
        select: "title",
      });
      return res.status(200).json({
        message: "No changes made.",
        skill: unchangedSkill,
      });
    }

    await skill.save();

    const updatedSkill = await Skill.findById(id).populate({
      path: "subjects",
      select: "title",
    });

    res.status(200).json({
      message: "Skill updated successfully.",
      skill: updatedSkill,
    });
  } catch (error) {
    console.error("Error updating skill:", error);
    res.status(500).json({ error: error.message });
  }
};

/////////////////////////////////////DELETE A SKILL////////////////////////////////
export const deleteSkill = async (req, res) => {
  // #swagger.tags = ['Skills']
  const { id } = req.params;
  const { archive } = req.body;

  try {
    const skill = await Skill.findById(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid skill ID." });
    }

    if (!skill) return res.status(404).json({ error: "Skill not found" });

    if (archive !== true && archive !== false) {
      return res
        .status(400)
        .json({ message: "Archive must be true or false." });
    }

    const isAssigned = skill.subjects.length > 0;

    if (isAssigned) {
      if (archive === true) {
        // Check if 'archive' is true in the body
        // Archive the skill instead of deleting by updating isArchived field
        skill.isArchived = true;
        await skill.save();
        return res.status(200).json({
          message:
            "Skill archived successfully because it is linked to subjects.",
        });
      } else {
        return res.status(400).json({
          message: "Cannot delete the skill because it is linked to subjects.",
        });
      }
    }

    // If not linked to any subjects, delete the skill
    await Skill.findByIdAndDelete(id);
    res.status(200).json({ message: "Skill deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////GET ARCHIVED SKILLS/////////////////////////////
export const getArchivedSkills = async (req, res) => {
  // #swagger.tags = ['Skills']
  try {
    const archivedSkills = await Skill.find({ isArchived: true });

    if (archivedSkills.length === 0) {
      return res.status(404).json({ message: "No archived skills found." });
    }
    res.status(200).json({ archivedSkills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
