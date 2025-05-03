// In your router file
import express from 'express';
import {  getAllUsers } from '../controllers/user.controller.js';

const router = express.Router();


router.get('/', getAllUsers); // Route to get all users

export default router;