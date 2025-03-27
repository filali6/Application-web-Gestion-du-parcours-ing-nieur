import mongoose from "mongoose";

const SoutenanceSchema = new mongoose.Schema({
  pfe: { type: mongoose.Schema.Types.ObjectId, ref: "PFE", required: true },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  room: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  teachers: [
    {
      teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
      },
      role: {
        type: String,
        enum: ["president", "rapporteur", "encadrant"],
        required: true,
      },
    },
  ],
  isPublished: { type: Boolean, default: false },
  emailSentDate: { type: Date },
  ModificationEmailSentDate: { type: Date },
  emailVersion: { type: String, default: "1.0" },
});

export default mongoose.model("Soutenance", SoutenanceSchema, "Soutenance");