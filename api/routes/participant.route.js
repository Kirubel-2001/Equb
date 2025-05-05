import express from "express";
import {
  joinEqub,
  getEqubParticipants,
  getParticipantStatus,
  getMyJoinedEqubs,
  updateParticipantStatus,
  leaveEqub,
  getEqubParticipantCount,
  removeParticipant,
  getEligibleWinners,
  getUserJoinedEqubs
} from "../controllers/participant.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.use(verifyToken);

// Request to join an Equb
router.post("/join/:equbId", joinEqub);

// Get all participants for an Equb (for Equb creator)
router.get("/equb/:equbId", getEqubParticipants);

// Get participation status for current user in a specific Equb
router.get("/status/:equbId", getParticipantStatus);

// Get my joined Equbs
router.get("/joined-equbs", getMyJoinedEqubs);

// Update participant status (accept/reject)
router.patch("/:participantId/status", updateParticipantStatus);

// Leave an Equb
router.delete("/leave/:equbId", leaveEqub);

// Get participant count for an Equb
router.get("/count/:equbId", getEqubParticipantCount);

// Get eligible winners for an Equb (participants who haven't won yet)
router.get("/eligible-winners/:equbId", getEligibleWinners);

// Remove a participant from an Equb (creator only)
router.delete("/:participantId/remove", removeParticipant);

router.get("/joined-equbs/:userId", getUserJoinedEqubs);
export default router;