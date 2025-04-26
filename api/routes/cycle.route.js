import express from "express";
import {
  getAllCycles,
  getCycleByEqub,
  startCycle,
  completeCycle,
  requestRestartCycle,
  switchEqubType,
  checkAutoDrawDates
} from "../controllers/cycle.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Get all cycles
router.get("/", verifyToken, getAllCycles);

// Get cycle by Equb ID
router.get("/equb/:equbId", verifyToken, getCycleByEqub);

// Start a new cycle
router.post("/equb/:equbId/start", verifyToken, startCycle);

// Complete a cycle
router.post("/equb/:equbId/complete", verifyToken, completeCycle);

// Request to restart a cycle
router.post("/equb/:equbId/restart-request", verifyToken, requestRestartCycle);

// Switch Equb type (Manual to Automatic or vice versa)
router.patch("/equb/:equbId/switch-type", verifyToken, switchEqubType);

// Check all cycles for auto draw dates (for scheduled jobs)
router.post("/check-auto-cycles", checkAutoDrawDates);

export default router;