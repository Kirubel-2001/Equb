import Winner from "../models/winner.model.js";
import Equb from "../models/equb.model.js";
import User from "../models/user.model.js";
import Participant from "../models/participant.model.js";
import CycleManagement from "../models/cycle.model.js";

// Get all winners
export const getAllWinners = async (req, res) => {
  try {
    const userId = req.user.userId;
    const winners = await Winner.find()
      .populate("equb", "name")
      .populate("user", "firstName lastName");
    
    // Add isRead field to each winner
    const winnersWithReadStatus = winners.map(winner => {
      const isRead = winner.readBy?.some(reader => reader.user.toString() === userId) || false;
      return {
        ...winner.toObject(),
        isRead
      };
    });
    
    res.status(200).json(winnersWithReadStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get winners by Equb ID
export const getWinnersByEqub = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;
    const winners = await Winner.find({ equb: equbId })
      .populate("equb", "name")
      .populate("user", "firstName lastName email")
      .sort({ dateWon: -1 });

    // Add isRead field to each winner
    const winnersWithReadStatus = winners.map(winner => {
      const isRead = winner.readBy?.some(reader => reader.user.toString() === userId) || false;
      return {
        ...winner.toObject(),
        isRead
      };
    });

    res.status(200).json(winnersWithReadStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Select winner manually for special case Equbs
export const selectManualWinner = async (req, res) => {
  try {
    const { equbId } = req.params;
    const { userId, cycleNumber } = req.body;

    // Verify equb exists and is a special case (manual lottery)
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    if (equb.equbType !== "Manual Lottery") {
      return res
        .status(400)
        .json({
          message:
            "This Equb uses automatic lottery, cannot select manual winner",
        });
    }

    // Verify user is a participant in this Equb
    const isParticipant = await Participant.findOne({
      equb: equbId,
      user: userId,
      status: "Accepted",
    });

    if (!isParticipant) {
      return res
        .status(400)
        .json({
          message: "Selected user is not an accepted participant in this Equb",
        });
    }

    // Check if there's already a winner for this cycle
    const existingWinner = await Winner.findOne({ equb: equbId, cycleNumber });
    if (existingWinner) {
      return res
        .status(400)
        .json({ message: "A winner has already been selected for this cycle" });
    }

    // Create winner record
    const winner = new Winner({
      equb: equbId,
      user: userId,
      dateWon: new Date(),
      cycleNumber,
      amountWon: equb.amountPerPerson * equb.numberOfParticipants,
      readBy: [] // Initialize empty readBy array
    });

    await winner.save();

    // Update cycle management if it exists
    const cycle = await CycleManagement.findOne({
      equb: equbId,
      status: "Active",
    });
    if (cycle) {
      cycle.currentCycleNumber = cycleNumber + 1;
      cycle.lastUpdated = new Date();
      await cycle.save();
    }

    res.status(201).json({ message: "Winner selected successfully", winner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Select winner automatically
export const selectAutomaticWinner = async (req, res) => {
  try {
    const { equbId } = req.params;

    // Verify equb exists and is automatic lottery type
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    if (equb.equbType !== "Automatic") {
      return res
        .status(400)
        .json({
          message:
            "This Equb uses manual lottery, cannot select automatic winner",
        });
    }

    // Get current cycle number
    const cycle = await CycleManagement.findOne({
      equb: equbId,
      status: "Active",
    });
    if (!cycle) {
      return res
        .status(404)
        .json({ message: "No active cycle found for this Equb" });
    }

    const cycleNumber = cycle.currentCycleNumber;

    // Check if there's already a winner for this cycle
    const existingWinner = await Winner.findOne({ equb: equbId, cycleNumber });
    if (existingWinner) {
      return res
        .status(400)
        .json({ message: "A winner has already been selected for this cycle" });
    }

    // Get all eligible participants (who haven't won yet)
    const previousWinners = await Winner.find({ equb: equbId }).distinct(
      "user"
    );

    const eligibleParticipants = await Participant.find({
      equb: equbId,
      status: "Accepted",
      user: { $nin: previousWinners },
    });

    if (eligibleParticipants.length === 0) {
      return res
        .status(400)
        .json({ message: "No eligible participants remaining" });
    }

    // Randomly select a winner
    const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
    const winningParticipant = eligibleParticipants[randomIndex];

    // Create winner record
    const winner = new Winner({
      equb: equbId,
      user: winningParticipant.user,
      dateWon: new Date(),
      cycleNumber,
      amountWon: equb.amountPerPerson * equb.numberOfParticipants,
      readBy: [] // Initialize empty readBy array
    });

    await winner.save();

    // Update cycle management
    cycle.currentCycleNumber = cycleNumber + 1;
    cycle.lastUpdated = new Date();
    await cycle.save();

    res.status(201).json({ message: "Winner selected automatically", winner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark a single winner as read
export const markWinnerAsRead = async (req, res) => {
  try {
    const { winnerId } = req.params;
    const userId = req.user.userId;

    const winner = await Winner.findById(winnerId);
    if (!winner) {
      return res.status(404).json({ message: "Winner not found" });
    }

    // Check if user already read this winner announcement
    const alreadyRead = winner.readBy?.some(reader => 
      reader.user.toString() === userId
    ) || false;

    if (!alreadyRead) {
      // Initialize readBy if it doesn't exist
      if (!winner.readBy) {
        winner.readBy = [];
      }
      
      // Add user to readBy array
      winner.readBy.push({
        user: userId,
        readAt: new Date()
      });
      
      await winner.save();
    }

    res.status(200).json({ message: "Winner marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all winners in an Equb as read
export const markAllWinnersAsRead = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;

    // Verify equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Get all winners for this equb
    const winners = await Winner.find({ equb: equbId });

    // For each winner, add the user to readBy if not already there
    const updateOperations = winners.map(winner => {
      // Initialize readBy if it doesn't exist
      if (!winner.readBy) {
        winner.readBy = [];
      }
      
      const alreadyRead = winner.readBy.some(reader => 
        reader.user.toString() === userId
      );
      
      if (!alreadyRead) {
        winner.readBy.push({
          user: userId,
          readAt: new Date()
        });
        return winner.save();
      }
      return Promise.resolve();
    });

    await Promise.all(updateOperations);

    res.status(200).json({ message: "All winners marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get read status of winners for a user
export const getWinnerReadStatus = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;

    // Verify equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Get all winners for this equb
    const winners = await Winner.find({ equb: equbId });
    
    // Count total and unread winners
    const total = winners.length;
    const unread = winners.filter(winner => 
      !winner.readBy || !winner.readBy.some(reader => reader.user.toString() === userId)
    ).length;
    
    res.status(200).json({
      total,
      unread,
      read: total - unread
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};