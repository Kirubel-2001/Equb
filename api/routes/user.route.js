import express from 'express';
import { 
  getAllUsers, 
  updateUser, 
  deleteUser, 
  getCurrentUser, 
  updateCurrentUser 
} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();
// User profile routes
router.get('/me',verifyToken, getCurrentUser); // Route to get current user's profile
router.put('/me',verifyToken, updateCurrentUser); // Route to update current user's profile

// Admin routes to manage all users
router.get('/', getAllUsers); // Route to get all users
router.put('/:id', updateUser); // Route to update a user
router.delete('/:id', deleteUser); // Route to delete a user


export default router;