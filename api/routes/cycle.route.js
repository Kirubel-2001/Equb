import express from "express";
import {
  getAllCycles,
  getCycleByEqub,
  startCycle,
  completeCycle,
  requestRestartCycle,
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

export default router;
