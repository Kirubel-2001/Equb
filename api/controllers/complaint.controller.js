import Complaint from '../models/complaint.model.js';
import Equb from '../models/equb.model.js';
import Participant from '../models/participant.model.js';

// Create a new complaint
export const createComplaint = async (req, res) => {
  try {
    const { equbId, message } = req.body;
    const userId = req.user.userId; // Assuming user ID is available from auth middleware

    // Check if Equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: 'Equb not found' });
    }

    // Check if user is a participant in the Equb using Participant model
    const isParticipant = await Participant.findOne({
      equb: equbId,
      user: userId,
      status: 'Accepted'
    });
    if (!isParticipant) {
      return res.status(403).json({ message: 'You must be a participant of this Equb to submit a complaint' });
    }

    // Create the complaint
    const complaint = new Complaint({
      equb: equbId,
      user: userId,
      message
    });

    await complaint.save();
    res.status(201).json(complaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all complaints for a user
export const getUserComplaints = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const complaints = await Complaint.find({ user: userId })
      .populate('equb', 'name')
      .sort({ dateSubmitted: -1 });
    
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error getting user complaints:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all complaints for an Equb (for Equb creators)
export const getEqubComplaints = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;
    
    // Check if user is the creator of the Equb
    const equb = await Equb.findOne({ _id: equbId, creator: userId });
    if (!equb) {
      return res.status(403).json({ message: 'You must be the creator of this Equb to view complaints' });
    }
    
    const complaints = await Complaint.find({ equb: equbId })
      .populate('user', 'firstName lastName')
      .populate('equb', 'name') 
      .sort({ dateSubmitted: -1 });
    
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error getting Equb complaints:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all complaints (for admin)
export const getAllComplaints = async (req, res) => {
  try {
   
    
    const complaints = await Complaint.find()
      .populate('user', 'firstName lastName')
      .populate('equb', 'name')
      .sort({ dateSubmitted: -1 });
    
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error getting all complaints:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Resolve a complaint (for Equb creators and admins)
export const resolveComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { response } = req.body;
    const userId = req.user.userId;
    
    const complaint = await Complaint.findById(complaintId).populate('equb');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    
    
    complaint.status = 'Resolved';
    complaint.response = response;
    complaint.dateResolved = Date.now();
    
    await complaint.save();
    
    res.status(200).json(complaint);
  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a complaint (admin only)
export const deleteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    
    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    await Complaint.findByIdAndDelete(complaintId);
    
    res.status(200).json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark a single complaint as read
export const markComplaintAsRead = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const userId = req.user.userId;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Check if user already read this complaint
    const alreadyRead = 
      complaint.readBy?.some((reader) => reader.user.toString() === userId) ||
      false;

    if (!alreadyRead) {
      // Initialize readBy if it doesn't exist
      if (!complaint.readBy) {
        complaint.readBy = [];
      }

      // Add user to readBy array
      complaint.readBy.push({
        user: userId,
        readAt: new Date(),
      });

      await complaint.save();
    }

    res.status(200).json({ message: "Complaint marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all complaints in an Equb as read
export const markAllComplaintsAsRead = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;

    // Verify equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Check if user is the creator of the Equb
    const isCreator = equb.creator.toString() === userId;
    if (!isCreator) {
      return res.status(403).json({ message: "Only Equb creators can mark all complaints as read" });
    }

    // Get all complaints for this equb
    const complaints = await Complaint.find({ equb: equbId });

    // For each complaint, add the user to readBy if not already there
    const updateOperations = complaints.map((complaint) => {
      // Initialize readBy if it doesn't exist
      if (!complaint.readBy) {
        complaint.readBy = [];
      }

      const alreadyRead = complaint.readBy.some(
        (reader) => reader.user.toString() === userId
      );

      if (!alreadyRead) {
        complaint.readBy.push({
          user: userId,
          readAt: new Date(),
        });
        return complaint.save();
      }
      return Promise.resolve();
    });

    await Promise.all(updateOperations);

    res.status(200).json({ message: "All complaints marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get read status of complaints for a user
export const getComplaintReadStatus = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;

    // Verify equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Check if user is the creator of the Equb
    const isCreator = equb.creator.toString() === userId;
    if (!isCreator) {
      return res.status(403).json({ message: "Only Equb creators can view complaint read status" });
    }

    // Get all complaints for this equb
    const complaints = await Complaint.find({ equb: equbId });

    // Count total and unread complaints
    const total = complaints.length;
    const unread = complaints.filter(
      (complaint) =>
        !complaint.readBy ||
        !complaint.readBy.some((reader) => reader.user.toString() === userId)
    ).length;

    res.status(200).json({
      total,
      unread,
      read: total - unread,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};