// routes/participant.routes.js
import express from "express";
import {
  joinEqub,
  getEqubParticipants,
  getParticipantStatus,
  // updateParticipantStatus,
  // getMyJoinedEqubs,
  leaveEqub,
  getMyJoinedEqubs,
  updateParticipantStatus
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
    


export default router;