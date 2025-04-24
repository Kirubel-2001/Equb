import Attendance from "../models/attendance.model.js";
import Equb from "../models/equb.model.js";
import User from "../models/user.model.js";

// Get all attendance records
export const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate("equb", "name")
      .populate("user", "firstName lastName");
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance records by Equb ID
export const getAttendanceByEqub = async (req, res) => {
  try {
    const { equbId } = req.params;
    const attendance = await Attendance.find({ equb: equbId })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record payment
export const recordPayment = async (req, res) => {
  try {
    const { equbId, userId } = req.params;

    // Find the existing attendance record
    let attendance = await Attendance.findOne({ equb: equbId, user: userId });

    if (!attendance) {
      // Create new attendance record if it doesn't exist
      attendance = new Attendance({
        equb: equbId,
        user: userId,
        paymentStatus: "Paid",
        paymentDate: new Date(),
        missedPayments: 0,
      });
    } else {
      // Update existing record
      attendance.paymentStatus = "Paid";
      attendance.paymentDate = new Date();
    }

    await attendance.save();

    res
      .status(200)
      .json({ message: "Payment recorded successfully", attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark as missed payment
export const markMissedPayment = async (req, res) => {
  try {
    const { equbId, userId } = req.params;

    // Find the existing attendance record
    let attendance = await Attendance.findOne({ equb: equbId, user: userId });

    if (!attendance) {
      // Create new attendance record if it doesn't exist
      attendance = new Attendance({
        equb: equbId,
        user: userId,
        paymentStatus: "Not Paid",
        missedPayments: 1,
      });
    } else {
      // Update existing record
      attendance.paymentStatus = "Not Paid";
      attendance.missedPayments += 1;
    }

    await attendance.save();

    res.status(200).json({ message: "Missed payment recorded", attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment status for a user in an Equb
export const getPaymentStatus = async (req, res) => {
  try {
    const { equbId, userId } = req.params;

    const attendance = await Attendance.findOne({ equb: equbId, user: userId });

    if (!attendance) {
      return res.status(404).json({ message: "No attendance record found" });
    }

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
