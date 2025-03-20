const mongoose = require("mongoose");

const EqubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Refers to the Users collection
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
      enum: ["Automatic Lottery", "Special Case Lottery"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },
  },
  { timestamps: true }
);
const Equb = mongoose.model("Equb", EqubSchema);
export default Equb;
