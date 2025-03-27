import mongoose from "mongoose";
const pvSchema = mongoose.Schema({
  sujet: {type: mongoose.Schema.Types.ObjectId,ref: "Sujet",  required: true,},
  isValidated: {type: Boolean,required: true,},
  reason: {type: String,default: null} 
});
export default mongoose.model("PV", pvSchema);
