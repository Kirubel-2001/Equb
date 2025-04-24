import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema(
  {
    equb: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equb",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Announcement = mongoose.model("Announcement", AnnouncementSchema);
export default Announcement;
