import mongoose from "mongoose";

const teacherSchema = mongoose.Schema({
  cin: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: {
    type: String,
    default: "teacher",
    required: true,
  },
  phoneNumber: { type: String, required: false },
  grade: { type: String, required: false },
  encryptedPassword: { type: String, required: true },
  year: { type: Number },
  history: [
    {
      year: { type: Number, required: true },

      grade: { type: String },
    },
  ],
});

export default mongoose.model("Teacher", teacherSchema);
