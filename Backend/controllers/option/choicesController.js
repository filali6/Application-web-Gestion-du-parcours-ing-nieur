import Student from "../../models/Student.js";
import {
  generateEmailTemplate,
  COMMON_ATTACHMENTS,
} from "../../notifyWithMail/notifTemplate.js";
import { sendNotification } from "../../notifyWithMail/mailNotif.js";

//////////////////////////////////////////////////////// Validation finale de liste de choix ///////////////////////////////////////////////////////////////////
export const validateAssignments = async (req, res) => {
  try {
    // Récupérer tous les étudiants avec une option affectée
    const students = await Student.find({
      affectedOption: { $ne: null },
    });

    if (!students.length) {
      return res.status(404).json({
        message: "No students with an assigned option found.",
      });
    }

    // Mettre à jour le champ isFinalized pour tous les étudiants affectés
    await Student.updateMany(
      { affectedOption: { $ne: null } },
      { $set: { isOptionValidated: true } }
    );

    res.status(200).json({
      message: "The assignments have been successfully validated.",
    });
  } catch (error) {
    console.error("Error during final validation:", error);
    res.status(500).json({
      error: "An error occurred during final validation.",
      details: error.message,
    });
  }
};

///////////////////////////////////////////////// modify system proposition ///////////////////////////////////////////////////////////
export const modifyAssignment = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { option, raison } = req.body;

    // Vérifier que les données requises sont présentes
    if (!studentId || !option || !raison) {
      return res.status(400).json({
        error: "All fields (option, raison) are mandatory.",
      });
    }

    // Vérifier que l'option est valide
    if (!["inRev", "inLog"].includes(option)) {
      return res.status(400).json({
        error: "The option must be either 'inRev' or 'inLog'.",
      });
    }

    // Récupérer l'étudiant par ID
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        error: "Student not found.",
      });
    }

    // Vérifier si la validation finale est déjà effectuée
    if (student.isOptionValidated) {
      return res.status(403).json({
        error:
          "Final validation has been carried out. Modifications are not allowed.",
      });
    }

    // Mettre à jour l'affectation et la raison
    student.affectedOption = option;
    student.modificationReason = raison;

    // Sauvegarder les modifications
    await student.save();

    res.status(200).json({
      message: "The assignment has been successfully modified.",
      student,
    });
  } catch (error) {
    console.error("Error when modifying the assignment:", error);
    res.status(500).json({
      error: "An error occurred while editing.",
      details: error.message,
    });
  }
};

//////////////// publier/masquer resulatat affectation ///////////////////
export const optionAffectationVisibility = async (req, res) => {
  const { response } = req.params; // true ou false

  try {
    if (response !== "true" && response !== "false") {
      return res.status(400).json({
        message: "Invalid response value. It should be 'true' or 'false'.",
      });
    }

    const isoptionPublished = response === "true";

    // tamel mise ajour lel students lkol
    await Student.updateMany({}, { $set: { isoptionPublished } });

    res.status(200).json({
      message: `Final options assignments successfully ${
        isoptionPublished ? "published" : "hidden"
      }.`,
    });
  } catch (error) {
    console.error("Error toggling planning visibility:", error);
    res.status(500).json({
      error: "An error occurred while toggling planning visibility.",
      details: error.message,
    });
  }
};

//////////////////////////////////////////////////////////////send mail///////////////////////////////////////////////////////////////////
export const sendListChoiceEmail = async (req, res) => {
  try {
    const link = "https://example.com/list"; // Lien vers la liste
    const students = await Student.find(); // Récupère les étudiants affectés

    if (students.length === 0) {
      return res.status(400).json({
        message: "No students found to send emails.",
      });
    }

    // Envoi d'emails
    for (const student of students) {
      // Détermine le type d'envoi en fonction de l'attribut "reason"
      const sendType = student.modificationReason?.trim()
        ? "modified"
        : "first";

      // Contenu du courriel basé sur sendType
      let emailBodyContent = "";
      if (sendType === "first") {
        emailBodyContent = `
          <p>
            Dear student,<br>
            You can now view the list of assigned options, including your assigned option, by visiting the following link:<br>
            <a href="${link}" target="_blank">${link}</a>
              <p>Best regards,<br>The Team.</p>
          </p>
        `;
      } else if (sendType === "modified") {
        emailBodyContent = `
          <p>
            This is an updated notification regarding your assigned options. Please review the updated list by visiting the following link:<br>
            <a href="${link}" target="_blank">${link}</a>
              <p>Best regards,<br>The Team.</p>
          </p>
        `;
      }

      // En-tête de l'email
      const emailHeaderContent = `<h2 style="font-size: 22px; color: #333;">Dear ${student.firstName} ${student.lastName},</h2>`;

      // Génération du template d'email
      const emailHtmlContent = generateEmailTemplate(
        "List of Choices Notification",
        emailHeaderContent,
        emailBodyContent
      );

      // Envoi de l'email
      await sendNotification({
        email: student.email,
        subject: "Your Option Choice",
        htmlContent: emailHtmlContent,
        attachments: COMMON_ATTACHMENTS,
      });

      // Mise à jour de l'état d'envoi dans la base de données
      student.emailSent = true;
      await student.save();
    }

    res.status(200).json({
      message: `Emails successfully sent to ${students.length} student(s).`,
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({
      error: "An error occurred while sending the emails.",
      details: error.message,
    });
  }
};

///////////////////////////////////////////////////////// get choices ///////////////////////////////////////////////////////////////////
export const getFinalChoiceAndList = async (req, res) => {
  try {
    // Get the logged-in student's ID
    const studentId = req.auth.userId;

    // Fetch the student's data along with their assigned option
    const student = await Student.findById(studentId).populate(
      "affectedOption"
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    // Fetch all students with their assigned options
    const allStudents = await Student.find()
      .populate("affectedOption")
      .select("firstName lastName affectedOption");

    // Format the list of all students
    const formattedStudents = allStudents.map((s) => ({
      name: `${s.firstName} ${s.lastName}`,
      option: s.affectedOption ? s.affectedOption : "No option assigned",  
    }));


    const response = {
      yourChoice: student.affectedOption
        ? {
            Option: student.affectedOption,
            score:
              student.integrationYear === "1"
                ? student.score
                : student.globalScore,
          }
        : "No option assigned",
      ChoicesList: formattedStudents,
    };

    // Return the response
    return res.status(200).json({
      message: "Successfully fetched your choice and all students' choices.",
      data: response,
    });
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({
      message: "An error occurred while retrieving the data.",
      details: error.message,
    });
  }
};
