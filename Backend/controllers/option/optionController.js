import Student from "../../models/Student.js";
import Period from "../../models/Period.js";
import Option from "../../models/Option.js";

///////////////////////////////////////////Choose option////////////////////////////////////////////////////////
export const chooseOption = async (req, res) => {
  try {
    const studentId = req.auth.userId;
    const {
      chosenOption,
      isRepeaterInFirstYear,
      webDevGrade,
      moyG,
      oopGrade,
      algorithmsGrade,
      globalScore,
      integrationYear,
    } = req.body;

    //// Transcript handling////
    const transcriptPath = req.file ? req.file.buffer : null;

    //// Period Handling ////
    const periodDate = new Date();
    const matchingPeriod = await Period.findOne({ type: "option" });

    if (!matchingPeriod) {
      return res
        .status(400)
        .json({ error: "No valid period found for option choice." });
    }

    if (
      periodDate < new Date(matchingPeriod.StartDate) ||
      periodDate > new Date(matchingPeriod.EndDate)
    ) {
      return res.status(400).json({
        error: `The provided period must fall between ${matchingPeriod.StartDate} and ${matchingPeriod.EndDate}.`,
      });
    }

    //// Choice handling ///
    if (!["inLog", "inRev"].includes(chosenOption)) {
      return res.status(400).json({
        message: "Invalid option. Only 'inLog' or 'inRev' are allowed.",
      });
    }

    /// Get the student by their ID ////
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (student.chosenOption) {
      return res
        .status(400)
        .json({ message: "You have already chosen an option." });
    }

    /// Handling integration year ///
    if (!student.integrationYear) {
      student.integrationYear = integrationYear;
    }

    if (!student.integrationYear) {
      return res.status(400).json({ message: "Integration year is required." });
    }

    if (student.integrationYear === "1") {
      if (
        !webDevGrade ||
        !oopGrade ||
        !algorithmsGrade ||
        !moyG ||
        !isRepeaterInFirstYear ||
        !transcriptPath
      ) {
        return res.status(400).json({
          message:
            "For students integrated in the first year, whether you are a repeater or not, General score, web development Grade, Oriented-Object Programming Grade, algorithms Grade, and transcript are required.",
        });
      }

      ///  first-year
      student.webDevGrade = webDevGrade;
      student.oopGrade = oopGrade;
      student.algorithmsGrade = algorithmsGrade;
      student.moyG = moyG;
      student.isRepeaterInFirstYear = isRepeaterInFirstYear;
    } else if (student.integrationYear === "2") {
      if (!globalScore || !transcriptPath) {
        return res.status(400).json({
          message:
            "For students coming from a master's degree, globalScore and transcript are required.",
        });
      }

      /// second-year
      student.globalScore = globalScore;
    } else {
      return res.status(400).json({ message: "Invalid integration year." });
    }

    // Save the chosen option and transcript
    student.chosenOption = chosenOption;
    student.transcript = transcriptPath;

    await student.save();

    res.status(200).json({
      message: "Option and details successfully saved.",
      student,
    });
  } catch (error) {
    console.error("Error choosing option:", error);
    res.status(500).json({
      error: "An error occurred while saving your choice.",
      details: error.message,
    });
  }
};

export const viewStudentChoices = async (req, res) => {
  try {
    const studentChoices = await Student.find({ chosenOption: { $ne: null } }) // Filter only students with a chosen option
      .select("firstName lastName cin email chosenOption yearOfIntegration ");

    if (!studentChoices.length) {
      return res.status(404).json({ message: "No student choices found." });
    }

    res.status(200).json({
      message: "Student choices retrieved successfully.",
      data: studentChoices,
    });
  } catch (error) {
    console.error("Error retrieving student choices:", error);
    res.status(500).json({
      error: "An error occurred while retrieving student choices.",
      details: error.message,
    });
  }
};

