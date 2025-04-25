import express from "express";
import {
  getAllAnnouncements,
  getAnnouncementsByEqub,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementAsRead,
  markAllAnnouncementsAsRead,
  getAnnouncementReadStatus
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

// Mark a single announcement as read
router.post("/:announcementId/read", verifyToken, markAnnouncementAsRead);

// Mark all announcements in an Equb as read
router.post("/equb/:equbId/read-all", verifyToken, markAllAnnouncementsAsRead);

// Get read status of announcements for a user
router.get("/equb/:equbId/read-status", verifyToken, getAnnouncementReadStatus);

export default router;