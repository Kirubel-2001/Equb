import express from "express";
import {
  getAllWinners,
  getWinnersByEqub,
  selectManualWinner,
  selectAutomaticWinner,
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

export default router;
