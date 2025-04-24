import CycleManagement from "../models/cycle.model.js";
import Equb from "../models/equb.model.js";
import Participant from "../models/participant.model.js";

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

// Start a new Equb cycle
export const startCycle = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId; // Assuming user ID is available from auth middleware

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
    let nextDrawDate = new Date();
    switch (equb.cycle) {
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
    const userId = req.user.userId; // Assuming user ID is available from auth middleware

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

    // Update cycle
    cycle.status = "Completed";
    cycle.endDate = new Date();
    await cycle.save();

    // Update Equb status
    equb.status = "Completed";
    await equb.save();

    res.status(200).json({ message: "Cycle completed successfully", cycle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Request to restart a cycle
export const requestRestartCycle = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId; // Assuming user ID is available from auth middleware

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
