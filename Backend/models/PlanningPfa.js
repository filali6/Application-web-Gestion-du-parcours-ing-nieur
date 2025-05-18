import mongoose from "mongoose";

const PlanningPfaSchema = mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PFA",
    required: true,
  },
  encadrant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  rapporteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  date: { type: String, required: true },
  room: { type: String, required: true },
  duration: { type: Number, default: 30 },  
  time: { type: String, required: true },
  emailSent: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
});

export default mongoose.model("PlanningPfa", PlanningPfaSchema);
