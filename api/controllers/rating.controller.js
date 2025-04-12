import Rating from "../models/rating.model.js";
import Equb from "../models/equb.model.js";
import Participant from "../models/participant.model.js";

// Create or update a rating
export const createOrUpdateRating = async (req, res) => {
  try {
    const { equbId, rating, comment } = req.body;
    const userId = req.user.userId;

    // Check if Equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Check if user is a participant in the Equb using Participant model
    const isParticipant = await Participant.findOne({
      equb: equbId,
      user: userId,
      status: "Accepted",
    });

    if (!isParticipant) {
      return res
        .status(403)
        .json({
          message: "You must be a participant of this Equb to submit a rating",
        });
    }

    // Check if rating already exists
    let existingRating = await Rating.findOne({ equb: equbId, user: userId });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comment = comment;
      existingRating.dateSubmitted = Date.now();
      await existingRating.save();
      return res.status(200).json(existingRating);
    } else {
      // Create new rating
      const newRating = new Rating({
        equb: equbId,
        user: userId,
        rating,
        comment,
      });

      await newRating.save();
      return res.status(201).json(newRating);
    }
  } catch (error) {
    console.error("Error creating/updating rating:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all ratings for an Equb
export const getEqubRatings = async (req, res) => {
  try {
    const { equbId } = req.params;

    // Check if Equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    const ratings = await Rating.find({ equb: equbId })
      .populate("user", "firstName lastName")
      .sort({ dateSubmitted: -1 });

    // Calculate average rating
    const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;

    res.status(200).json({
      ratings,
      averageRating,
      totalRatings: ratings.length,
    });
  } catch (error) {
    console.error("Error getting Equb ratings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user's rating for an Equb
export const getUserRatingForEqub = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;

    const rating = await Rating.findOne({ equb: equbId, user: userId });

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    res.status(200).json(rating);
  } catch (error) {
    console.error("Error getting user rating:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a rating (user can delete their own rating, admin can delete any)
export const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user.userId;

    const rating = await Rating.findById(ratingId);

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Check if user is the owner of the rating or an admin
    if (rating.user.toString() !== userId && req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this rating" });
    }

    await Rating.findByIdAndDelete(ratingId);

    res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};