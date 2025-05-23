import express from 'express';
import { 
  createComplaint, 
  getUserComplaints, 
  getEqubComplaints, 
  getAllComplaints,
  resolveComplaint,
  deleteComplaint,
  markComplaintAsRead,
  markAllComplaintsAsRead,
  getComplaintReadStatus
} from '../controllers/complaint.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Create a new complaint
router.post('/', verifyToken, createComplaint);

// Get all complaints for the logged-in user
router.get('/user', verifyToken, getUserComplaints);

// Get all complaints for a specific Equb (Equb creator only)
router.get('/equb/:equbId', verifyToken, getEqubComplaints);

// Get all complaints (admin only)
router.get('/all',  getAllComplaints);

// Resolve a complaint
router.patch('/:complaintId/resolve', verifyToken, resolveComplaint);

// Delete a complaint (admin only)
router.delete('/:complaintId', deleteComplaint);

// Mark a single complaint as read
router.post("/:complaintId/read", verifyToken, markComplaintAsRead);

// Mark all complaints in an Equb as read
router.post("/equb/:equbId/read-all", verifyToken, markAllComplaintsAsRead);

// Get read status of complaints for a user
router.get("/equb/:equbId/read-status", verifyToken, getComplaintReadStatus);

export default router;