import mongoose from "mongoose";

const skillSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  isArchived: { type: Boolean, default: false },
  force: { type: Boolean, default: false },
  year: { type: Number },
  history: [
    {
      year: { type: Number },
    },
  ],
});

export default mongoose.model("Skill", skillSchema);
