import mongoose from "mongoose";

const cvSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    unique: true,
  },

  topics: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sujet",
    },
  ],
  pfa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PFA",
  },
  pfe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PFE",
  },

  skills: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
    },
  ],

  diplomas: [
    {
      title: String,
      year: Number,
    },
  ],
  languages: [
    {
      name: String,
    },
  ],
  experiences: [
    {
      title: String,
      description: String,
      periode: String,
    },
  ],
  certifications: [
    {
      name: String,
      year: Number,
    },
  ],
});

export default mongoose.model("CV", cvSchema);
