import Soutenance from "../../models/Soutenance.js";

export const getSoutenanceDetailsForStudent = async (req, res) => {
  const studentId = req.auth.userId;

  try {
    const isPlanningPublished = await Soutenance.exists({ isPublished: true });

    if (!isPlanningPublished) {
      return res.status(403).json({
        message: "Le planning des soutenances est actuellement masqué.",
      });
    }

    const soutenance = await Soutenance.findOne({ student: studentId })
      .populate("pfe")
      .populate("teachers.teacherId");

    if (!soutenance) {
      return res.status(404).json({
        message: "Aucune soutenance trouvée pour cet étudiant.",
      });
    }

    const soutenanceDetails = {
      id: soutenance._id,
      room: soutenance.room,
      date: soutenance.date,
      startTime: soutenance.startTime,
      endTime: soutenance.endTime,
      subjectTitle: soutenance.pfe.title,
      description: soutenance.pfe.description,
      technologies: soutenance.pfe.technologies,
      nameCompany: soutenance.pfe.nameCompany,
      emailCompany: soutenance.pfe.emailCompany,
      student: {
        id: soutenance.student._id,
        name: `${soutenance.student.firstName} ${soutenance.student.lastName}`,
        email: soutenance.student.email,
      },
      teachers: soutenance.teachers.map((teacher) => ({
        role: teacher.role,
        firstName: teacher.teacherId.firstName,
        lastName: teacher.teacherId.lastName,
        email: teacher.teacherId.email,
      })),
    };

    return res.status(200).json({
      soutenance: soutenanceDetails,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la soutenance :", error);
    return res.status(500).json({
      error:
        "Une erreur est survenue lors de la récupération des détails de la soutenance.",
      details: error.message,
    });
  }
};
