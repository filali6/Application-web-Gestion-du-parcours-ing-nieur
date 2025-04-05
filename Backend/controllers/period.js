import Period from "../models/Period.js";

export const addPeriod = async (req, res) => {
  try {
    const { StartDate, EndDate, type } = req.body;
    const existingPeriod = await Period.findOne({
      type: type,
      $or: [
        {
          StartDate: { $lte: new Date(EndDate) },
          EndDate: { $gte: new Date(StartDate) },
        },
        {
          StartDate: { $gte: new Date(StartDate) },
          EndDate: { $lte: new Date(EndDate) },
        },
      ],
    });

    if (existingPeriod) {
      return res.status(400).json({
        error: `A period of type ${type} is already open during this time frame.`,
      });
    }
    const newPeriod = new Period({ StartDate, EndDate, type });
    await newPeriod.save();

    res
      .status(201)
      .json({ message: "Period successfully added.", period: newPeriod });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal error while adding the period." });
  }
};

export const updatePeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const { StartDate, EndDate, type } = req.body;
    const period = await Period.findById(id);
    if (!period) {
      return res.status(404).json({ error: "Period not found." });
    }
    if (type && type !== period.type) {
      const existingPeriod = await Period.findOne({
        type: type,
        _id: { $ne: id },
      });

      if (existingPeriod) {
        return res.status(400).json({
          error: `A period of type ${type} already exists in this time frame.`,
        });
      }
    }
    if (StartDate) {
      const newStartDate = new Date(StartDate);
      period.StartDate = newStartDate;
    }

    if (EndDate) {
      const newEndDate = new Date(EndDate);
      period.EndDate = newEndDate;
    }
    period.type = type || period.type;

    await period.save();

    res.status(200).json({ message: "Period successfully updated.", period });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal error while updating the period." });
  }
};
export const getPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ error: "ID is required to retrieve a period." });
    }
    const period = await Period.findById(id);
    if (!period) {
      return res.status(404).json({ error: "Period not found." });
    }
    res.status(200).json({ message: "Period retrieved successfully.", period });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal error while retrieving the period." });
  }
};
export const getAllPeriods = async (req, res) => {
  try {
    const periods = await Period.find();
    if (periods.length === 0) {
      return res.status(404).json({ error: "No periods found." });
    }
    res
      .status(200)
      .json({ message: "Periods retrieved successfully.", periods });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal error while retrieving all periods." });
  }
};
