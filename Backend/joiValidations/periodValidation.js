import Joi from "joi";

export const addPeriodValidationSchema = Joi.object({
  StartDate: Joi.date().required().messages({
    "any.required": "StartDate is required.",
    "date.base": "StartDate must be a valid date.",
  }),
  EndDate: Joi.date().required().greater(Joi.ref("StartDate")).messages({
    "any.required": "EndDate is required.",
    "date.base": "EndDate must be a valid date.",
    "date.greater": "EndDate must be later than StartDate.",
  }),
  type: Joi.string()
    .required()
    .valid("option", "pfe", "pfa", "stageEte", "choicePFA")
    .messages({
      "any.required": "Type is required.",
      "any.only":
        "Invalid type. Valid types are: option, pfe, pfa, stageEte, choicePFA.",
    }),
});

export const updatePeriodValidationSchema = Joi.object({
  StartDate: Joi.date().optional().messages({
    "date.base": "StartDate must be a valid date.",
  }),
  EndDate: Joi.date().required().greater(Joi.ref("StartDate")).messages({
    "any.required": "EndDate is required.",
    "date.base": "EndDate must be a valid date.",
    "date.greater": "EndDate must be later than StartDate.",
  }),
  type: Joi.string()
    .optional()
    .valid("option", "pfe", "pfa", "stageEte", "choicePFA")
    .messages({
      "any.only":
        "Invalid type. Valid types are: option, pfe, pfa, stageEte, choicePFA.",
    }),
})
  .or("StartDate", "EndDate", "type")
  .messages({
    "object.missing":
      "At least one field (StartDate, EndDate, or type) must be provided to update.",
  });

export const validateAddPeriodMiddleware = (req, res, next) => {
  const { error } = addPeriodValidationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ errors: error.details.map((err) => err.message) });
  }
  next();
};

export const validateUpdatePeriodMiddleware = (req, res, next) => {
  const { error } = updatePeriodValidationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ errors: error.details.map((err) => err.message) });
  }
  next();
};
