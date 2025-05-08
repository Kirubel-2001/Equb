import express from "express";
import {
  createOrUpdateRating,
  getEqubRatings,
  getUserRatingForEqub,
  deleteRating,
} from "../controllers/rating.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Create or update a rating
router.post("/",  verifyToken, createOrUpdateRating);

// Get all ratings for a specific Equb
router.get("/equb/:equbId", getEqubRatings);

// Get user's rating for a specific Equb
router.get("/user/:equbId", verifyToken, getUserRatingForEqub);

// Delete a rating
router.delete("/:ratingId", verifyToken, deleteRating);

export default router;
