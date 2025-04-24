import express from "express";
import {
  getAllAnnouncements,
  getAnnouncementsByEqub,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcement.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Get all announcements
router.get("/", verifyToken, getAllAnnouncements);

// Get announcements by Equb ID
router.get("/equb/:equbId", verifyToken, getAnnouncementsByEqub);

// Create announcement
router.post("/equb/:equbId", verifyToken, createAnnouncement);

// Update announcement
router.put("/:announcementId", verifyToken, updateAnnouncement);

// Delete (deactivate) announcement
router.delete("/:announcementId", verifyToken, deleteAnnouncement);

export default router;
