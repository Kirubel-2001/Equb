
import express from 'express';
import { getAllUsers, updateUser, deleteUser } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', getAllUsers); // Route to get all users
router.put('/:id', updateUser); // Route to update a user
router.delete('/:id', deleteUser); // Route to delete a user

export default router;