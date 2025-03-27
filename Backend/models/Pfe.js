import mongoose from "mongoose";

const PfeSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [String],
  nameCompany: { type: String, required: true },
  emailCompany: { type: String, required: true },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: false,
  },

  isSelected: { type: Boolean, default: false }, // indique si un enseignant a deja choisit ce sujet
  isAffected: { type: Boolean, default: false }, // indique si l'admine a valider le choix ou pas 4.1/4.2
  isPublished: { type: Boolean, default: false }, //indique si le plannig est publié ou masqué 4.4

  isEmailSent: { type: Boolean, default: false }, // Indique si un e-mail a été envoyé
  emailSentDate: { type: Date }, // Date de l'envoi de l'email
  planningVersion: { type: String, default: "1.0" }, // Version du planning, pourrait être utilisé pour distinguer les envois
  year: { type: Number },
});

export default mongoose.model("PFE", PfeSchema, "PFE");
