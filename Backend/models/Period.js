import mongoose from "mongoose";

const periodSchema = mongoose.Schema({
  StartDate: { type: Date, required: true },
  EndDate: { type: Date, required: true },
  type: {
    type: String,
    required: true,
    enum: ["option", "pfe", "pfa", "stageEte", "choicePFA"],
  },
});

export default mongoose.model("Period", periodSchema);
