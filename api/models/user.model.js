import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
    },
    phone:{
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Participant"],
      default: "Participant",
    }
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);
export default User;
