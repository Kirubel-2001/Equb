import Announcement from "../models/announcement.model.js";
import Equb from "../models/equb.model.js";

// Get all announcements
export const getAllAnnouncements = async (req, res) => {
  try {
    const userId = req.user.userId;
    const announcements = await Announcement.find()
      .populate("equb", "name")
      .populate("createdBy", "firstName lastName")
      .sort({ dateCreated: -1 });
    
    // Add isRead field to each announcement
    const announcementsWithReadStatus = announcements.map(announcement => {
      const isRead = announcement.readBy.some(reader => reader.user.toString() === userId);
      return {
        ...announcement.toObject(),
        isRead
      };
    });
    
    res.status(200).json(announcementsWithReadStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get announcements by Equb ID
export const getAnnouncementsByEqub = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;
    
    const announcements = await Announcement.find({
      equb: equbId,
      isActive: true,
    })
      .populate("createdBy", "firstName lastName")
      .sort({ dateCreated: -1 });

    // Add isRead field to each announcement
    const announcementsWithReadStatus = announcements.map(announcement => {
      const isRead = announcement.readBy.some(reader => reader.user.toString() === userId);
      return {
        ...announcement.toObject(),
        isRead
      };
    });

    res.status(200).json(announcementsWithReadStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { equbId } = req.params;
    const { message } = req.body;
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
        .json({ message: "Only Equb creators can post announcements" });
    }

    const announcement = new Announcement({
      equb: equbId,
      createdBy: userId,
      message,
      dateCreated: new Date(),
    });

    await announcement.save();

    res
      .status(201)
      .json({ message: "Announcement created successfully", announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    // Find the announcement
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Verify user is the creator of the announcement
    if (announcement.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own announcements" });
    }

    announcement.message = message;
    await announcement.save();

    res
      .status(200)
      .json({ message: "Announcement updated successfully", announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete (deactivate) announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const userId = req.user.userId;

    // Find the announcement
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Verify user is the creator of the announcement
    if (announcement.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own announcements" });
    }

    // Soft delete by marking as inactive
    announcement.isActive = false;
    await announcement.save();

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark a single announcement as read
export const markAnnouncementAsRead = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const userId = req.user.userId;

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Check if user already read this announcement
    const alreadyRead = announcement.readBy.some(reader => 
      reader.user.toString() === userId
    );

    if (!alreadyRead) {
      // Add user to readBy array
      announcement.readBy.push({
        user: userId,
        readAt: new Date()
      });
      
      await announcement.save();
    }

    res.status(200).json({ message: "Announcement marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all announcements in an Equb as read
export const markAllAnnouncementsAsRead = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;

    // Verify equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Get all active announcements for this equb
    const announcements = await Announcement.find({
      equb: equbId,
      isActive: true
    });

    // For each announcement, add the user to readBy if not already there
    const updateOperations = announcements.map(announcement => {
      const alreadyRead = announcement.readBy.some(reader => 
        reader.user.toString() === userId
      );
      
      if (!alreadyRead) {
        announcement.readBy.push({
          user: userId,
          readAt: new Date()
        });
        return announcement.save();
      }
      return Promise.resolve();
    });

    await Promise.all(updateOperations);

    res.status(200).json({ message: "All announcements marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get read status of announcements for a user
export const getAnnouncementReadStatus = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user.userId;

    // Verify equb exists
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Get all active announcements for this equb
    const announcements = await Announcement.find({
      equb: equbId,
      isActive: true
    });
    
    // Count total and unread announcements
    const total = announcements.length;
    const unread = announcements.filter(announcement => 
      !announcement.readBy.some(reader => reader.user.toString() === userId)
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