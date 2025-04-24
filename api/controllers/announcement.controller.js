import Announcement from "../models/announcement.model.js";
import Equb from "../models/equb.model.js";

// Get all announcements
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("equb", "name")
      .populate("createdBy", "firstName lastName")
      .sort({ dateCreated: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get announcements by Equb ID
export const getAnnouncementsByEqub = async (req, res) => {
  try {
    const { equbId } = req.params;
    const announcements = await Announcement.find({
      equb: equbId,
      isActive: true,
    })
      .populate("createdBy", "firstName lastName")
      .sort({ dateCreated: -1 });

    res.status(200).json(announcements);
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
    const userId = req.user.userId; // Assuming user ID is available from auth middleware

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
    const userId = req.user.userId; // Assuming user ID is available from auth middleware

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
