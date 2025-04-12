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
    // Check if user is admin (assuming role field in user model)
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized - Admin access required' });
    }
    
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
    
    // Check if user is admin or the Equb creator
    const isAdmin = req.user.role === 'Admin';
    const isCreator = complaint.equb.creator.toString() === userId;
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Unauthorized to resolve this complaint' });
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
    
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized - Admin access required' });
    }
    
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