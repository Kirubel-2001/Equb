import express from 'express';
import { 
  createComplaint, 
  getUserComplaints, 
  getEqubComplaints, 
  getAllComplaints,
  resolveComplaint,
  deleteComplaint
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
router.get('/all', verifyToken, getAllComplaints);

// Resolve a complaint
router.patch('/:complaintId/resolve', verifyToken, resolveComplaint);

// Delete a complaint (admin only)
router.delete('/:complaintId', verifyToken, deleteComplaint);

export default router;