///////////////////////////////////////////////////// Score calculation ////////////////////////////////////////////////////////////////
export const calculateScoresAndAssignOptions = async (req, res) => {
  try {
    const { inRevPercentage, inLogPercentage } = req.body;
    console.log("Received percentages:", { inRevPercentage, inLogPercentage });

    if (inRevPercentage + inLogPercentage !== 100) {
      console.log("Invalid percentages");
      return res.status(400).json({
        error: "Les pourcentages doivent être égaux à 100.",
      });
    }

    const students = await Student.find({ chosenOption: { $ne: null } }); // Filter only students with a chosen option

    if (!students.length) {
      console.log("No students found with chosenOption");
      return res.status(404).json({
        message: "No students found with chosenOption",
      });
    }

    /// Capacities ///
    const totalCapacity = students.length;
    console.log("Total capacity:", totalCapacity);

    const inRevCapacity = Math.round((totalCapacity * inRevPercentage) / 100);
    const inLogCapacity = Math.round((totalCapacity * inLogPercentage) / 100);
    console.log("Capacities:", { inRevCapacity, inLogCapacity });

    // Calculate scores
    students.forEach((student) => {
      if (student.integrationYear === "1") {
        student.score =
          2 * student.moyG +
          student.webDevGrade +
          student.algorithmsGrade +
          student.oopGrade;

        if (student.isRepeaterInFirstYear) {
          student.score -= 10;
        }
      } else if (student.integrationYear === "2") {
        student.score = student.globalScore;
      }
    });

    // Sort students
    const sortedStudents = students.sort((a, b) => b.score - a.score);

    // Allocate capacities
    const firstYearInRevCapacity = Math.round((inRevCapacity * 86) / 100);
    const secondYearInRevCapacity = inRevCapacity - firstYearInRevCapacity;

    const firstYearInLogCapacity = Math.round((inLogCapacity * 86) / 100);
    const secondYearInLogCapacity = inLogCapacity - firstYearInLogCapacity;

    // Assign options
    const assignments = { inRev: [], inLog: [] }; //classement
    sortedStudents.forEach((student) => {
      if (student.chosenOption === "inRev") {
        if (
          (student.integrationYear === "1" &&
            assignments.inRev.length < firstYearInRevCapacity) ||
          (student.integrationYear === "2" &&
            assignments.inRev.length < secondYearInRevCapacity)
        ) {
          assignments.inRev.push(student);
          student.affectedOption = "inRev";
        } else {
          assignments.inLog.push(student); // assign 2nd option
          student.affectedOption = "inLog";
        }
      } else if (student.chosenOption === "inLog") {
        if (
          (student.integrationYear === "1" &&
            assignments.inLog.length < firstYearInLogCapacity) ||
          (student.integrationYear === "2" &&
            assignments.inLog.length < secondYearInLogCapacity)
        ) {
          assignments.inLog.push(student);
          student.affectedOption = "inLog";
        } else {
          assignments.inRev.push(student); /// assign 2nd option
          student.affectedOption = "inRev";
        }
      }
    });
    console.log(
      "Assignments for inRev:",
      assignments.inRev.map((student) => student.email)
    );
    console.log(
      "Assignments for inLog:",
      assignments.inLog.map((student) => student.email)
    );

    // Save updated students
    for (const student of sortedStudents) {
      await student.save();
    }

    // Save options and assigned students in the database
    const inRevOption = await Option.findOneAndUpdate(
      { name: "inRev" },
      {
        capacity: inRevCapacity,
        assignedStudents: assignments.inRev.map((student) => student._id),
      },
      { new: true, upsert: true }
    );

    const inLogOption = await Option.findOneAndUpdate(
      { name: "inLog" },
      {
        capacity: inLogCapacity,
        assignedStudents: assignments.inLog.map((student) => student._id),
      },
      { new: true, upsert: true }
    );

    console.log("Options updated:", { inRevOption, inLogOption });

    res
      .status(200)
      .json({ message: "Scores calculated and options assigned." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Une erreur s'est produite lors du traitement.",
      details: error.message,
    });
  }
};

//////////////////////////////////////////////// Le classement par option ///////////////////////////////////////////////////////////
export const getRankingsByOption = async (req, res) => {
  try {
    //// 1: Retrieving students with affected options
    const students = await Student.find({
      affectedOption: { $in: ["inRev", "inLog"] },
    });

    if (!students.length) {
      console.log("No students found with assigned options");
      return res.status(404).json({
        message: "No students found with assigned options",
      });
    }

    /// 2: Separate students selon l'option
    const inRevStudents = students.filter(
      (student) => student.affectedOption === "inRev"
    );
    const inLogStudents = students.filter(
      (student) => student.affectedOption === "inLog"
    );

    // 3: Sorting students by score selon l'option
    const sortedInRev = inRevStudents.sort((a, b) => b.score - a.score);
    const sortedInLog = inLogStudents.sort((a, b) => b.score - a.score);

    //// 4. Prepare rankings
    const rankings = {
      inRev: sortedInRev.map((student, index) => ({
        rank: index + 1, // Rank starts at 1
        student: student.firstName + " " + student.lastName,
        email: student.email,
        score: student.score,
      })),
      inLog: sortedInLog.map((student, index) => ({
        rank: index + 1,
        student: student.firstName + " " + student.lastName,
        email: student.email,
        score: student.score,
      })),
    };

    res.status(200).json(rankings);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Une erreur s'est produite lors du traitement.",
      details: error.message,
    });
  }
};
