import mongoose from "mongoose";
const planSchema = mongoose.Schema({
  date: { type: Date, required: false }, 
  horaire: { type: String, required: false }, 
  googleMeetLink: { type: String, required: false },
  sujet: { type: mongoose.Schema.Types.ObjectId, ref: "Sujet" },
  teachers: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  isPublished: { type: Boolean, default: false },
  envoiType: {
    type: String,
    enum: ["Premier envoi", "Envoi modifié"],
    default: "Premier envoi",
    required: true,
  },
});
export default mongoose.model("Plan", planSchema);
