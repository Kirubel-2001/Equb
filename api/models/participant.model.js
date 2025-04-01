// models/participant.model.js
import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  equb: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equb",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending"
  },
  dateJoined: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index to ensure a user can only join an Equb once
participantSchema.index({ equb: 1, user: 1 }, { unique: true });

const Participant = mongoose.model("Participant", participantSchema);
export default Participant;