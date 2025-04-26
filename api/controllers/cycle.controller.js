import CycleManagement from "../models/cycle.model.js";
import Equb from "../models/equb.model.js";
import Participant from "../models/participant.model.js";
import Winner from "../models/winner.model.js";

// Get all cycles
export const getAllCycles = async (req, res) => {
  try {
    const cycles = await CycleManagement.find().populate("equb", "name");
    res.status(200).json(cycles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get cycle information by Equb ID
export const getCycleByEqub = async (req, res) => {
  try {
    const { equbId } = req.params;
    const cycle = await CycleManagement.findOne({ equb: equbId }).sort({
      createdAt: -1,
    });

    if (!cycle) {
      return res.status(404).json({ message: "No cycle found for this Equb" });
    }

    res.status(200).json(cycle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate next draw date
const calculateNextDrawDate = (cycle) => {
  const nextDrawDate = new Date();
  switch (cycle) {
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

// Start a new Equb cycle
export const startCycle = async (req, res) => {
  try {
    const { equbId } = req.params;
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
        .json({ message: "Only Equb creators can start cycles" });
    }

    // Check if there's an existing active cycle
    const existingCycle = await CycleManagement.findOne({
      equb: equbId,
      status: "Active",
    });

    if (existingCycle) {
      return res
        .status(400)
        .json({ message: "An active cycle already exists for this Equb" });
    }

    // Count accepted participants
    const participantCount = await Participant.countDocuments({
      equb: equbId,
      status: "Accepted",
    });

    if (participantCount < equb.numberOfParticipants) {
      return res.status(400).json({
        message: `Not enough participants to start cycle. Need ${equb.numberOfParticipants}, have ${participantCount}`,
      });
    }

    // Calculate the nextDrawDate based on cycle type
    const nextDrawDate = calculateNextDrawDate(equb.cycle);

    // Create new cycle
    const cycle = new CycleManagement({
      equb: equbId,
      startDate: new Date(),
      status: "Active",
      currentCycleNumber: 1,
      nextDrawDate,
    });

    await cycle.save();

    // Update Equb status to Active
    equb.status = "Active";
    await equb.save();

    res.status(201).json({ message: "Cycle started successfully", cycle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete a cycle
export const completeCycle = async (req, res) => {
  try {
    const { equbId } = req.params;
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
        .json({ message: "Only Equb creators can complete cycles" });
    }

    // Find the active cycle
    const cycle = await CycleManagement.findOne({
      equb: equbId,
      status: "Active",
    });

    if (!cycle) {
      return res
        .status(404)
        .json({ message: "No active cycle found for this Equb" });
    }

    // Check if a winner has been selected for this cycle
    const winnerExists = await Winner.findOne({
      equb: equbId,
      cycleNumber: cycle.currentCycleNumber
    });

    if (!winnerExists) {
      return res.status(400).json({ 
        message: "Cannot complete cycle without selecting a winner first" 
      });
    }

    // Update cycle
    cycle.status = "Completed";
    cycle.endDate = new Date();
    await cycle.save();

    // Check if this was the last cycle
    const totalWinners = await Winner.countDocuments({ equb: equbId });
    
    if (totalWinners >= equb.numberOfParticipants) {
      // Update Equb status to Completed
      equb.status = "Completed";
      await equb.save();
      
      return res.status(200).json({ 
        message: "Final cycle completed. Equb is now finished.",
        cycle 
      });
    } else {
      // Start a new cycle automatically if equbType is Automatic
      if (equb.equbType === "Automatic") {
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
          message: "Cycle completed and new cycle started automatically", 
          completedCycle: cycle,
          newCycle 
        });
      } else {
        // For manual Equbs, just complete the current cycle
        return res.status(200).json({ 
          message: "Cycle completed successfully. You can now start a new cycle.", 
          cycle 
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Switch Equb type (from Manual to Automatic)
export const switchEqubType = async (req, res) => {
  try {
    const { equbId } = req.params;
    const { newType } = req.body;
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
        .json({ message: "Only Equb creators can change the equb type" });
    }

    // Validate new type
    if (newType !== "Automatic" && newType !== "Manual") {
      return res.status(400).json({ message: "Invalid equb type" });
    }

    equb.equbType = newType;
    await equb.save();

    res.status(200).json({ 
      message: `Equb type successfully changed to ${newType}`,
      equb 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Request to restart a cycle
export const requestRestartCycle = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;

    // Verify user is a participant in this Equb
    const isParticipant = await Participant.findOne({
      equb: equbId,
      user: userId,
      status: "Accepted",
    });

    if (!isParticipant) {
      return res
        .status(403)
        .json({ message: "Only participants can request cycle restart" });
    }

    // Find the most recent cycle
    const cycle = await CycleManagement.findOne({
      equb: equbId,
    }).sort({ createdAt: -1 });

    if (!cycle) {
      return res.status(404).json({ message: "No cycle found for this Equb" });
    }

    if (cycle.status === "Active") {
      return res
        .status(400)
        .json({ message: "Cannot request restart for an active cycle" });
    }

    // Increment restart requests
    cycle.restartRequests += 1;
    await cycle.save();

    res
      .status(200)
      .json({
        message: "Restart request recorded",
        restartRequests: cycle.restartRequests,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if it's time to select a winner automatically
export const checkAutoDrawDates = async (req, res) => {
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
        results.push({ 
          equbId: cycle.equb._id, 
          status: "skipped", 
          message: "Not an automatic equb" 
        });
        continue;
      }

      results.push({ 
        equbId: cycle.equb._id, 
        status: "ready", 
        message: "Ready for automatic winner selection" 
      });
    }

    res.status(200).json({ 
      message: "Automatic winner check completed", 
      results 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};