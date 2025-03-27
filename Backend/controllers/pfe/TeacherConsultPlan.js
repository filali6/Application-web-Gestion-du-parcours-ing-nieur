import Soutenance from "../../models/Soutenance.js";

export const getSoutenancesForTeacher = async (req, res) => {
  const teacherId = req.auth.userId;

  try {
    const soutenancesCount = await Soutenance.countDocuments({
      "teachers.teacherId": teacherId,
    });

    if (soutenancesCount === 0) {
      return res.status(404).json({
        message:
          "Aucune soutenance trouvée pour cet enseignant en tant que président ou rapporteur.",
      });
    }

    const firstSoutenance = await Soutenance.findOne({
      "teachers.teacherId": teacherId,
    });

    if (!firstSoutenance.isPublished) {
      return res.status(400).json({
        message: "Le planning des soutenances est actuellement masqué.",
      });
    }

    const soutenances = await Soutenance.find({
      "teachers.teacherId": teacherId,
      "teachers.role": { $in: ["president", "rapporteur", "encadrant"] },
    })
      .populate("pfe")
      .populate("student")
      .populate("teachers.teacherId");

    const soutenancesDetails = soutenances.map((soutenance) => {
      return {
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
        president: getTeacherInfo(soutenance.teachers, "president"),
        rapporteur: getTeacherInfo(soutenance.teachers, "rapporteur"),
        encadrant: getTeacherInfo(soutenance.teachers, "encadrant"),
      };
    });

    return res.status(200).json({
      soutenances: soutenancesDetails,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des soutenances :", error);
    return res.status(500).json({
      error: "Une erreur est survenue lors de la récupération des soutenances.",
      details: error.message,
    });
  }
};

const getTeacherInfo = (teachers, role) => {
  const teacher = teachers.find((t) => t.role === role);
  if (teacher) {
    const { firstName, lastName, email } = teacher.teacherId;
    return { firstName, lastName, email };
  }
  return null;
};
