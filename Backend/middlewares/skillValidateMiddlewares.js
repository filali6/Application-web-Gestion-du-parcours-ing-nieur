import skillValidationSchema from "../joiValidations/skillValidation.js";

const validateSkill = (req, res, next) => {
  const { error } = skillValidationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ success: false, errors });
  }

  next();
};

export default validateSkill;
