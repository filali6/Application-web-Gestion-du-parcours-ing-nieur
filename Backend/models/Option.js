import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  name: { type: String, required: false, unique: true }, // Example: 'inRev' or 'inLog'
  capacity: { type: Number, required: false }, // Total capacity for this option
  assignedStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // Référence au modèle Student
    },
  ],
  dateCreated: { type: Date, default: Date.now }, // Date de création de la liste finale
})
export default mongoose.model("Option", optionSchema);
