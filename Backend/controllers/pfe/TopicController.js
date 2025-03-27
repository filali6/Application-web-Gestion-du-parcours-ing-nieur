import PFE from "../../models/Pfe.js";

// View available Topics (Mise a jour ajout de verification si le planning et masqué ou pas)

export const listAllTopics = async (req, res) => {
  try {
    const pfes = await PFE.find()
      .populate("student", "firstName lastName")
      .lean(); // Transforme le résultat en objet JavaScript pur

    // publié

    const isPublished = pfes.some((pfe) => pfe.isPublished);

    // masqué
    if (!isPublished) {
      pfes.forEach((pfe) => {
        //masquer les champs
        delete pfe.teacher;
        delete pfe.isAffected;
        delete pfe.isEmailSent;
        delete pfe.planningVersion;
        delete pfe.emailSentDate;
      });
    }

    res.status(200).json({
      data: pfes,
      message: "List of topics retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({
      error: "An error occurred while fetching the topics.",
      details: error.message,
    });
  }
};

// Choose Topics
export const chooseTopics = async (req, res) => {
  try {
    const { subjectIds } = req.body;
    const teacherId = req.auth.userId;

    // Finding subjects that are not available for selection
    const unavailableSubjects = await PFE.find({
      _id: { $in: subjectIds },
      $or: [{ isSelected: true }, { isAffected: true }], // Already selected or validated
    });

    if (unavailableSubjects.length > 0) {
      const unavailableTitles = unavailableSubjects
        .map((sub) => sub.title)
        .join(", ");
      return res.status(400).json({
        message: `The following subject(s) are not available: ${unavailableTitles}.`,
      });
    }

    const subjects = await PFE.find({
      _id: { $in: subjectIds },
      isAffected: false, // Only allow unassigned subjects
      isSelected: false, // only allow not chosen subjects
    });

    if (subjects.length !== subjectIds.length) {
      return res.status(400).json({
        message: "subjects are already assigned or do not exist.",
      });
    }
    // update the model (teacher)
    const updates = subjects.map((subject) => {
      subject.teacher = teacherId; // Assign teacher
      subject.isSelected = true; // Mark as selected
      return subject.save();
    });

    await Promise.all(updates);

    res.status(200).json({
      message: "Subjects successfully chosen by the teacher.",
      subjects,
    });
  } catch (error) {
    console.error("Error choosing subjects:", error);
    res.status(500).json({
      error: "An error occurred while choosing subjects.",
      details: error.message,
    });
  }
};
