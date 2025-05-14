import Joi from "joi";

export const validateSubject = (req, res, next) => {
  const subjectSchema = Joi.object({
    title: Joi.string().required().messages({
      "string.empty": "title is a required field",
    }),
    level: Joi.string().required().messages({
      "string.empty": "level is a required field",
    }),
    semester: Joi.string().required().messages({
      "string.empty": "Semester is a required field",
    }),
    option: Joi.when("level", {
      is: Joi.valid("2", "3"),
      then: Joi.string().valid("inLog", "inRev").required().messages({
        "any.required": "Option is required for level 2 or 3",
        "any.only": "Option must be either 'inLog' or 'inRev'",
      }),
      otherwise: Joi.valid(null).optional(),
    }),
    curriculum: Joi.object({
      chapters: Joi.array().messages({
        "array.includes": "chapters must be a valid list",
      }),
    }),
    assignedTeacher: Joi.string().hex().optional().allow(null).messages({
      "string.hex": "The teacher's identifier must be a valid ObjectId",
    }),
    year: Joi.number().optional(),
    assignedStudent: Joi.alternatives()
      .try(
        Joi.string().hex().messages({
          "string.hex": "The student's identifier must be a valid ObjectId",
        }),
        Joi.array().items(
          Joi.string().hex().messages({
            "string.hex": "Each student's identifier must be a valid ObjectId",
          })
        )
      )
      .optional(),
  });

  const { error } = subjectSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};
