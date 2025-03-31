import mongoose from "mongoose";

const equbSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    numberOfParticipants: {
      type: Number,
      required: true,
      min: 2, // Minimum of 2 participants
    },
    amountPerPerson: {
      type: Number,
      required: true,
      min: 1, // Minimum amount should be at least 1
    },
    cycle: {
      type: String,
      enum: ["Weekly", "Monthly"],
      required: true,
    },
    equbType: {
      type: String,
      enum: ["Automatic", "Special"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Pending"],
      default: "Pending",
    },
    description: { 
      type: String
     },
  },
  { timestamps: true }
);
const Equb = mongoose.model("Equb", equbSchema);
export default Equb;