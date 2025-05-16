import Joi from "joi";

// Schéma de validation de l'étudiant
export const studentValidationSchema = Joi.object({
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
    .default("student")
    .messages({
      "any.only":
        "Le rôle doit être soit 'admin', soit 'student' , soit 'teacher'",
    }),

  arabicName: Joi.string()
    .pattern(/^[\u0621-\u064A\u0660-\u0669\s]+$/) // Lettres arabes et espaces
    .optional()
    .messages({
      "string.pattern.base":
        "Le nom arabe ne doit contenir que des lettres arabes et des espaces.",
    }),

  gender: Joi.string().valid("Male", "Female").optional(),

  dateOfBirth: Joi.date().optional(),

  address: Joi.string().optional(),

  honors: Joi.string().optional(),

  successSession: Joi.string().valid("Main", "Control").optional(),

  level: Joi.number().valid(1, 2, 3).optional(),

  governorate: Joi.string().optional(),

  city: Joi.string().optional(),

  postalCode: Joi.string()
    .length(4)
    .pattern(/^[0-9]+$/)
    .optional()
    .messages({
      "string.length": "Le code postal doit être composé de 4 chiffres.",
      "string.pattern.base":
        "Le code postal ne doit contenir que des chiffres.",
    }),
  nationality: Joi.string()
    .pattern(/^[a-zA-Z]+$/)
    .optional()
    .messages({
      "string.pattern.base": "La nationalité ne doit contenir que des lettres.",
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
  bacDiploma: Joi.string().optional(),

  bacGraduationYear: Joi.string()
    .length(4)
    .pattern(/^[0-9]+$/)
    .optional()
    .messages({
      "number.base": "L'année de graduation doit être un nombre de 4 chiffres.",
    }),

  bacMoy: Joi.number().min(0).max(20).optional().messages({
    "number.base": "La moyenne doit être un nombre.",
    "number.min": "La note doit être supérieure ou égale à 0.",
    "number.max": "La note doit être inférieure ou égale à 20.",
  }),

  university: Joi.string().optional(),

  institution: Joi.string().optional(),
  licenceType: Joi.string().optional(),

  specialization: Joi.string().optional(),

  licenceGraduationYear: Joi.string()
    .length(4)
    .pattern(/^[0-9]+$/)
    .optional()
    .messages({
      "number.base": "L'année de graduation doit être un nombre de 4 chiffres.",
    }),

  moyG: Joi.number().min(0).max(20).optional().messages({
    "number.base": "La moyenne doit être un nombre.",
    "number.min": "La note doit être supérieure ou égale à 0.",
    "number.max": "La note doit être inférieure ou égale à 20.",
  }),
  webDevGrade: Joi.number().min(0).max(20).optional().messages({
    "number.base": "La note doit être un nombre.",
    "number.min": "La note doit être supérieure ou égale à 0.",
    "number.max": "La note doit être inférieure ou égale à 20.",
  }),
  oopGrade: Joi.number().min(0).max(20).optional().messages({
    "number.base": "La note doit être un nombre.",
    "number.min": "La note doit être supérieure ou égale à 0.",
    "number.max": "La note doit être inférieure ou égale à 20.",
  }),
  algorithmsGrade: Joi.number().min(0).max(20).optional().messages({
    "number.base": "La note doit être un nombre.",
    "number.min": "La note doit être supérieure ou égale à 0.",
    "number.max": "La note doit être inférieure ou égale à 20.",
  }),
  globalScore: Joi.number().min(0).max(150).optional().messages({
    "number.base": "La note doit être un nombre.",
  }),
  chosenOption: Joi.string().optional(),
  integrationYear: Joi.string().optional(),
  group: Joi.string().optional(),
  isRepeaterInFirstYear: Joi.boolean().optional(),
  year: Joi.number().optional(),
  status: Joi.string().optional(),

  additionalEmail: Joi.string().email().optional().messages({
    "string.email": "L'email n'est pas valide.",
  }),
});
