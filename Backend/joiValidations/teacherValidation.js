import Joi from "joi";

// validation de l'enseignant
export const teacherValidationSchema = Joi.object({
  cin: Joi.string()
    .length(8)
    .pattern(/^[0-9]+$/)
    .optional()
    .messages({
      "string.length": "Le CIN doit contenir exactement 8 chiffres.",
      "string.pattern.base": "Le CIN ne doit contenir que des chiffres.",
    }),
  firstName: Joi.string()
    .pattern(/^[a-zA-Z]+$/)
    .optional()
    .messages({
      "string.pattern.base": "Le prénom ne doit contenir que des lettres.",
    }),
  lastName: Joi.string()
    .pattern(/^[a-zA-Z]+$/)
    .optional()
    .messages({
      "string.pattern.base": "Le nom ne doit contenir que des lettres.",
    }),
  email: Joi.string().email().optional().messages({
    "string.email": "L'email n'est pas valide.",
  }),
  role: Joi.string()
    .valid("admin", "student", "teacher")
    .default("teacher")
    .messages({
      "any.only":
        "Le rôle doit être soit 'admin', soit 'student' , soit 'teacher'",
    }),
  phoneNumber: Joi.string()
    .length(8)
    .pattern(/^[0-9]{8}$/)
    .optional()
    .messages({
      "string.length": "Le numéro de téléphone doit contenir 8 chiffres.",
      "string.pattern.base":
        "Le numéro de téléphone ne doit contenir que des chiffres.",
    }),
  grade: Joi.string().optional(),
  year: Joi.number().optional(),
});
