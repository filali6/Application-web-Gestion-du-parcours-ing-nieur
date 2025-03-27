import Joi from "joi";

//VALIDATION WITH JOI//
const skillValidationSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).optional().messages({
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name cannot exceed 100 characters.",
  }),
  description: Joi.string().trim().max(500).optional(),
  subjects: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      "string.pattern.base":
        "Each subject ID must be a valid MongoDB ObjectID.",
    }),
  force: Joi.boolean().optional().messages({
    "boolean.base": "Force must be true or false.",
  }),
  year: Joi.number().optional(),
});

export default skillValidationSchema;
