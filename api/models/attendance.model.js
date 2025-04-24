import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
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
    paymentStatus: {
      type: String,
      enum: ["Paid", "Not Paid"],
      default: "Not Paid",
    },
    paymentDate: {
      type: Date,
    },
    missedPayments: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", AttendanceSchema);
export default Attendance;
