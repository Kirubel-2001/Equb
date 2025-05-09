import Participant from "../models/participant.model.js";
import Equb from "../models/equb.model.js";
import User from "../models/user.model.js";
import Winner from "../models/winner.model.js";

// Request to join an Equb
export const joinEqub = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;

    // Check if Equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Check if already a participant
    const existingParticipant = await Participant.findOne({
      equb: equbId,
      user: userId,
    });

    if (existingParticipant) {
      return res.status(400).json({
        message: "You have already requested to join this Equb",
        status: existingParticipant.status,
      });
    }
    // Check if Equb is full
    const acceptedParticipants = await Participant.countDocuments({
      equb: equbId,
      status: "Accepted",
    });
    if (acceptedParticipants >= equb.numberOfParticipants) {
      return res.status(400).json({ message: "This Equb is already full" });
    }

    // Create new participant request
    const newParticipant = new Participant({
      equb: equbId,
      user: userId,
      status: "Pending",
    });

    await newParticipant.save();
    res.status(201).json({ message: "Join request sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all participants for an Equb
export const getEqubParticipants = async (req, res) => {
  try {
    const { equbId } = req.params;
    const { status } = req.query; // Get status from query parameters

    // Verify the user is the creator of the Equb or an admin
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Only allow Equb creator or admin to see all participants
    if (
      equb.creator.toString() !== req.user.userId &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Build query object
    const query = { equb: equbId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    const participants = await Participant.find(query)
      .populate("user", "firstName lastName email profilePicture")
      .sort({ dateJoined: -1 });

    res.json(participants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get participation status for current user in a specific Equb
export const getParticipantStatus = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;

    // Check if Equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Check participation status
    const participant = await Participant.findOne({
      equb: equbId,
      user: userId,
    });

    if (!participant) {
      return res.json({ status: null, message: "Not joined" });
    }

    // Return the status
    let message = "";
    switch (participant.status) {
      case "Pending":
        message = "Your join request is pending approval";
        break;
      case "Accepted":
        message = "You are a member of this Equb";
        break;
      case "Rejected":
        message = "Your join request was rejected";
        break;
      default:
        message = "Unknown status";
    }

    res.json({ status: participant.status, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update participant status (accept/reject)
export const updateParticipantStatus = async (req, res) => {
  try {
    const { participantId } = req.params;
    const { status } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const participant = await Participant.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Check if user is the Equb creator
    const equb = await Equb.findById(participant.equb);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }
    
    if (equb.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // If accepting, check if Equb is full
    if (status === "Accepted") {
      const acceptedCount = await Participant.countDocuments({
        equb: participant.equb,
        status: "Accepted",
      });

      if (acceptedCount >= equb.numberOfParticipants) {
        return res.status(400).json({ message: "This Equb is already full" });
      }
    }

    participant.status = status;
    await participant.save();

    // Update equb status based on participant count
    if (status === "Accepted") {
      // Count how many accepted participants there are now
      const updatedAcceptedCount = await Participant.countDocuments({
        equb: participant.equb,
        status: "Accepted",
      });
      
      // If equb is now full, set status to Active; otherwise set to Pending
      if (updatedAcceptedCount >= equb.numberOfParticipants) {
        equb.status = "Active";
      } else {
        equb.status = "Pending";
      }
      
      // Save the updated equb status
      await equb.save();
    }

    res.json({ 
      message: `Participant ${status.toLowerCase()} successfully`,
      participant: {
        id: participant._id,
        status: participant.status
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get my joined Equbs
export const getMyJoinedEqubs = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find participations where user is accepted
    const participations = await Participant.find({
      user: userId,
      status: "Accepted"
    }).populate({
      path: "equb",
      populate: {
        path: "creator",
        select: "firstName lastName email"
      }
    });

    // Format the response to match the structure expected by the frontend
    const joinedEqubs = participations.map(participation => ({
      ...participation.equb._doc,
      participantId: participation._id,
      joinDate: participation.dateJoined
    }));

    res.json(joinedEqubs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Leave an Equb
export const leaveEqub = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;

    const participant = await Participant.findOne({
      equb: equbId,
      user: userId,
    });

    if (!participant) {
      return res
        .status(404)
        .json({ message: "You are not a participant in this Equb" });
    }

    // Can only leave if status is pending or if the Equb hasn't started
    const equb = await Equb.findById(equbId);
    if (participant.status === "Accepted" && equb.status === "Active") {
      return res.status(400).json({
        message:
          "Cannot leave an active Equb. Please contact the Equb creator.",
      });
    }

    await Participant.findByIdAndDelete(participant._id);
    
    // If participant was accepted, update equb status to "Pending"
    if (participant.status === "Accepted" && equb.status !== "Completed") {
      equb.status = "Pending";
      await equb.save();
    }
    
    res.json({ message: "Successfully left the Equb" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get participant count for an Equb
export const getEqubParticipantCount = async (req, res) => {
  try {
    const { equbId } = req.params;

    // Check if Equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Count accepted participants
    const acceptedCount = await Participant.countDocuments({
      equb: equbId,
      status: "Accepted",
    });

    // Calculate remaining spots
    const totalSpots = equb.numberOfParticipants;
    const remainingSpots = totalSpots - acceptedCount;

    res.json({
      totalParticipants: totalSpots,
      currentParticipants: acceptedCount,
      remainingSpots: remainingSpots,
      isFull: remainingSpots <= 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get eligible winners for an Equb (participants who haven't won yet)
export const getEligibleWinners = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;

    // Verify the Equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Verify user is the creator of the Equb or an admin
    if (equb.creator.toString() !== userId && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized: Only the Equb creator can view eligible winners" });
    }

    // Find all accepted participants for this Equb
    const allParticipants = await Participant.find({
      equb: equbId,
      status: "Accepted"
    }).populate("user", "firstName lastName email profilePicture");

    // Find all users who have already won in this Equb
    const previousWinners = await Winner.find({
      equb: equbId
    }).select("user");

    // Extract just the user IDs from winners
    const previousWinnerIds = previousWinners.map(winner => winner.user.toString());

    // Filter out participants who have already won
    const eligibleParticipants = allParticipants.filter(participant => 
      !previousWinnerIds.includes(participant.user._id.toString())
    );

    res.json(eligibleParticipants);
  } catch (err) {
    console.error("Error fetching eligible winners:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove a participant from an Equb (creator only)
export const removeParticipant = async (req, res) => {
  try {
    const { participantId } = req.params;
    const creatorId = req.user.userId;

    // Find the participant
    const participant = await Participant.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Get the equb to verify creator
    const equb = await Equb.findById(participant.equb);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Verify the requester is the equb creator
    if (equb.creator.toString() !== creatorId) {
      return res.status(403).json({ message: "Unauthorized. Only the equb creator can remove participants" });
    }

    // Check if equb is already in active state and participant has accepted status
    if (equb.status === "Active" && participant.status === "Accepted") {
      return res.status(400).json({ 
        message: "Cannot remove a participant from an active Equb. Please contact support for assistance." 
      });
    }

    // Remove the participant
    await Participant.findByIdAndDelete(participantId);
    
    // If participant was accepted, update equb status to "Pending"
    if (participant.status === "Accepted" && equb.status !== "Completed") {
      equb.status = "Pending";
      await equb.save();
    }

    // Return success message
    res.json({ 
      message: "Participant removed successfully",
      participantId: participantId,
      equbId: equb._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// controllers/participant.controller.js
export const getUserJoinedEqubs = async (req, res) => {
  try {
    const { userId } = req.params;

    

    const participants = await Participant.find({ user: userId }).populate("equb");
    const joinedEqubs = participants.map(p => p.equb);

    res.json(joinedEqubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
