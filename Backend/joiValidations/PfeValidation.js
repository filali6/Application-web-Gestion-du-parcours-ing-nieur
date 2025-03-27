import Joi from "joi";

export const validatePFE = (req, res, next) => {
  const PfeSchema = Joi.object({
    title: Joi.string().min(3).max(50).required().messages({
      "string.base": '"title" should be a type of string',
      "string.min": '"title" should have a minimum length of {#limit}',
      "string.max": '"title" should have a maximum length of {#limit}',
      "any.required": '"title" is a required field',
    }),

    description: Joi.string().min(10).max(100).required().messages({
      "string.base": '"description" should be a type of string',
      "string.min": '"description" should have a minimum length of {#limit}',
      "string.max": '"description" should have a maximum length of {#limit}',
      "any.required": '"description" is a required field',
    }),

    nameCompany: Joi.string().required().messages({
      "string.base": '"description" should be a type of string',
      "any.required": '"description" is a required field',
    }),

    technologies: Joi.array().items(Joi.string().min(1)).optional().messages({
      "array.base": '"technologies" should be an array',
      "string.min":
        '"technologies" item should have a minimum length of {#limit}',
    }),

    emailCompany: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.base": '"emailCompany" should be a type of string',
        "string.email":
          '"emailCompany" must be a valid email address (e.g., user@example.com)',
        "any.required": '"emailCompany" is a required field',
      }),

    student: Joi.string().hex().messages({
      "string.base": '"student" should be a type of string',
      "string.hex": '"student" should be a valid ObjectId',
    }),
    year: Joi.number().optional(),
  });
  const { error } = PfeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
