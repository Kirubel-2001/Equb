import express from "express";
import {
  getAllAttendance,
  getAttendanceByEqub,
  recordPayment,
  markMissedPayment,
  getPaymentStatus,
} from "../controllers/attendance.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Get all attendance records (admin only)
router.get("/", verifyToken, getAllAttendance);

// Get attendance by Equb ID
router.get("/equb/:equbId", verifyToken, getAttendanceByEqub);

// Record payment
router.post("/equb/:equbId/user/:userId/pay", verifyToken, recordPayment);

// Mark missed payment
router.post("/equb/:equbId/user/:userId/miss", verifyToken, markMissedPayment);

// Get payment status
router.get("/equb/:equbId/user/:userId", verifyToken, getPaymentStatus);

export default router;
