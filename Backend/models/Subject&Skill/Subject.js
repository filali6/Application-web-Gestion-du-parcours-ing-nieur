import mongoose from "mongoose";
import { type } from "os";

const subjectSchema = mongoose.Schema({
  title: { type: String, required: true },
  level: { type: String, required: true },
  option: {
    type: String,
    enum: ["inLog", "inRev", null],
    default: null,
  },
  semester: { type: String, required: true },
  curriculum: {
    chapters: [
      {
        title: { type: String, required: true },
        sections: [{ type: String }],
      },
    ],
  },
  assignedTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    default: null,
  },
  assignedStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
  ],
  isArchived: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  evaluations: [
    {
      feedback: { type: String, required: true },
      score: { type: Number, required: true },
      hashedStudentId: { type: String, required: true },
    },
  ],

  progress: [
    {
      title: { type: String, required: true },
      completedDate: { type: Date, required: true },
    },
  ],
  propositions: [
    {
      changes: {
        level: { type: String, required: false },
        semester: { type: String, required: false },
        curriculum: {
          chapters: [
            {
              title: { type: String, required: false },
              sections: [{ type: String, required: false }],
            },
          ],
        },
      },
      reason: { type: String, required: false },
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
      },
      validated: { type: Boolean, default: false },
      date: { type: Date, default: Date.now },
    },
  ],
  history: [
    {
      oldSubject: {
        title: { type: String },
        level: { type: String, required: false },
        semester: { type: String, required: false },
        curriculum: {
          chapters: [
            {
              title: { type: String, required: false },
              sections: [{ type: String, required: false }],
            },
          ],
        },
        assignedTeacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
          default: null,
        },
        assignedStudent: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            default: null,
          },
        ],
      },
      reason: { type: String, required: false },
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
      },
      validated: { type: Boolean, default: false },
      date: { type: Date, default: Date.now },
      year: { type: Number },
    },
  ],
  archive: [
    {
      year: { type: Number },
      assignedTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        default: null,
      },
      assignedStudent: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          default: null,
        },
      ],
    },
  ],
  year: { type: Number },
  assignedTeacherHasAdvanced: { type: Boolean, default: false },

});

export default mongoose.model("Subject", subjectSchema);
