import mongoose from "mongoose";

const sujetSchema = mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  titre: {
    type: String,
    required: true,
  },
  documents: [
    {
      filename: {
        type: String, // Le nom du fichier sauvegardé
        required: true,
      },
      title: {
        type: String, // Le titre lisible par l'utilisateur
        required: true,
      },
    },
  ],
  dateDepot: {
    type: Date,
    default: Date.now, // Enregistre la date du dépôt
  },
  isLate: {
    type: Boolean,
    default: false,
  },

  description: { type: String },
  technologies: [String],
  company: { type: String },
  year: { type: Number },
});

export default mongoose.model("Sujet", sujetSchema);
