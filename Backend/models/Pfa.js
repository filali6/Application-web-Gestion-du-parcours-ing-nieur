import mongoose from "mongoose";
//
const PfaSchema = mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  technologies: [String],
  mode: { type: String, enum: ["monome", "binome"], required: true },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: false,
  },
  Students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  period: { type: mongoose.Schema.Types.ObjectId, ref: "Period" },
  periodChoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Period",
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "published", "hidden", "rejected"],
    default: "pending",
  },
  year: { type: Number },
  emailSent: { type: Boolean, default: false },
  affectationStatus: {
    type: String,
    enum: ["published", "hidden"],
    default: "hidden",
  },

  choices: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: false,
      },
      priority: { type: Number, required: false, enum: [1, 2, 3] },
      acceptedByTeacher: { type: Boolean, default: false },
      validation: { type: Boolean, default: false },
    },
  ],
});

export default mongoose.model("PFA", PfaSchema);
