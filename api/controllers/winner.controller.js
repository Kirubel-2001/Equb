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

// Helper function to calculate next draw date
const calculateNextDrawDate = (cycleType) => {
  const nextDrawDate = new Date();
  switch (cycleType) {
    case "Weekly":
      nextDrawDate.setDate(nextDrawDate.getDate() + 7);
      break;
    case "Monthly":
      nextDrawDate.setMonth(nextDrawDate.getMonth() + 1);
      break;
    case "Bi-weekly":
      nextDrawDate.setDate(nextDrawDate.getDate() + 14);
      break;
    default:
      nextDrawDate.setDate(nextDrawDate.getDate() + 7); // Default to weekly
  }
  return nextDrawDate;
};

// Select a winner manually for an Equb
export const selectManualWinner = async (req, res) => {
  try {
    const { equbId } = req.params;
    const { participantId, switchToAutomatic } = req.body;
    const userId = req.user.userId;

    // Verify equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Verify user is the creator of the Equb
    if (equb.creator.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only Equb creators can select winners manually" });
    }

    // Find the active cycle
    const cycle = await CycleManagement.findOne({
      equb: equbId,
      status: "Active",
    });

    if (!cycle) {
      return res.status(404).json({ message: "No active cycle found for this Equb" });
    }

    // Verify the participant exists and is part of this Equb
    const participant = await Participant.findOne({
      _id: participantId,
      equb: equbId,
      status: "Accepted"
    });

    if (!participant) {
      return res.status(404).json({ message: "Participant not found or not eligible" });
    }

    // Check if participant has already won in a previous cycle
    const alreadyWon = await Winner.findOne({
      equb: equbId,
      participant: participantId
    });

    if (alreadyWon) {
      return res.status(400).json({ message: "This participant has already won in a previous cycle" });
    }

    // Check if a winner has already been selected for this cycle
    const existingWinner = await Winner.findOne({
      equb: equbId,
      cycleNumber: cycle.currentCycleNumber
    });

    if (existingWinner) {
      return res.status(400).json({ message: "A winner has already been selected for this cycle" });
    }

    // Save the winner
    const winner = new Winner({
      equb: equbId,
      participant: participantId,
      user: participant.user,
      cycleNumber: cycle.currentCycleNumber,
      winDate: new Date(),
      readBy: [] // Initialize empty readBy array
    });

    await winner.save();

    // If equbType is now set to Automatic for future cycles
    if (switchToAutomatic === true) {
      equb.equbType = "Automatic";
      await equb.save();
    }

    // Complete current cycle
    cycle.status = "Completed";
    cycle.endDate = new Date();
    await cycle.save();

    // Check if this was the final cycle
    const previousWinnersCount = await Winner.countDocuments({ equb: equbId });
    
    // If not all participants have won, start a new cycle
    if (previousWinnersCount < equb.numberOfParticipants) {
      // Create a new cycle if automatic or if manual but switched to automatic
      if (equb.equbType === "Automatic" || switchToAutomatic === true) {
        const nextCycleNumber = cycle.currentCycleNumber + 1;
        const nextDrawDate = calculateNextDrawDate(equb.cycle);

        const newCycle = new CycleManagement({
          equb: equbId,
          startDate: new Date(),
          status: "Active",
          currentCycleNumber: nextCycleNumber,
          nextDrawDate,
        });

        await newCycle.save();

        return res.status(200).json({ 
          message: `Winner selected manually and new cycle started${switchToAutomatic ? ' (switched to automatic mode)' : ''}`, 
          winner: participant,
          newCycle
        });
      } else {
        // For pure manual Equbs, just complete the current cycle
        return res.status(200).json({ 
          message: "Winner selected manually. Cycle completed. You can now start a new cycle.", 
          winner: participant
        });
      }
    } else {
      // All participants have won, complete the Equb
      equb.status = "Completed";
      await equb.save();

      return res.status(200).json({ 
        message: "Final winner selected manually. Equb is now completed", 
        winner: participant 
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Select a winner automatically for an Equb
export const selectAutomaticWinner = async (req, res) => {
  try {
    const { equbId } = req.params;
    
    // Verify equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Check if equb is automatic
    if (equb.equbType !== "Automatic") {
      return res.status(400).json({ message: "This is not an automatic Equb" });
    }

    // Find the active cycle
    const cycle = await CycleManagement.findOne({
      equb: equbId,
      status: "Active",
    });

    if (!cycle) {
      return res.status(404).json({ message: "No active cycle found for this Equb" });
    }

    // Check if a winner has already been selected for this cycle
    const existingWinner = await Winner.findOne({
      equb: equbId,
      cycleNumber: cycle.currentCycleNumber
    });

    if (existingWinner) {
      return res.status(400).json({ message: "A winner has already been selected for this cycle" });
    }

    // Find all participants who haven't won yet
    const previousWinners = await Winner.find({ equb: equbId }).distinct('participant');
    
    const eligibleParticipants = await Participant.find({
      equb: equbId,
      status: "Accepted",
      _id: { $nin: previousWinners }
    });

    if (eligibleParticipants.length === 0) {
      return res.status(400).json({ message: "No eligible participants left" });
    }

    // Randomly select a winner
    const winnerIndex = Math.floor(Math.random() * eligibleParticipants.length);
    const selectedParticipant = eligibleParticipants[winnerIndex];

    // Save the winner
    const winner = new Winner({
      equb: equbId,
      participant: selectedParticipant._id,
      user: selectedParticipant.user,
      cycleNumber: cycle.currentCycleNumber,
      winDate: new Date(),
      readBy: [] // Initialize empty readBy array
    });

    await winner.save();

    // Complete the current cycle
    cycle.status = "Completed";
    cycle.endDate = new Date();
    await cycle.save();

    // Start the next cycle if not all participants have won
    if (previousWinners.length + 1 < equb.numberOfParticipants) {
      // Create a new cycle
      const nextCycleNumber = cycle.currentCycleNumber + 1;
      const nextDrawDate = calculateNextDrawDate(equb.cycle);

      const newCycle = new CycleManagement({
        equb: equbId,
        startDate: new Date(),
        status: "Active",
        currentCycleNumber: nextCycleNumber,
        nextDrawDate,
      });

      await newCycle.save();

      return res.status(200).json({ 
        message: "Winner selected and new cycle started automatically", 
        winner: selectedParticipant,
        newCycle
      });
    } else {
      // All participants have won, complete the Equb
      equb.status = "Completed";
      await equb.save();

      return res.status(200).json({ 
        message: "Final winner selected. Equb is now completed", 
        winner: selectedParticipant 
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check all cycles for automatic winner selection (for scheduled jobs)
export const processAutomaticWinners = async (req, res) => {
  try {
    // Find all active cycles that are past their nextDrawDate
    const now = new Date();
    const activeCycles = await CycleManagement.find({
      status: "Active",
      nextDrawDate: { $lte: now }
    }).populate("equb");

    if (activeCycles.length === 0) {
      return res.status(200).json({ message: "No cycles ready for automatic winner selection" });
    }

    const results = [];

    for (const cycle of activeCycles) {
      // Skip if not an automatic Equb
      if (cycle.equb.equbType !== "Automatic") {
        continue;
      }

      // Process automatic winner selection
      try {
        // Check if a winner has already been selected for this cycle
        const existingWinner = await Winner.findOne({
          equb: cycle.equb._id,
          cycleNumber: cycle.currentCycleNumber
        });

        if (existingWinner) {
          results.push({ 
            equbId: cycle.equb._id, 
            status: "skipped", 
            message: "Winner already selected for this cycle" 
          });
          continue;
        }

        // Find all participants who haven't won yet
        const previousWinners = await Winner.find({ equb: cycle.equb._id }).distinct('participant');
        
        const eligibleParticipants = await Participant.find({
          equb: cycle.equb._id,
          status: "Accepted",
          _id: { $nin: previousWinners }
        });

        if (eligibleParticipants.length === 0) {
          results.push({ 
            equbId: cycle.equb._id, 
            status: "error", 
            message: "No eligible participants left" 
          });
          continue;
        }

        // Randomly select a winner
        const winnerIndex = Math.floor(Math.random() * eligibleParticipants.length);
        const selectedParticipant = eligibleParticipants[winnerIndex];

        // Save the winner
        const winner = new Winner({
          equb: cycle.equb._id,
          participant: selectedParticipant._id,
          user: selectedParticipant.user,
          cycleNumber: cycle.currentCycleNumber,
          winDate: now,
          readBy: [] // Initialize empty readBy array
        });

        await winner.save();

        // Complete current cycle
        cycle.status = "Completed";
        cycle.endDate = now;
        await cycle.save();

        // Check if all participants have won
        if (previousWinners.length + 1 < cycle.equb.numberOfParticipants) {
          // Start a new cycle
          const nextCycleNumber = cycle.currentCycleNumber + 1;
          const nextDrawDate = calculateNextDrawDate(cycle.equb.cycle);

          const newCycle = new CycleManagement({
            equb: cycle.equb._id,
            startDate: now,
            status: "Active",
            currentCycleNumber: nextCycleNumber,
            nextDrawDate,
          });

          await newCycle.save();

          results.push({ 
            equbId: cycle.equb._id, 
            status: "success", 
            message: "Winner selected and new cycle started automatically",
            winner: selectedParticipant._id,
            newCycleNumber: nextCycleNumber
          });
        } else {
          // Complete the Equb
          const equb = cycle.equb;
          equb.status = "Completed";
          await equb.save();

          results.push({ 
            equbId: cycle.equb._id, 
            status: "success", 
            message: "Final winner selected. Equb is now completed",
            winner: selectedParticipant._id
          });
        }
      } catch (error) {
        results.push({ 
          equbId: cycle.equb._id, 
          status: "error", 
          message: error.message 
        });
      }
    }

    res.status(200).json({ 
      message: "Automatic winner selection process completed", 
      results 
    });
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