import Period from "../../models/Period.js";
import PFE from "../../models/Pfe.js";
import CV from "../../models/cv.js";

export const addPFE = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const {
      title,
      description,
      technologies,
      nameCompany,
      emailCompany,
      year,
    } = req.body;

    const studentId = req.auth.userId;
    const existingPfe = await PFE.findOne({ student: studentId });
    if (existingPfe) {
      return res.status(409).json({
        error:
          "You already have a submitted PFE. A student can only submit one subject.",
      });
    }
    const duplicateTitle = await PFE.findOne({ title });
    if (duplicateTitle) {
      return res.status(409).json({
        error:
          "A PFE with this title already exists. Please choose a different title.",
      });
    }
    const periodDate = new Date();
    const matchingPeriod = await Period.findOne({ type: "pfe" });

    if (!matchingPeriod) {
      return res
        .status(400)
        .json({ error: "No valid period found for PFE submission." });
    }

    if (
      periodDate < new Date(matchingPeriod.StartDate) ||
      periodDate > new Date(matchingPeriod.EndDate)
    ) {
      return res.status(400).json({
        error: `The provided period must fall between ${matchingPeriod.StartDate} and ${matchingPeriod.EndDate}.`,
      });
    }
    const newPFE = new PFE({
      title,
      description,
      technologies,
      nameCompany,
      emailCompany,
      student: studentId,
      year,
    });
    const savedPFE = await newPFE.save();

    // Création ou mise à jour du CV de l'étudiant
    let cv = await CV.findOne({ student: studentId });

    if (!cv) {
      cv = new CV({
        student: studentId,
        pfe: savedPFE._id,
      });
      await cv.save();
    } else {
      cv.pfe = savedPFE._id;
      await cv.save();
    }

    res.status(201).json({
      message: "PFE successfully added.",
      pfe: savedPFE,
    });
  } catch (error) {
    console.error("Error adding PFE:", error);
    res.status(500).json({
      error: "An error occurred while adding the PFE.",
      details: error.message,
    });
  }
};

export const updatePFE = async (req, res) => {
  try {
    const periodDate = new Date();
    const matchingPeriod = await Period.findOne({ type: "pfe" });

    if (!matchingPeriod) {
      return res
        .status(400)
        .json({ error: "No valid period found for PFE submission." });
    }

    if (
      periodDate < new Date(matchingPeriod.StartDate) ||
      periodDate > new Date(matchingPeriod.EndDate)
    ) {
      return res.status(400).json({
        error: `The provided period must fall between ${matchingPeriod.StartDate} and ${matchingPeriod.EndDate}.`,
      });
    }

    const pfe = await PFE.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
    });

    if (!pfe) {
      return res.status(404).json({
        message: "Object not updated.",
      });
    }

    res.status(200).json({
      model: pfe,
      message: "Object updated successfully.",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
