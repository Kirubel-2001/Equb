import express from "express";
import {
  getAllWinners,
  getWinnersByEqub,
  selectManualWinner,
  selectAutomaticWinner,
  markWinnerAsRead,
  markAllWinnersAsRead,
  getWinnerReadStatus
} from "../controllers/winner.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Get all winners
router.get("/", verifyToken, getAllWinners);

// Get winners by Equb ID
router.get("/equb/:equbId", verifyToken, getWinnersByEqub);

// Select winner manually (for special case Equbs)
router.post("/equb/:equbId/manual", verifyToken, selectManualWinner);

// Select winner automatically
router.post("/equb/:equbId/automatic", verifyToken, selectAutomaticWinner);

// Mark a single winner as read
router.post("/:winnerId/read", verifyToken, markWinnerAsRead);

// Mark all winners in an Equb as read
router.post("/equb/:equbId/read-all", verifyToken, markAllWinnersAsRead);

// Get read status of winners for a user
router.get("/equb/:equbId/read-status", verifyToken, getWinnerReadStatus);

export default router;