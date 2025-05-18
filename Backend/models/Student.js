import mongoose from "mongoose";
import { type } from "os";

const studentSchema = mongoose.Schema({
  cin: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, default: "student", required: true },

  arabicName: { type: String, required: false },
  gender: { type: String, enum: ["Male", "Female"], required: false },
  dateOfBirth: { type: Date, required: false },
  governorate: { type: String, required: false },
  address: { type: String, required: false },
  city: { type: String, required: false },
  postalCode: { type: Number, required: false },
  nationality: { type: String, required: false },
  phoneNumber: { type: String, required: false },

  bacDiploma: { type: String, required: false },
  bacGraduationYear: { type: Number, required: false },
  bacMoy: { type: Number, required: false }, //moyenne_bac
  honors: { type: String, required: false }, //mention

  university: { type: String, required: false },
  institution: { type: String, required: false },
  licenceType: { type: String, required: false },
  specialization: { type: String, required: false },
  licenceGraduationYear: { type: Number, required: false },
  moyG: { type: Number, required: false }, //moyenne_Generale

  globalScore: { type: Number, required: false }, // score globale
  webDevGrade: { type: Number, required: false },
  oopGrade: { type: Number, required: false },
  algorithmsGrade: { type: Number, required: false },
  transcript: { type: String, required: false },
  successSession: { type: String, enum: ["Main", "Control"], required: false },
  chosenOption: { type: String, enum: ["inLog", "inRev"], required: false },
  affectedOption: { type: String, enum: ["inLog", "inRev"], required: false },
  score: { type: Number, required: false }, // score d'option
  isOptionValidated: { type: Boolean, default: false }, // validation finale des choix
  modificationReason: { type: String, default: null }, // Raison de modification
  isoptionPublished: { type: Boolean, default: false }, // masquer/publier la liste des choix
  emailSent: { type: Boolean, default: false }, //indiquer si l'e-mail a été envoyé

  level: { type: Number, enum: [1, 2, 3], default:2 },

  integrationYear: { type: String, required: false }, // Year of integration
  group: { type: Number, enum: ["2ing1", "2ing2"], required: false },
  isRepeaterInFirstYear: { type: Boolean, required: false }, // Redoublement
  encryptedPassword: { type: String, required: true },
  photo: { type: String, required: false },
  status: { type: String, enum: ["redouble", "passe", "diplomé"] },
  year: { type: Number },
  history: [
    {
      year: { type: Number },
      level: { type: Number },
      successSession: { type: String },
      status: { type: String },
    },
  ],
});

export default mongoose.model("Student", studentSchema);
