import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  equb: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equb",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Resolved"],
    default: "Pending",
  },
  dateSubmitted: {
    type: Date,
    default: Date.now,
  },
  response: {
    type: String,
    trim: true,
  },
  dateResolved: {
    type: Date,
  },
  readBy: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
