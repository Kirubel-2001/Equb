import mongoose from "mongoose";

const WinnerSchema = new mongoose.Schema(
  {
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
    dateWon: {
      type: Date,
      default: Date.now,
    },
    cycleNumber: {
      type: Number,
      required: true,
    },
    amountWon: {
      type: Number,
      required: true,
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
  },

  { timestamps: true }
);

const Winner = mongoose.model("Winner", WinnerSchema);
export default Winner;
